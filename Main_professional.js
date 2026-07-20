/**
 * ============================================================================
 * LUDOVICE PROFESSIONAL BUSINESS SYSTEM v2.0
 * ============================================================================
 * Advanced Restaurant Management & E-Commerce Platform
 * Built for: LUDOVICE Kitchen & Table
 * Author: Gimbert Ludovice
 * Status: Enterprise Grade
 * ============================================================================
 */

// ============ CONFIGURATION ============
const CONFIG = {
  APP_NAME: 'LUDOVICE Kitchen & Table',
  VERSION: '2.0',
  ENVIRONMENT: 'production',
  STORAGE_VERSION: 'v2',
  LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
  MAX_CART_ITEMS: 100,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  CURRENCY: 'PHP',
  CURRENCY_SYMBOL: '₱'
};

// ============ LOGGER MODULE ============
const Logger = {
  logs: [],
  
  log(level, module, message, data = null) {
    const timestamp = new Date().toISOString();
    const entry = { timestamp, level, module, message, data };
    
    this.logs.push(entry);
    
    // Console output
    const styles = {
      debug: 'color: #666',
      info: 'color: #0066cc',
      warn: 'color: #ff9900',
      error: 'color: #cc0000'
    };
    
    console.log(`%c[${level.toUpperCase()}] ${module}: ${message}`, styles[level] || '');
    if (data) console.table(data);
  },
  
  debug(module, message, data) { this.log('debug', module, message, data); },
  info(module, message, data) { this.log('info', module, message, data); },
  warn(module, message, data) { this.log('warn', module, message, data); },
  error(module, message, data) { this.log('error', module, message, data); },
  
  export() {
    return JSON.stringify(this.logs, null, 2);
  }
};

// ============ STORAGE MODULE ============
const Storage = {
  prefix: `ludovice_${CONFIG.STORAGE_VERSION}_`,
  
  set(key, data) {
    try {
      const fullKey = this.prefix + key;
      const value = typeof data === 'string' ? data : JSON.stringify(data);
      localStorage.setItem(fullKey, value);
      Logger.debug('Storage', `Saved: ${key}`);
      return { ok: true };
    } catch (e) {
      Logger.error('Storage', `Save failed: ${key}`, e);
      return { ok: false, error: e.message };
    }
  },
  
  get(key, defaultValue = null) {
    try {
      const fullKey = this.prefix + key;
      const value = localStorage.getItem(fullKey);
      
      if (value === null) return defaultValue;
      
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (e) {
      Logger.error('Storage', `Read failed: ${key}`, e);
      return defaultValue;
    }
  },
  
  remove(key) {
    try {
      const fullKey = this.prefix + key;
      localStorage.removeItem(fullKey);
      Logger.debug('Storage', `Removed: ${key}`);
      return { ok: true };
    } catch (e) {
      Logger.error('Storage', `Remove failed: ${key}`, e);
      return { ok: false, error: e.message };
    }
  },
  
  clear() {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      Logger.info('Storage', 'Cleared all data');
      return { ok: true };
    } catch (e) {
      Logger.error('Storage', 'Clear failed', e);
      return { ok: false, error: e.message };
    }
  }
};

// ============ VALIDATION MODULE ============
const Validator = {
  email(value) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return { valid: regex.test(value), error: 'Invalid email format' };
  },
  
  phone(value) {
    const regex = /^[\d\s+()]{7,14}$/;
    return { valid: regex.test(value), error: 'Invalid phone format' };
  },
  
  password(value) {
    const minLength = value.length >= 8;
    const hasNumber = /\d/.test(value);
    const hasLetter = /[a-zA-Z]/.test(value);
    const valid = minLength && hasNumber && hasLetter;
    return {
      valid,
      error: valid ? null : 'Password must be 8+ chars with letters and numbers'
    };
  },
  
  username(value) {
    const regex = /^[a-zA-Z0-9_]{4,20}$/;
    return { valid: regex.test(value), error: 'Username: 4-20 chars, alphanumeric + underscore' };
  },
  
  required(value) {
    const valid = value && value.toString().trim().length > 0;
    return { valid, error: 'This field is required' };
  }
};

