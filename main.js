// ============ CART STORAGE ============
const Cart = {
  KEY: 'ludovice_cart_v1',
  
  read() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || [];
    } catch {
      return [];
    }
  },
  
  write(items) {
    localStorage.setItem(this.KEY, JSON.stringify(items));
    this.updateUI();
  },
  
  add(product, qty = 1) {
    const items = this.read();
    const existing = items.find(i => i.id === product.id);
    
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        category: product.category,
        categoryLabel: product.categoryLabel,
        price: product.price,
        img: product.img,
        qty: qty
      });
    }
    
    this.write(items);
    toast(`Added ${product.name} to cart`);
  },
  
  remove(id) {
    const items = this.read().filter(i => i.id !== id);
    this.write(items);
  },
  
  setQty(id, qty) {
    const items = this.read();
    const item = items.find(i => i.id === id);
    if (item) {
      item.qty = Math.max(1, qty);
      this.write(items);
    }
  },
  
  clear() {
    localStorage.setItem(this.KEY, '[]');
    this.updateUI();
  },
  
  count() {
    return this.read().reduce((sum, i) => sum + i.qty, 0);
  },
  
  subtotal() {
    return this.read().reduce((sum, i) => sum + (i.price * i.qty), 0);
  },
  
  updateUI() {
    const countEl = document.querySelector('[data-cart-count]');
    if (countEl) {
      countEl.textContent = this.count();
    }
  }
};

// ============ UTILITY FUNCTIONS ============
function money(num) {
  return '₱' + num.toLocaleString('en-PH', { minimumFractionDigits: 0 });
}

function starString(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '☆' : '') + '☆'.repeat(empty);
}

function toast(msg, duration = 3000) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  el.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 24px;
    background: var(--orange);
    color: #fff;
    padding: 12px 20px;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    z-index: 5000;
    animation: slideUp 0.3s ease;
  `;
  
  document.body.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

// ============ PAGE SETUP ============
document.addEventListener('DOMContentLoaded', () => {
  // Update cart count on page load
  Cart.updateUI();
  
  // Update year in footers
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
  
  // Mobile nav toggle
  const navToggle = document.querySelector('.nav__toggle');
  const navLinks = document.querySelector('.nav__links');
  
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });
    
    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.style.display = 'none';
      });
    });
  }
});

// ============ TOAST STYLES ============
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      transform: translateY(100px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);