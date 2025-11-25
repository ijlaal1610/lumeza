// Simple admin for Lumeza: load/edit products JSON, export, and preview orders from localStorage.
const LIST = document.getElementById('product-list');
const LOAD_BTN = document.getElementById('load-btn');
const FILE_INPUT = document.getElementById('file-input');
const NEW_BTN = document.getElementById('new-btn');
const EXPORT_BTN = document.getElementById('export-btn');
const SAVE_LOCAL_BTN = document.getElementById('save-local-btn');
const ORDERS_DIV = document.getElementById('orders');
const DOWNLOAD_DB_BTN = document.getElementById('download-db-btn');

let PRODUCTS = [];

// utility to create element
function el(html){ const div = document.createElement('div'); div.innerHTML = html; return div.firstElementChild; }

function renderList(){
  LIST.innerHTML = '';
  PRODUCTS.forEach((p, idx) => {
    const node = el(`
      <div class="p-4 border rounded">
        <div class="flex justify-between items-start">
          <div>
            <div contenteditable="true" data-field="title" data-idx="${idx}" class="font-semibold">${escapeHtml(p.title||'')}</div>
            <div class="muted text-sm" contenteditable="true" data-field="category" data-idx="${idx}">${escapeHtml(p.category||'')}</div>
            <div class="text-sm mt-2" contenteditable="true" data-field="description" data-idx="${idx}">${escapeHtml(p.description||'')}</div>
          </div>
          <div class="text-right">
            <div class="muted">₹ <span contenteditable="true" data-field="price" data-idx="${idx}">${p.price||0}</span></div>
            <div class="mt-3 space-x-2">
              <button data-action="save" data-idx="${idx}" class="px-3 py-1 border rounded">Save</button>
              <button data-action="delete" data-idx="${idx}" class="px-3 py-1 border rounded text-red-600">Delete</button>
            </div>
          </div>
        </div>
      </div>
    `);
    LIST.appendChild(node);
  });
  attachInlineEvents();
}

function attachInlineEvents(){
  LIST.querySelectorAll('[data-action="save"]').forEach(b=>{
    b.addEventListener('click', (e)=>{
      const idx = +e.target.dataset.idx;
      const fields = LIST.querySelectorAll('[data-idx="'+idx+'"]');
      fields.forEach(f=>{
        const key = f.dataset.field;
        PRODUCTS[idx][key] = f.textContent.trim();
      });
      alert('Saved entry locally.');
    });
  });
  LIST.querySelectorAll('[data-action="delete"]').forEach(b=>{
    b.addEventListener('click', (e)=>{
      const idx = +e.target.dataset.idx;
      if(confirm('Delete this product?')){ PRODUCTS.splice(idx,1); renderList(); }
    });
  });
}

function escapeHtml(s){ return (s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

LOAD_BTN.addEventListener('click', async ()=>{
  try {
    const res = await fetch('/js/products.json');
    if(!res.ok) throw new Error('Not found');
    PRODUCTS = await res.json();
    renderList();
    alert('Loaded products.json from site root.');
    loadOrders();
  } catch(err){
    alert('Could not load /js/products.json. Use import.');
  }
});

FILE_INPUT.addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (ev)=>{
    try{
      PRODUCTS = JSON.parse(ev.target.result);
      renderList();
      alert('Imported products JSON.');
    }catch(err){ alert('Invalid JSON file.'); }
  };
  reader.readAsText(file);
});

NEW_BTN.addEventListener('click', ()=>{
  const id = 'p_' + Math.random().toString(36).slice(2,9);
  PRODUCTS.unshift({id, title:'New Product', category:'Uncategorized', price:0, description:'', images:[], sku:'', inventory:0});
  renderList();
});

EXPORT_BTN.addEventListener('click', ()=>{
  const data = JSON.stringify(PRODUCTS, null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'products.json';
  a.click();
  URL.revokeObjectURL(url);
});

SAVE_LOCAL_BTN.addEventListener('click', ()=>{
  localStorage.setItem('lumeza_products_admin', JSON.stringify(PRODUCTS));
  alert('Saved products to localStorage (key: lumeza_products_admin). Use this when previewing locally.');
});

DOWNLOAD_DB_BTN.addEventListener('click', ()=>{
  const orders = localStorage.getItem('lumeza_orders') || localStorage.getItem('lumeza_cart') || '[]';
  const blob = new Blob([orders], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'orders.json';
  a.click();
  URL.revokeObjectURL(url);
});

function loadOrders(){
  const orders = JSON.parse(localStorage.getItem('lumeza_orders') || '[]');
  if(!orders || orders.length === 0){
    ORDERS_DIV.textContent = 'No orders yet.';
    return;
  }
  ORDERS_DIV.innerHTML = orders.map(o => `<div class="mb-2"><strong>${o.name}</strong> — ${o.phone} — ${new Date(o.created).toLocaleString()}</div>`).join('');
  localStorage.setItem('lumeza_orders', JSON.stringify(orders));
}

// initial render: try to read saved admin products
document.addEventListener('DOMContentLoaded', ()=>{
  const saved = localStorage.getItem('lumeza_products_admin');
  if(saved){
    try{ PRODUCTS = JSON.parse(saved); renderList(); }catch(e){}
  }
  loadOrders();
});