// ============ AUTH MODULE ============
const Auth = {
  USERS_KEY: 'users',
  CURRENT_USER_KEY: 'current_user',
  SESSION_KEY: 'session_token',
  
  init() {
    // Check session validity
    const session = Storage.get(this.SESSION_KEY);
    if (session && session.expires < Date.now()) {
      this.logout();
    }
  },
  
  register(userData) {
    Logger.info('Auth', 'Registration attempt', { username: userData.username });
    
    // Validate required fields
    const validations = {
      username: Validator.username(userData.username),
      email: Validator.email(userData.email),
      password: Validator.password(userData.password),
      phone: Validator.phone(userData.phone),
      address: Validator.required(userData.address),
      fullname: Validator.required(userData.fullname)
    };
    
    for (const [field, result] of Object.entries(validations)) {
      if (!result.valid) {
        Logger.warn('Auth', `Validation failed: ${field}`, { error: result.error });
        return { ok: false, error: result.error, field };
      }
    }
    
    // Check if username exists
    const users = Storage.get(this.USERS_KEY, []);
    if (users.find(u => u.username === userData.username)) {
      Logger.warn('Auth', 'Username already exists');
      return { ok: false, error: 'Username already taken', field: 'username' };
    }
    
    if (users.find(u => u.email === userData.email)) {
      Logger.warn('Auth', 'Email already registered');
      return { ok: false, error: 'Email already registered', field: 'email' };
    }
    
    // Create new user
    const newUser = {
      id: 'usr_' + Date.now().toString(36).toUpperCase(),
      username: userData.username,
      email: userData.email,
      password: this._hashPassword(userData.password), // Simple hash (not secure for production)
      fullname: userData.fullname,
      phone: userData.phone,
      address: userData.address,
      birthday: userData.birthday || null,
      gender: userData.gender || null,
      createdAt: new Date().toISOString(),
      role: 'customer',
      status: 'active',
      preferences: {
        emailNotifications: true,
        orderUpdates: true,
        marketing: false
      }
    };
    
    users.push(newUser);
    Storage.set(this.USERS_KEY, users);
    this._logActivity('register', newUser);

    Logger.info('Auth', 'User registered successfully', { userId: newUser.id });
    return { ok: true, message: 'Account created successfully', user: newUser };
  },
  
  login(username, password) {
    Logger.info('Auth', 'Login attempt', { username });
    
    const users = Storage.get(this.USERS_KEY, []);
    const user = users.find(u => u.username === username);
    
    if (!user) {
      Logger.warn('Auth', 'Login failed: user not found');
      return { ok: false, error: 'Invalid username or password' };
    }
    
    if (!this._verifyPassword(password, user.password)) {
      Logger.warn('Auth', 'Login failed: invalid password');
      return { ok: false, error: 'Invalid username or password' };
    }
    
    if (user.status !== 'active') {
      Logger.warn('Auth', 'Login failed: account inactive', { userId: user.id });
      return { ok: false, error: 'Account is inactive. Please contact support.' };
    }
    
    // Create session
    const sessionToken = this._generateToken();
    const session = {
      token: sessionToken,
      userId: user.id,
      loginTime: Date.now(),
      expires: Date.now() + CONFIG.SESSION_TIMEOUT,
      ip: 'browser' // Would be actual IP in production
    };
    
    Storage.set(this.SESSION_KEY, session);
    Storage.set(this.CURRENT_USER_KEY, {
      id: user.id,
      username: user.username,
      email: user.email,
      fullname: user.fullname,
      phone: user.phone,
      address: user.address
    });
    this._logActivity('login', user);

    Logger.info('Auth', 'Login successful', { userId: user.id });
    return { ok: true, message: 'Logged in successfully', user };
  },
  
  logout() {
    const currentUser = this.currentUser();
    Logger.info('Auth', 'Logout', { userId: currentUser?.id });
    
    Storage.remove(this.SESSION_KEY);
    Storage.remove(this.CURRENT_USER_KEY);
  },
  
  currentUser() {
    const session = Storage.get(this.SESSION_KEY);
    if (!session || session.expires < Date.now()) {
      return null;
    }
    return Storage.get(this.CURRENT_USER_KEY);
  },
  
  isAuthenticated() {
    return this.currentUser() !== null;
  },
  
  _hashPassword(password) {
    // Simple hash (NOT SECURE - use bcrypt in production)
    return btoa(password);
  },
  
  _verifyPassword(password, hash) {
    return this._hashPassword(password) === hash;
  },
  
  _generateToken() {
    return 'token_' + Math.random().toString(36).substr(2, 9);
  },

  // Persistent sign-up/login activity log, feeds the Excel export on admin.html
  ACTIVITY_KEY: 'user_activity_log',

  _logActivity(event, user) {
    const log = Storage.get(this.ACTIVITY_KEY, []);
    log.push({
      event,                      // 'register' | 'login'
      userId: user.id,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      timestamp: new Date().toISOString()
    });
    Storage.set(this.ACTIVITY_KEY, log);
  },

  getActivityLog() {
    return Storage.get(this.ACTIVITY_KEY, []);
  },

  getAllUsers() {
    return Storage.get(this.USERS_KEY, []);
  }
};

