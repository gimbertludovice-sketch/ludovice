/**
 * LUDOVICE PROFESSIONAL DASHBOARD & ANALYTICS
 * Restaurant Management System Dashboard
 * For Manager/Admin viewing
 */

const Dashboard = {
  // Dashboard Data & State
  state: {
    period: 'today', // today, week, month, year
    selectedMetric: 'revenue'
  },
  
  // Initialize dashboard
  init() {
    Logger.info('Dashboard', 'Initializing...');
    this.setupEventListeners();
    this.render();
  },
  
  setupEventListeners() {
    const periodButtons = document.querySelectorAll('[data-period]');
    periodButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        periodButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.state.period = e.target.dataset.period;
        this.render();
      });
    });
  },
  
  // Get data for current period
  getDataForPeriod() {
    const now = Date.now();
    const orders = Orders.getAll();
    let filtered = orders;
    
    switch (this.state.period) {
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filtered = orders.filter(o => new Date(o.createdAt) >= today);
        break;
      
      case 'week':
        const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
        filtered = orders.filter(o => new Date(o.createdAt).getTime() > weekAgo);
        break;
      
      case 'month':
        const monthAgo = now - (30 * 24 * 60 * 60 * 1000);
        filtered = orders.filter(o => new Date(o.createdAt).getTime() > monthAgo);
        break;
      
      case 'year':
        const yearAgo = now - (365 * 24 * 60 * 60 * 1000);
        filtered = orders.filter(o => new Date(o.createdAt).getTime() > yearAgo);
        break;
    }
    
    return filtered;
  },
  
  // Calculate key metrics
  getMetrics() {
    const orders = this.getDataForPeriod();
    
    return {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
      averageOrderValue: orders.length > 0 ? Math.round(orders.reduce((sum, o) => sum + (o.total || 0), 0) / orders.length) : 0,
      completedOrders: orders.filter(o => o.status === 'completed').length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      totalCustomers: new Set(orders.map(o => o.userId)).size
    };
  },
  
  // Get top products
  getTopProducts() {
    const orders = this.getDataForPeriod();
    const products = {};
    
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (!products[item.id]) {
          products[item.id] = {
            id: item.id,
            name: item.name,
            quantity: 0,
            revenue: 0
          };
        }
        products[item.id].quantity += item.qty;
        products[item.id].revenue += item.price * item.qty;
      });
    });
    
    return Object.values(products)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  },
  
  // Get sales by category
  getSalesByCategory() {
    const orders = this.getDataForPeriod();
    const categories = {};
    
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (!categories[item.category]) {
          categories[item.category] = { count: 0, revenue: 0 };
        }
        categories[item.category].count += item.qty;
        categories[item.category].revenue += item.price * item.qty;
      });
    });
    
    return Object.entries(categories).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      ...data
    }));
  },
  
  // Get order timeline
  getOrderTimeline() {
    const orders = this.getDataForPeriod();
    const timeline = {};
    
    orders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
      timeline[date] = (timeline[date] || 0) + 1;
    });
    
    return Object.entries(timeline).map(([date, count]) => ({ date, count }));
  },
  
  // Render dashboard
  render() {
    Logger.debug('Dashboard', 'Rendering...');
    
    const metrics = this.getMetrics();
    const topProducts = this.getTopProducts();
    const categories = this.getSalesByCategory();
    
    // Update metric cards
    this.updateMetricCards(metrics);
    
    // Update charts
    this.updateCharts(metrics, topProducts, categories);
    
    Logger.info('Dashboard', 'Rendered', { metrics });
  },
  
  updateMetricCards(metrics) {
    const cards = document.querySelectorAll('[data-metric]');
    cards.forEach(card => {
      const { dataset } = card;
      const { metric } = dataset || {};
      if (!metric) return;
      const value = metrics?.[metric];
      
      if (value !== undefined) {
        const valueEl = card.querySelector('[data-value]');
        if (valueEl) {
          if (metric.includes('Revenue')) {
            valueEl.textContent = money(value);
          } else {
            valueEl.textContent = value.toLocaleString();
          }
        }
      }
    });
  },
  
  updateCharts(metrics, products, categories) {
    // This would integrate with charting library (Chart.js, etc.)
    Logger.debug('Dashboard', 'Charts would update here');
  },
  
  // Export data
  exportData(format = 'json') {
    const data = {
      export: {
        timestamp: new Date().toISOString(),
        period: this.state.period,
        metrics: this.getMetrics(),
        topProducts: this.getTopProducts(),
        categories: this.getSalesByCategory(),
        allOrders: Orders.getAll()
      }
    };
    
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
      return this.convertToCSV(data);
    }
  },
  
  convertToCSV(data) {
    // Basic CSV conversion
    const orders = data.export.allOrders;
    const headers = ['Order ID', 'Date', 'Customer', 'Total', 'Status'];
    const rows = orders.map(o => [
      o.id,
      formatDate(o.createdAt),
      o.customer?.name || 'Guest',
      o.total,
      o.status
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }
};

/**
 * BUSINESS REPORTING MODULE
 */
const Reports = {
  // Generate sales report
  generateSalesReport(startDate, endDate) {
    const orders = Orders.getAll().filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
    });
    
    return {
      period: { start: startDate, end: endDate },
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
      averageOrderValue: Math.round(orders.reduce((sum, o) => sum + o.total, 0) / Math.max(orders.length, 1)),
      orders: orders.map(o => ({
        id: o.id,
        date: formatDate(o.createdAt),
        customer: o.customer?.name,
        items: o.items.length,
        total: o.total,
        status: o.status
      }))
    };
  },
  
  // Generate customer report
  generateCustomerReport() {
    const orders = Orders.getAll();
    const customers = {};
    
    orders.forEach(order => {
      if (!customers[order.userId]) {
        customers[order.userId] = {
          userId: order.userId,
          name: order.customer?.name || 'Unknown',
          email: order.customer?.email,
          orders: 0,
          totalSpent: 0,
          lastOrder: null
        };
      }
      customers[order.userId].orders += 1;
      customers[order.userId].totalSpent += order.total;
      customers[order.userId].lastOrder = order.createdAt;
    });
    
    return Object.values(customers).sort((a, b) => b.totalSpent - a.totalSpent);
  },
  
  // Generate product performance report
  generateProductReport() {
    const orders = Orders.getAll();
    const products = {};
    
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (!products[item.id]) {
          products[item.id] = {
            id: item.id,
            name: item.name,
            category: item.category,
            unitsSold: 0,
            revenue: 0,
            avgRating: 0
          };
        }
        products[item.id].unitsSold += item.qty;
        products[item.id].revenue += item.price * item.qty;
      });
    });
    
    return Object.values(products).sort((a, b) => b.revenue - a.revenue);
  },
  
  // Generate inventory report
  generateInventoryReport() {
    const inventory = Storage.get('inventory', {});
    
    return Object.entries(inventory).map(([productId, data]) => ({
      productId,
      currentStock: data.quantity,
      status: data.quantity > 20 ? 'In Stock' : data.quantity > 5 ? 'Low Stock' : 'Critical',
      lastUpdated: formatDate(data.updatedAt)
    }));
  }
};

