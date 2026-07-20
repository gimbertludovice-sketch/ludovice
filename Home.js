/* index.html — category strip + featured product grid */
document.addEventListener('DOMContentLoaded', () => {
  const catMeta = {
    appetizers: {icon:'🥟', label:'Appetizers'},
    mains: {icon:'🍛', label:'Main Courses'},
    sides: {icon:'🍚', label:'Sides'},
    desserts: {icon:'🍮', label:'Desserts'},
    drinks: {icon:'🥤', label:'Drinks'},
    specials: {icon:'⭐', label:"Chef's Specials"}
  };
  const stripEl = document.getElementById('category-strip');
  Object.keys(catMeta).forEach(key => {
    const count = LUDOVICE_PRODUCTS.filter(p => p.category === key).length;
    const c = catMeta[key];
    stripEl.innerHTML += `
      <a href="products.html?cat=${key}" class="card reveal" style="padding:32px 26px;display:flex;align-items:center;gap:18px;">
        <span style="font-size:2.2rem;">${c.icon}</span>
        <span>
          <h3 style="margin-bottom:4px;">${c.label}</h3>
          <span style="font-family:var(--f-mono);font-size:.8rem;color:var(--slate);">${count} items</span>
        </span>
      </a>`;
  });

  const featured = LUDOVICE_PRODUCTS.filter(p => p.popular).slice(0, 8);
  const grid = document.getElementById('featured-grid');
  featured.forEach(p => {
    grid.innerHTML += `
      <article class="card product-card reveal">
        <div class="product-card__media">
          <img src="${p.img}" alt="${p.name}" loading="lazy">
          <span class="product-card__tag">Popular</span>
          <span class="product-card__cat">${p.categoryLabel}</span>
        </div>
        <div class="product-card__body">
          <h3>${p.name}</h3>
          <p>${p.desc}</p>
          <div class="product-card__rating"><span class="stars">${starString(p.rating)}</span> ${p.rating} (${p.reviews})</div>
          <div class="product-card__footer">
            <span class="price">${money(p.price)}</span>
            <button class="btn btn-primary btn-sm" onclick='Cart.add(${JSON.stringify(p)})'>Buy Now</button>
          </div>
        </div>
      </article>`;
  });
});