// ============ CART MODULE ============
const Cart = {
  KEY: 'cart',
  
  read() {
    return Storage.get(this.KEY, []);
  },
  
  write(items) {
    Storage.set(this.KEY, items);
    this.updateUI();
  },
  
  add(product, qty = 1) {
    if (qty < 1 || qty > CONFIG.MAX_CART_ITEMS) {
      toast('Invalid quantity', 'error');
      return { ok: false };
    }
    
    const items = this.read();
    const existing = items.find(i => i.id === product.id);
    
    if (existing) {
      existing.qty += qty;
      if (existing.qty > CONFIG.MAX_CART_ITEMS) {
        existing.qty = CONFIG.MAX_CART_ITEMS;
        toast('Maximum quantity reached', 'warn');
      }
    } else {
      items.push({
        id: product.id,
        name: product.name,
        category: product.category,
        categoryLabel: product.categoryLabel,
        price: product.price,
        img: product.img,
        qty: qty,
        addedAt: new Date().toISOString()
      });
    }
    
    this.write(items);
    Logger.info('Cart', `Added ${product.name}`, { qty, total: this.subtotal() });
    toast(`✓ ${product.name} added to cart`);
    return { ok: true };
  },
  
  remove(id) {
    const items = this.read();
    const item = items.find(i => i.id === id);
    if (item) {
      Logger.info('Cart', `Removed ${item.name}`);
    }
    this.write(items.filter(i => i.id !== id));
  },
  
  setQty(id, qty) {
    const items = this.read();
    const item = items.find(i => i.id === id);
    if (item) {
      item.qty = Math.max(1, Math.min(qty, CONFIG.MAX_CART_ITEMS));
      this.write(items);
      Logger.debug('Cart', `Updated ${item.name} quantity`, { qty: item.qty });
    }
  },
  
  clear() {
    Storage.set(this.KEY, []);
    this.updateUI();
    Logger.info('Cart', 'Cleared');
  },
  
  count() {
    return this.read().reduce((sum, i) => sum + i.qty, 0);
  },
  
  subtotal() {
    return this.read().reduce((sum, i) => sum + (i.price * i.qty), 0);
  },
  
  isEmpty() {
    return this.count() === 0;
  },
  
  updateUI() {
    const countEl = document.querySelector('[data-cart-count]');
    if (countEl) {
      countEl.textContent = this.count();
    }
  }
};

