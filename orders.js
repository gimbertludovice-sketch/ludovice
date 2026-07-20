/* orders.html — order history for the logged-in user, plus logout */
document.addEventListener('DOMContentLoaded', () => {
  const user = Auth.currentUser();
  const guestState = document.getElementById('guest-state');
  const accountState = document.getElementById('account-state');
  const emptyState = document.getElementById('orders-empty');
  const list = document.getElementById('orders-list');
  const nameEl = document.getElementById('account-name');
  const logoutBtn = document.getElementById('logout-btn');

  if(!user){
    guestState.style.display = 'block';
    accountState.style.display = 'none';
    return;
  }

  guestState.style.display = 'none';
  accountState.style.display = 'block';
  nameEl.textContent = user.fullname || user.username;

  const orders = Orders.forCurrentUser();
  if(!orders.length){
    emptyState.style.display = 'block';
    list.style.display = 'none';
  } else {
    emptyState.style.display = 'none';
    list.style.display = 'block';
    list.innerHTML = orders.map(o => `
      <div class="ticket" style="margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px;">
          <div>
            <b style="font-family:var(--f-mono);">${o.id}</b>
            <p style="font-size:.82rem;color:var(--slate);margin-top:2px;">${new Date(o.date).toLocaleString('en-PH', {dateStyle:'medium', timeStyle:'short'})}</p>
          </div>
          <span class="badge-soft">${o.status || 'Placed'}</span>
        </div>
        <div>${o.items.map(i => `<div class="ticket-row"><span>${i.name} × ${i.qty}</span><span>${money(i.price * i.qty)}</span></div>`).join('')}</div>
        <div class="ticket-row"><span>Shipping — ${o.shippingMethod || 'Standard'}</span><span>${o.shippingFee ? money(o.shippingFee) : 'Free'}</span></div>
        <div class="ticket-row total"><span>Total</span><span>${money(o.total)}</span></div>
        <div class="ticket__edge"></div>
      </div>`).join('');
  }

  logoutBtn.addEventListener('click', () => {
    Auth.logout();
    toast('Logged out.');
    setTimeout(() => location.href = 'index.html', 800);
  });
});