/**
 * PROMOTION & DISCOUNT SYSTEM
 */
const Promotions = {
  KEY: 'promotions',
  
  create(promotionData) {
    const promotion = {
      id: 'promo_' + Date.now().toString(36).toUpperCase(),
      code: promotionData.code.toUpperCase(),
      type: promotionData.type, // 'percentage' or 'fixed'
      value: promotionData.value,
      applicableTo: promotionData.applicableTo || 'all', // 'all', 'category', 'product'
      startDate: promotionData.startDate,
      endDate: promotionData.endDate,
      maxUses: promotionData.maxUses || null,
      usedCount: 0,
      minOrderValue: promotionData.minOrderValue || 0,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    const promotions = Storage.get(this.KEY, []);
    promotions.push(promotion);
    Storage.set(this.KEY, promotions);
    
    Logger.info('Promotions', 'Created', { code: promotion.code });
    return promotion;
  },
  
  validateCode(code, orderTotal) {
    const promotions = Storage.get(this.KEY, []);
    const promo = promotions.find(p => p.code === code.toUpperCase() && p.status === 'active');
    
    if (!promo) return { valid: false, error: 'Invalid promotion code' };
    
    const now = new Date();
    if (new Date(promo.startDate) > now) return { valid: false, error: 'Promotion not yet active' };
    if (new Date(promo.endDate) < now) return { valid: false, error: 'Promotion has expired' };
    
    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return { valid: false, error: 'Promotion limit reached' };
    }
    
    if (orderTotal < promo.minOrderValue) {
      return { valid: false, error: `Minimum order: ${money(promo.minOrderValue)}` };
    }
    
    return { valid: true, promotion: promo };
  },
  
  applyDiscount(promo, orderTotal) {
    let discount = 0;
    
    if (promo.type === 'percentage') {
      discount = Math.round((orderTotal * promo.value) / 100);
    } else if (promo.type === 'fixed') {
      discount = promo.value;
    }
    
    return Math.min(discount, orderTotal);
  },
  
  recordUsage(code) {
    const promotions = Storage.get(this.KEY, []);
    const promo = promotions.find(p => p.code === code.toUpperCase());
    
    if (promo) {
      promo.usedCount += 1;
      Storage.set(this.KEY, promotions);
      Logger.debug('Promotions', 'Usage recorded', { code });
    }
  }
};