// ============ ORDERS MODULE ============
const Orders = {
  KEY: 'orders',
  
  save(orderData) {
    const order = {
      id: 'ORD-' + Date.now().toString(36).toUpperCase(),
      userId: Auth.currentUser()?.id || 'guest',
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...orderData
    };
    
    const orders = Storage.get(this.KEY, []);
    orders.push(order);
    Storage.set(this.KEY, orders);
    
    // Also save to user's order history if logged in
    if (Auth.isAuthenticated()) {
      Customers.addOrder(Auth.currentUser().id, order.id);
    }
    
    Logger.info('Orders', 'Order created', { orderId: order.id, total: order.total });
    return order;
  },
  
  getAll() {
    return Storage.get(this.KEY, []);
  },
  
  getById(orderId) {
    const orders = this.getAll();
    return orders.find(o => o.id === orderId);
  },
  
  forCurrentUser() {
    const user = Auth.currentUser();
    if (!user) return [];
    
    const orders = this.getAll();
    return orders.filter(o => o.userId === user.id);
  },
  
  updateStatus(orderId, newStatus) {
    const orders = Storage.get(this.KEY, []);
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
      order.status = newStatus;
      order.updatedAt = new Date().toISOString();
      Storage.set(this.KEY, orders);
      Logger.info('Orders', `Status updated: ${orderId}`, { status: newStatus });
      return { ok: true, order };
    }
    
    return { ok: false, error: 'Order not found' };
  },
  
  getStats() {
    const orders = this.getAll();
    const now = Date.now();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      completed: orders.filter(o => o.status === 'completed').length,
      totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
      todayOrders: orders.filter(o => new Date(o.createdAt) >= today).length,
      todayRevenue: orders
        .filter(o => new Date(o.createdAt) >= today)
        .reduce((sum, o) => sum + (o.total || 0), 0)
    };
  }
};

// ============ CUSTOMERS MODULE ============
const Customers = {
  KEY: 'customers',
  
  getOrCreate(userId, userData) {
    let customers = Storage.get(this.KEY, []);
    let customer = customers.find(c => c.id === userId);
    
    if (!customer) {
      customer = {
        id: userId,
        ...userData,
        orders: [],
        totalSpent: 0,
        orderCount: 0,
        createdAt: new Date().toISOString(),
        lastOrderAt: null,
        status: 'active'
      };
      customers.push(customer);
      Storage.set(this.KEY, customers);
    }
    
    return customer;
  },
  
  addOrder(userId, orderId) {
    let customers = Storage.get(this.KEY, []);
    const customer = customers.find(c => c.id === userId);
    
    if (customer) {
      if (!customer.orders) customer.orders = [];
      customer.orders.push(orderId);
      customer.orderCount = customer.orders.length;
      customer.lastOrderAt = new Date().toISOString();
      Storage.set(this.KEY, customers);
    }
  },
  
  getCustomerStats(userId) {
    const customer = Storage.get(this.KEY, []).find(c => c.id === userId);
    if (!customer) return null;
    
    const orders = Orders.getAll().filter(o => o.userId === userId);
    
    return {
      orderCount: orders.length,
      totalSpent: orders.reduce((sum, o) => sum + (o.total || 0), 0),
      averageOrder: orders.length > 0 && Math.round(orders.reduce((sum, o) => sum + (o.total || 0), 0) / orders.length) || 0,
      lastOrder: orders[orders.length - 1]?.createdAt || null,
      favoriteCategory: this._getMostOrderedCategory(orders)
    };
  },
  
  _getMostOrderedCategory(orders) {
    const categories = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        categories[item.category] = (categories[item.category] || 0) + 1;
      });
    });
    
    return Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  }
};

