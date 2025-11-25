// Lumeza site JS: handles product load, search, filters, cart, wishlist, and simple checkout via WhatsApp.
const PRODUCTS_URL = 'js/products.json';

let PRODUCTS = [];
let CART = JSON.parse(localStorage.getItem('lumeza_cart') || '[]');
let WISHLIST = JSON.parse(localStorage.getItem('lumeza_wishlist') || '[]');

function saveState(){
  localStorage.setItem('lumeza_cart', JSON.stringify(CART));
  localStorage.setItem('lumeza_wishlist', JSON.stringify(WISHLIST));
  updateCounts();
}

function updateCounts(){
  document.querySelectorAll('#cart-count, #cart-count-2, #cart-count-p').forEach(el=>{
    if(el) el.textContent = CART.reduce((s,i)=>s+i.qty,0);
  });
  document.querySelectorAll('#wish-count, #wish-count-2, #wish-count-p').forEach(el=>{
    if(el) el.textContent = WISHLIST.length;
  });
}

async function loadProducts(){
  try {
    const res = await fetch(PRODUCTS_URL);
    PRODUCTS = await res.json();
  } catch (e) {
    // fallback: try reading admin-saved products in localStorage (during dev)
    const saved = localStorage.getItem('lumeza_products_admin');
    if(saved) PRODUCTS = JSON.parse(saved);
    else PRODUCTS = [];
  }
  renderFeatured();
  renderProducts();
  renderProductDetailIfNeeded();
  updateCounts();
}

function renderFeatured(){
  const container = document.getElementById('featured-products');
  if(!container) return;
  const featured = PRODUCTS.slice(0,8);
  container.innerHTML = featured.map(p=>productCardHtml(p)).join('');
  attachCardEvents();
}

function productCardHtml(p){
  return `<div class="border rounded overflow-hidden">
    <a href="product.html?id=${encodeURIComponent(p.id)}" class="block">
      <img src="${p.images[0]}" alt="${p.title}" class="w-full h-48 object-cover"/>
      <div class="p-4">
        <div class="font-semibold">${p.title}</div>
        <div class="muted text-sm">₹${p.price}</div>
      </div>
    </a>
    <div class="p-3 border-t flex items-center justify-between">
      <button data-id="${p.id}" class="add-cart px-3 py-1 border rounded">Add</button>
      <button data-id="${p.id}" class="add-wish small">♡</button>
    </div>
  </div>`;
}

function attachCardEvents(){
  document.querySelectorAll('.add-cart').forEach(b=>{
    b.addEventListener('click', (e)=>{
      const id = e.target.dataset.id;
      addToCart(id,1);
    });
  });
  document.querySelectorAll('.add-wish').forEach(b=>{
    b.addEventListener('click', (e)=>{
      const id = e.target.dataset.id;
      toggleWishlist(id);
    });
  });
}

function renderProducts(){
  const grid = document.getElementById('product-grid');
  if(!grid) return;
  grid.innerHTML = filterAndSearch().map(p=>productCardHtml(p)).join('');
  attachCardEvents();
}

function filterAndSearch(){
  const query = document.getElementById('search') ? document.getElementById('search').value.toLowerCase() : '';
  const checks = Array.from(document.querySelectorAll('.filter-checkbox:checked')).map(i=>i.value);
  return PRODUCTS.filter(p=>{
    if(checks.length && !checks.includes(p.category)) return false;
    if(query && !(p.title.toLowerCase().includes(query) || p.description.toLowerCase().includes(query) || p.material.toLowerCase().includes(query))) return false;
    return true;
  });
}

function addToCart(id, qty=1){
  const prod = PRODUCTS.find(p=>p.id===id);
  if(!prod) return alert('Product not found');
  const existing = CART.find(i=>i.id===id);
  if(existing){ existing.qty += qty; } else CART.push({id, qty, price: prod.price, title: prod.title});
  saveState();
  alert('Added to cart');
  renderProducts();
}

function toggleWishlist(id){
  const idx = WISHLIST.indexOf(id);
  if(idx===-1) WISHLIST.push(id); else WISHLIST.splice(idx,1);
  saveState();
  alert('Wishlist updated');
  renderProducts();
}

