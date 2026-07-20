// ============ CATALOG PAGE MANAGER ============
class Catalog {
  constructor() {
    this.allProducts = LUDOVICE_PRODUCTS || [];
    this.filteredProducts = [...this.allProducts];
    this.currentFilter = 'all';
    this.currentSort = 'default';
    this.searchTerm = '';
    this.itemsPerPage = 12;
    this.currentPage = 1;
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.applyURLParams();
    this.render();
  }
  
  setupEventListeners() {
    // Search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value.toLowerCase();
        this.currentPage = 1;
        this.filter();
      });
    }
    
    // Category filter chips
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentFilter = chip.dataset.cat;
        this.currentPage = 1;
        this.filter();
      });
    });
    
    // Sort
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this.currentPage = 1;
        this.filter();
      });
    }
    
    // Load more
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        this.currentPage++;
        this.renderMore();
      });
    }
    
    // Modal close
    const modalClose = document.getElementById('modal-close');
    const modal = document.getElementById('product-modal');
    if (modalClose && modal) {
      modalClose.addEventListener('click', () => {
        modal.style.display = 'none';
      });
      
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    }
  }
  
  applyURLParams() {
    const params = new URLSearchParams(location.search);
    const catParam = params.get('cat');
    
    if (catParam) {
      const chip = document.querySelector(`[data-cat="${catParam}"]`);
      if (chip) {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentFilter = catParam;
      }
    }
  }
  
  filter() {
    let results = [...this.allProducts];
    
    // Apply category filter
    if (this.currentFilter !== 'all') {
      results = results.filter(p => p.category === this.currentFilter);
    }
    
    // Apply search
    if (this.searchTerm) {
      results = results.filter(p =>
        p.name.toLowerCase().includes(this.searchTerm) ||
        p.desc.toLowerCase().includes(this.searchTerm) ||
        p.category.toLowerCase().includes(this.searchTerm)
      );
    }
    
    // Apply sort
    switch (this.currentSort) {
      case 'price-asc':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'default':
      default:
        // Popular first, then by ID
        results.sort((a, b) => {
          if (a.popular !== b.popular) return b.popular ? 1 : -1;
          return a.id - b.id;
        });
    }
    
    this.filteredProducts = results;
    this.currentPage = 1;
    this.render();
  }
  
  render() {
    this.updateResultsMeta();
    this.renderGrid();
    this.updateLoadMoreBtn();
  }
  
  renderMore() {
    this.renderGrid(true);
    this.updateLoadMoreBtn();
  }
  
  updateResultsMeta() {
    const meta = document.getElementById('results-meta');
    if (!meta) return;
    
    const total = this.filteredProducts.length;
    const showing = Math.min(this.itemsPerPage * this.currentPage, total);
    
    if (total === 0) {
      meta.textContent = 'No dishes found. Try another search or filter.';
    } else if (this.searchTerm) {
      meta.textContent = `Found ${total} dish${total !== 1 ? 'es' : ''} matching "${this.searchTerm}"`;
    } else if (this.currentFilter !== 'all') {
      const catLabel = this.getCategoryLabel(this.currentFilter);
      meta.textContent = `${total} ${catLabel} · Showing ${showing}`;
    } else {
      meta.textContent = `${total} dishes · Showing ${showing}`;
    }
  }
  
  getCategoryLabel(cat) {
    const labels = {
      appetizers: 'Appetizers',
      mains: 'Main Courses',
      sides: 'Sides',
      desserts: 'Desserts',
      drinks: 'Drinks',
      specials: "Chef's Specials"
    };
    return labels[cat] || cat;
  }
  
  renderGrid(append = false) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    const items = this.filteredProducts.slice(start, end);
    
    if (!append) {
      grid.innerHTML = '';
    }
    
    if (items.length === 0 && !append) {
      grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">No dishes match your search.</p>';
      return;
    }
    
    items.forEach((product, idx) => {
      const card = document.createElement('article');
      card.className = 'card product-card reveal';
      if (append) {
        card.style.animationDelay = `${idx * 0.05}s`;
      }
      
      card.innerHTML = `
        <div class="product-card__media">
          <img src="${product.img}" alt="${product.name}" loading="lazy" onclick="catalog.showModal(${product.id})">
          ${product.popular ? '<span class="product-card__tag">Popular</span>' : ''}
          <span class="product-card__cat">${product.categoryLabel}</span>
        </div>
        <div class="product-card__body">
          <h3>${product.name}</h3>
          <p>${product.desc}</p>
          <div class="product-card__rating">
            <span class="stars">${starString(product.rating)}</span> 
            ${product.rating} (${product.reviews})
          </div>
          <div class="product-card__footer">
            <span class="price">${money(product.price)}</span>
            <button class="btn btn-primary btn-sm" onclick='Cart.add(${JSON.stringify(product)})'>Buy Now</button>
          </div>
        </div>
      `;
      
      grid.appendChild(card);
    });
  }
  
  updateLoadMoreBtn() {
    const btn = document.getElementById('load-more-btn');
    if (!btn) return;
    
    const totalShown = this.itemsPerPage * this.currentPage;
    const hasMore = totalShown < this.filteredProducts.length;
    
    btn.style.display = hasMore ? 'block' : 'none';
    btn.textContent = `Load More Dishes (${Math.max(0, this.filteredProducts.length - totalShown)} remaining)`;
  }
  
  showModal(productId) {
    const product = this.allProducts.find(p => p.id === productId);
    if (!product) return;

    const modalBody = document.getElementById('modal-body');
    if (!modalBody) return;

    const images = (product.images && product.images.length) ? product.images : [product.img];
    this.galleryIndex = 0;

    modalBody.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; padding: 32px;">
        <div>
          <div class="gallery-main" id="gallery-main">
            <img id="gallery-main-img" src="${images[0]}" alt="${product.name}">
            ${images.length > 1 ? `
              <button class="gallery-arrow gallery-arrow--prev" id="gallery-prev" aria-label="Previous photo">‹</button>
              <button class="gallery-arrow gallery-arrow--next" id="gallery-next" aria-label="Next photo">›</button>
            ` : ''}
          </div>
          ${images.length > 1 ? `
            <div class="gallery-thumbs" id="gallery-thumbs">
              ${images.map((src, i) => `
                <button class="gallery-thumb${i === 0 ? ' active' : ''}" data-idx="${i}" aria-label="View photo ${i + 1}">
                  <img src="${src}" alt="${product.name} photo ${i + 1}">
                </button>`).join('')}
            </div>
          ` : ''}
        </div>
        <div>
          <span class="badge-soft" style="margin-bottom: 12px;">${product.categoryLabel}</span>
          <h2>${product.name}</h2>
          <p style="color: var(--slate); margin: 12px 0;">${product.desc}</p>
          
          <div style="margin: 24px 0;">
            <div class="product-card__rating" style="margin-bottom: 16px;">
              <span class="stars">${starString(product.rating)}</span>
              <span>${product.rating} out of 5</span>
            </div>
            <p style="font-size: 0.85rem; color: var(--slate);">${product.reviews} customer reviews</p>
          </div>
          
          <div style="padding: 20px; background: var(--cream); border-radius: var(--radius-md); margin-bottom: 20px;">
            <span style="font-size: 0.85rem; color: var(--slate);">Price</span>
            <div class="price" style="font-size: 2rem; margin: 8px 0;">${money(product.price)}</div>
          </div>
          
          <button class="btn btn-primary btn-block" onclick='Cart.add(${JSON.stringify(product)}); document.getElementById("product-modal").style.display = "none";'>
            Add to Cart
          </button>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border);">
            <p style="font-size: 0.8rem; color: var(--slate);">✓ Fresh cooked to order<br>✓ Delivery available<br>✓ Ready for pickup</p>
          </div>
        </div>
      </div>
    `;

    if (images.length > 1) {
      const mainImg = document.getElementById('gallery-main-img');
      const thumbs = [...document.querySelectorAll('.gallery-thumb')];
      const setActive = (idx) => {
        this.galleryIndex = (idx + images.length) % images.length;
        mainImg.src = images[this.galleryIndex];
        thumbs.forEach((t, i) => t.classList.toggle('active', i === this.galleryIndex));
      };
      thumbs.forEach(t => t.addEventListener('click', () => setActive(Number(t.dataset.idx))));
      document.getElementById('gallery-prev').addEventListener('click', () => setActive(this.galleryIndex - 1));
      document.getElementById('gallery-next').addEventListener('click', () => setActive(this.galleryIndex + 1));
    }

    document.getElementById('product-modal').style.display = 'flex';
  }
}

// Initialize on page load
let catalog;
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('product-grid')) {
    catalog = new Catalog();
  }
});