/**
 * EMAIL NOTIFICATION SYSTEM
 * (Mock - would integrate with real email service in production)
 */
const Notifications = {
  KEY: 'notifications',
  
  sendOrderConfirmation(order) {
    const notification = {
      id: 'notif_' + Date.now().toString(36).toUpperCase(),
      type: 'order_confirmation',
      recipient: order.customer.email,
      subject: `Order Confirmed - ${order.id}`,
      content: `Your order has been placed. Order ID: ${order.id}. Total: ${money(order.total)}`,
      status: 'sent',
      sentAt: new Date().toISOString()
    };
    
    this._save(notification);
    Logger.info('Notifications', 'Order confirmation sent', { orderId: order.id });
  },
  
  sendOrderStatusUpdate(order, newStatus) {
    const notification = {
      id: 'notif_' + Date.now().toString(36).toUpperCase(),
      type: 'order_status_update',
      recipient: order.customer.email,
      subject: `Order ${newStatus} - ${order.id}`,
      content: `Your order ${order.id} has been ${newStatus}.`,
      status: 'sent',
      sentAt: new Date().toISOString()
    };
    
    this._save(notification);
    Logger.info('Notifications', 'Status update sent', { orderId: order.id, status: newStatus });
  },
  
  sendPromotionalEmail(recipients, subject, content) {
    recipients.forEach(email => {
      const notification = {
        id: 'notif_' + Date.now().toString(36).toUpperCase(),
        type: 'promotional',
        recipient: email,
        subject,
        content,
        status: 'sent',
        sentAt: new Date().toISOString()
      };
      this._save(notification);
    });
    
    Logger.info('Notifications', 'Promotional emails sent', { count: recipients.length });
  },
  
  _save(notification) {
    const notifications = Storage.get(this.KEY, []);
    notifications.push(notification);
    Storage.set(this.KEY, notifications);
  },
  
  getUnsentNotifications() {
    const notifications = Storage.get(this.KEY, []);
    return notifications.filter(n => n.status === 'pending');
  }
};

// Export for global use
window.LUDOVICE = window.LUDOVICE || {};
Object.assign(window.LUDOVICE, {
  Dashboard,
  Reports,
  Promotions,
  Notifications
});

Logger.info('Dashboard', 'Professional Business System modules loaded');
