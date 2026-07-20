/* cart.html — cart rendering, quantity controls, item removal */
document.addEventListener('DOMContentLoaded', () => {
  function renderCart(){
    const items = Cart.read();
    const layout = document.getElementById('cart-layout');
    const empty = document.getElementById('empty-state');
    const wrap = document.getElementById('cart-items');
    const rows = document.getElementById('summary-rows');
    const total = document.getElementById('summary-total');
    const checkoutBtn = document.getElementById('checkout-btn');

    if(!items.length){
      layout.style.display = 'none';
      empty.style.display = 'block';
      return;
    }
    layout.style.display = 'grid';
    empty.style.display = 'none';

    wrap.innerHTML = items.map(i => `
      <div class="card" style="display:flex;gap:18px;padding:18px;margin-bottom:16px;align-items:center;">
        <img src="${i.img}" alt="${i.name}" loading="lazy" style="width:96px;height:96px;object-fit:cover;border-radius:var(--radius-sm);">
        <div style="flex:1;">
          <span class="badge-soft" style="margin-bottom:6px;">${i.category}</span>
          <h3 style="font-size:1.05rem;">${i.name}</h3>
          <span class="price">${money(i.price)}</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <button class="btn btn-outline btn-sm" data-dec="${i.id}" aria-label="Decrease quantity">−</button>
          <span style="font-family:var(--f-mono);min-width:20px;text-align:center;">${i.qty}</span>
          <button class="btn btn-outline btn-sm" data-inc="${i.id}" aria-label="Increase quantity">+</button>
        </div>
        <button data-remove="${i.id}" aria-label="Remove item" style="background:none;border:none;color:var(--alert);font-size:1.2rem;">🗑</button>
      </div>`).join('');

    rows.innerHTML = items.map(i => `<div class="ticket-row"><span>${i.name} × ${i.qty}</span><span>${money(i.price * i.qty)}</span></div>`).join('');
    total.textContent = money(Cart.subtotal());
    checkoutBtn.textContent = `Proceed to Checkout (${Cart.count()})`;

    wrap.querySelectorAll('[data-inc]').forEach(b => b.addEventListener('click', () => {
      const it = items.find(i => i.id === Number(b.dataset.inc));
      Cart.setQty(it.id, it.qty + 1); renderCart();
    }));
    wrap.querySelectorAll('[data-dec]').forEach(b => b.addEventListener('click', () => {
      const it = items.find(i => i.id === Number(b.dataset.dec));
      if(it.qty <= 1){ Cart.remove(it.id); } else { Cart.setQty(it.id, it.qty - 1); }
      renderCart();
    }));
    wrap.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => {
      Cart.remove(Number(b.dataset.remove)); renderCart();
    }));
  }
  renderCart();
});