// ============ INVENTORY MODULE ============
const Inventory = {
  KEY: 'inventory',
  
  init() {
    // Initialize with default stock levels if not exists
    if (!Storage.get(this.KEY)) {
      const inventory = {};
      // This would be populated from product data
      Storage.set(this.KEY, inventory);
    }
  },
  
  setStock(productId, quantity) {
    const inventory = Storage.get(this.KEY, {});
    inventory[productId] = { quantity, updatedAt: new Date().toISOString() };
    Storage.set(this.KEY, inventory);
    Logger.debug('Inventory', `Stock updated: ${productId}`, { quantity });
  },
  
  getStock(productId) {
    const inventory = Storage.get(this.KEY, {});
    return inventory[productId]?.quantity || 0;
  },
  
  decrementStock(productId, quantity) {
    const current = this.getStock(productId);
    const newQuantity = Math.max(0, current - quantity);
    this.setStock(productId, newQuantity);
    Logger.info('Inventory', `Stock decremented: ${productId}`, { from: current, to: newQuantity });
  },
  
  isInStock(productId, quantity = 1) {
    return this.getStock(productId) >= quantity;
  },
  
  getLowStockItems(threshold = 10) {
    const inventory = Storage.get(this.KEY, {});
    return Object.entries(inventory)
      .filter(([_, data]) => data.quantity <= threshold)
      .map(([productId, data]) => ({ productId, ...data }));
  }
};

// ============ ANALYTICS MODULE ============
const Analytics = {
  KEY: 'analytics',
  
  trackEvent(eventType, data) {
    const event = {
      type: eventType,
      timestamp: new Date().toISOString(),
      data,
      url: window.location.pathname,
      userAgent: navigator.userAgent
    };
    
    const events = Storage.get(this.KEY, []);
    events.push(event);
    
    // Keep only last 1000 events to avoid storage bloat
    if (events.length > 1000) {
      events.shift();
    }
    
    Storage.set(this.KEY, events);
    Logger.debug('Analytics', `Event tracked: ${eventType}`);
  },
  
  getPageStats() {
    const events = Storage.get(this.KEY, []);
    const pages = {};
    
    events.forEach(e => {
      pages[e.url] = (pages[e.url] || 0) + 1;
    });
    
    return pages;
  },
  
  getSalesData() {
    const orders = Orders.getAll();
    return {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
      averageOrderValue: Math.round(orders.reduce((sum, o) => sum + o.total, 0) / Math.max(orders.length, 1)),
      ordersLastWeek: orders.filter(o => {
        const date = new Date(o.createdAt);
        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        return date.getTime() > weekAgo;
      }).length
    };
  }
};

// ============ UTILITY FUNCTIONS ============
function money(num) {
  return CONFIG.CURRENCY_SYMBOL + num.toLocaleString('en-PH', { minimumFractionDigits: 0 });
}

function starString(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '☆' : '') + '☆'.repeat(empty);
}

function toast(msg, type = 'info', duration = 3000) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  
  const colors = {
    info: 'var(--orange)',
    success: 'var(--success)',
    warn: '#ff9900',
    error: 'var(--alert)'
  };
  
  const el = document.createElement('div');
  el.className = 'toast';
  el.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 24px;
    background: ${colors[type] || colors.info};
    color: #fff;
    padding: 14px 20px;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 500;
    z-index: 5000;
    animation: slideUp 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  `;
  el.textContent = msg;
  
  document.body.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

function formatDate(dateString, format = 'short') {
  const date = new Date(dateString);
  if (format === 'short') {
    return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
  } else if (format === 'long') {
    return date.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  } else if (format === 'time') {
    return date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
  }
  return dateString;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
  Logger.info('App', 'Initializing LUDOVICE v' + CONFIG.VERSION);
  
  // Initialize all modules
  Auth.init();
  Inventory.init();
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
    
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.style.display = 'none';
      });
    });
  }
  
  // Add toast styles
  if (!document.querySelector('style[data-toast-styles]')) {
    const style = document.createElement('style');
    style.setAttribute('data-toast-styles', 'true');
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
      .toast { animation: slideUp 0.3s ease !important; }
    `;
    document.head.appendChild(style);
  }
  
  Logger.info('App', 'Initialization complete');
});

// ============ EXPORT FOR GLOBAL USE ============
window.LUDOVICE = {
  Config: CONFIG,
  Logger,
  Storage,
  Validator,
  Auth,
  Cart,
  Orders,
  Customers,
  Inventory,
  Analytics,
  Utils: { money, starString, toast, formatDate, debounce, throttle }
};

Logger.info('App', 'LUDOVICE Professional Business System loaded');