function renderProductDetailIfNeeded(){
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if(!id) return;
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p) return;
  const img = document.getElementById('prod-img');
  const title = document.getElementById('prod-title');
  const price = document.getElementById('prod-price');
  const desc = document.getElementById('prod-desc');
  const specs = document.getElementById('prod-specs');
  const wa = document.getElementById('wa-buy');
  if(img) img.src = p.images[0];
  if(title) title.textContent = p.title;
  if(price) price.textContent = '₹' + p.price;
  if(desc) desc.textContent = p.description;
  if(specs){
    specs.innerHTML = '';
    ['material','dimensions','weight','sku'].forEach(k=>{
      if(p[k]) specs.innerHTML += `<li>${k}: ${p[k]}</li>`;
    });
  }
  if(wa) wa.href = `https://wa.me/+917983233092?text=${encodeURIComponent('Hello Lumeza, I want info about '+p.title)}`;
  document.getElementById('add-to-cart')?.addEventListener('click', ()=> addToCart(p.id,1));
  document.getElementById('add-wish')?.addEventListener('click', ()=> toggleWishlist(p.id));
}

function renderCart(){
  const container = document.getElementById('cart-items');
  if(!container) return;
  if(CART.length===0){ container.innerHTML = '<div class="muted">Your cart is empty.</div>'; document.getElementById('cart-total').textContent='Total: ₹0'; return; }
  container.innerHTML = CART.map(item=>{
    const prod = PRODUCTS.find(p=>p.id===item.id) || {title:item.title, price:item.price};
    return `<div class="p-4 border rounded mb-3 flex justify-between items-center">
      <div>
        <div class="font-semibold">${prod.title}</div>
        <div class="muted text-sm">₹${prod.price} x ${item.qty}</div>
      </div>
      <div>
        <button data-id="${item.id}" class="inc px-3 py-1 border rounded">+</button>
        <button data-id="${item.id}" class="dec px-3 py-1 border rounded">-</button>
        <button data-id="${item.id}" class="remove px-3 py-1 border rounded">Remove</button>
      </div>
    </div>`;
  }).join('');
  attachCartEvents();
  const total = CART.reduce((s,i)=> s + (i.qty * i.price), 0);
  document.getElementById('cart-total').textContent = 'Total: ₹' + total;
}

function attachCartEvents(){
  document.querySelectorAll('.inc').forEach(b=> b.addEventListener('click', (e)=>{
    const id = e.target.dataset.id; const it = CART.find(x=>x.id===id); if(it){ it.qty+=1; saveState(); renderCart(); }
  }));
  document.querySelectorAll('.dec').forEach(b=> b.addEventListener('click', (e)=>{
    const id = e.target.dataset.id; const it = CART.find(x=>x.id===id); if(it){ it.qty = Math.max(1,it.qty-1); saveState(); renderCart(); }
  }));
  document.querySelectorAll('.remove').forEach(b=> b.addEventListener('click', (e)=>{
    const id = e.target.dataset.id; CART = CART.filter(x=>x.id!==id); saveState(); renderCart();
  }));
}

document.addEventListener('DOMContentLoaded', async ()=>{
  await loadProducts();
  document.getElementById('search')?.addEventListener('input', renderProducts);
  document.querySelectorAll('.filter-checkbox')?.forEach(cb=> cb.addEventListener('change', renderProducts));
  document.getElementById('contact-form')?.addEventListener('submit', (e)=>{ e.preventDefault(); alert('Thanks! We will contact you on WhatsApp.'); });
  document.getElementById('checkout-form')?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = new FormData(e.target);
    const msg = `New order from ${data.get('name')}, phone ${data.get('phone')}. Shipping: ${data.get('address')}.`;
    // Save order snapshot locally for admin preview
    const orders = JSON.parse(localStorage.getItem('lumeza_orders') || '[]');
    orders.push({name:data.get('name'), phone:data.get('phone'), items:CART, address:data.get('address'), created: new Date().toISOString()});
    localStorage.setItem('lumeza_orders', JSON.stringify(orders));
    window.open('https://wa.me/+917983233092?text=' + encodeURIComponent(msg), '_blank');
  });
  renderCart();
  updateCounts();
});
