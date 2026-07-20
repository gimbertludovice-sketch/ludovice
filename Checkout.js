/* checkout.html — order summary, totals, and placing the order into history */
document.addEventListener('DOMContentLoaded', () => {
  const items = Cart.read();
  if(!items.length){ location.href = 'cart.html'; return; }

  document.getElementById('order-products').innerHTML = items.map(i => `${i.qty} × ${i.name}`).join('<br>');
  document.getElementById('co-summary-rows').innerHTML = items.map(i => `<div class="ticket-row"><span>${i.name} × ${i.qty}</span><span>${money(i.price*i.qty)}</span></div>`).join('');

  const shippingSelect = document.getElementById('co-shipping');
  const shippingFeeEl = document.getElementById('co-shipping-fee');
  const totalEl = document.getElementById('co-total');

  function updateTotal(){
    const fee = Number(shippingSelect.selectedOptions[0].dataset.fee);
    shippingFeeEl.textContent = fee === 0 ? 'Free' : money(fee);
    totalEl.textContent = money(Cart.subtotal() + fee);
  }
  shippingSelect.addEventListener('change', updateTotal);
  updateTotal();

  // Pre-fill customer info if the visitor is logged in
  const user = Auth.currentUser();
  if(user){
    if(user.fullname) document.getElementById('co-name').value = user.fullname;
    if(user.email) document.getElementById('co-email').value = user.email;
    if(user.phone) document.getElementById('co-phone').value = user.phone;
    if(user.address) document.getElementById('co-address').value = user.address;
  }

  document.getElementById('checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if(!e.target.checkValidity()){ e.target.reportValidity(); return; }

    const fee = Number(shippingSelect.selectedOptions[0].dataset.fee);

    const order = {
      id: 'LDV-' + Date.now().toString(36).toUpperCase(),
      date: new Date().toISOString(),
      username: user ? user.username : null,
      customer: {
        name: document.getElementById('co-name').value.trim(),
        email: document.getElementById('co-email').value.trim(),
        phone: document.getElementById('co-phone').value.trim(),
        address: document.getElementById('co-address').value.trim()
      },
      items,
      shippingMethod: shippingSelect.selectedOptions[0].textContent,
      shippingFee: fee,
      payment: document.querySelector('input[name="payment"]:checked').value,
      total: Cart.subtotal() + fee,
      status: 'Placed'
    };
    Orders.save(order);

    Cart.clear();
    document.getElementById('confirm-modal').style.display = 'flex';
  });
});
