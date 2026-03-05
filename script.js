let allProducts = [];
let filteredProducts = [];
let currentCategory = 'All';
let currentPage = 1;
let itemsPerPage = 10;
let currentSort = 'default';
let currentPriceRange = 'all';
let allCoupons = [];
let filteredCoupons = [];
let currentSite = 'All';
let showingCoupons = false;

// Calculate items per page based on screen size
function updateItemsPerPage() {
  const width = window.innerWidth;
  if (width >= 1024) {
    itemsPerPage = 25; // 5 columns × 5 rows
  } else if (width >= 768) {
    itemsPerPage = 15; // 3 columns × 5 rows
  } else {
    itemsPerPage = 10; // 2 columns × 5 rows
  }
}

// Parse price to number
function parsePrice(priceStr) {
  return parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
}

// Load and parse CSV
async function loadProducts() {
  try {
    const response = await fetch('products.csv');
    const csvText = await response.text();
    
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    
    allProducts = lines.slice(1).map(line => {
      const values = line.split(',');
      return {
        name: values[0],
        mrp: values[1],
        price: values[2],
        category: values[3],
        image: values[4],
        link: values[5],
        priceNum: parsePrice(values[2]),
        mrpNum: parsePrice(values[1])
      };
    });
    
    filteredProducts = allProducts;
    renderProducts();
  } catch (error) {
    document.getElementById('productList').innerHTML = '<div class="no-products">Error loading products</div>';
  }
}

// Load coupons
async function loadCoupons() {
  try {
    const response = await fetch('coupons.csv');
    const csvText = await response.text();
    
    const lines = csvText.trim().split('\n');
    allCoupons = lines.slice(1).map(line => {
      const values = line.split(',');
      return {
        site: values[0],
        code: values[1],
        description: values[2],
        discount: values[3]
      };
    });
    filteredCoupons = allCoupons;
  } catch (error) {
    console.error('Error loading coupons:', error);
  }
}

// Filter coupons by site
function filterCouponsBySite(site) {
  currentSite = site;
  
  if (site === 'All') {
    filteredCoupons = allCoupons;
  } else {
    filteredCoupons = allCoupons.filter(coupon => coupon.site === site);
  }
  
  renderCoupons();
  
  document.querySelectorAll('.site-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.site === site);
  });
}

// Render coupons
function renderCoupons() {
  const couponsList = document.getElementById('couponsList');
  
  if (filteredCoupons.length === 0) {
    couponsList.innerHTML = '<div class="no-products">No coupons available</div>';
    return;
  }
  
  couponsList.innerHTML = filteredCoupons.map((coupon, index) => `
    <div class="coupon-card">
      <div class="coupon-header">
        <div class="coupon-site">${coupon.site}</div>
        <div class="coupon-discount">${coupon.discount}</div>
      </div>
      <div class="coupon-description">${coupon.description}</div>
      <div class="coupon-code-container">
        <div class="coupon-code hidden" id="code-${index}">${coupon.code}</div>
        <button class="toggle-code-btn" onclick="toggleCode(${index})">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" id="eye-${index}">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
        <button class="copy-code-btn" onclick="copyCode('${coupon.code}')">
          Copy
        </button>
      </div>
    </div>
  `).join('');
}

// Toggle coupon code visibility
function toggleCode(index) {
  const codeElement = document.getElementById(`code-${index}`);
  const eyeIcon = document.getElementById(`eye-${index}`);
  
  if (codeElement.classList.contains('hidden')) {
    codeElement.classList.remove('hidden');
    eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
  } else {
    codeElement.classList.add('hidden');
    eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
  }
}

// Copy coupon code
function copyCode(code) {
  navigator.clipboard.writeText(code).then(() => {
    alert('Coupon code copied: ' + code);
  });
}

// Render products with pagination
function renderProducts() {
  const productList = document.getElementById('productList');
  
  if (filteredProducts.length === 0) {
    productList.innerHTML = '<div class="no-products">No products found</div>';
    document.getElementById('pagination').style.display = 'none';
    return;
  }
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  productList.innerHTML = paginatedProducts.map((product, index) => {
    const discount = product.mrpNum && product.priceNum ? Math.round(((product.mrpNum - product.priceNum) / product.mrpNum) * 100) : 0;
    return `
    <div class="product-card" style="animation-delay: ${index * 0.05}s">
      ${discount > 0 ? `<div class="discount-badge">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
        </svg>
        ${discount}% OFF
      </div>` : ''}
      <div class="product-image-wrapper">
        <img src="${product.image}" alt="${product.name}" class="product-image">
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <div class="product-pricing">
          ${product.mrp ? `<span class="product-mrp">${product.mrp}</span>` : ''}
          <span class="product-price">${product.price}</span>
        </div>
        <button class="shop-btn" onclick="window.open('${product.link}', '_blank')">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <span>Shop</span>
        </button>
      </div>
    </div>
  `}).join('');
  
  renderPagination();
}

// Render pagination controls
function renderPagination() {
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const pagination = document.getElementById('pagination');
  
  if (totalPages <= 1) {
    pagination.style.display = 'none';
    return;
  }
  
  pagination.style.display = 'flex';
  
  let paginationHTML = `
    <button class="pagination-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
      ←
    </button>
  `;
  
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      paginationHTML += `
        <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
          ${i}
        </button>
      `;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      paginationHTML += '<span class="pagination-info">...</span>';
    }
  }
  
  paginationHTML += `
    <button class="pagination-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
      →
    </button>
  `;
  
  pagination.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderProducts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Filter by category
function filterByCategory(category) {
  currentCategory = category;
  
  if (category === 'Coupons') {
    showingCoupons = true;
    document.getElementById('productList').style.display = 'none';
    document.getElementById('pagination').style.display = 'none';
    document.getElementById('couponsContainer').style.display = 'block';
    document.querySelector('.sort-filter').style.display = 'none';
    document.querySelector('.price-filter').style.display = 'none';
    renderCoupons();
  } else {
    showingCoupons = false;
    document.getElementById('productList').style.display = 'grid';
    document.getElementById('couponsContainer').style.display = 'none';
    document.querySelector('.sort-filter').style.display = 'flex';
    document.querySelector('.price-filter').style.display = 'block';
    applyFilters();
  }
  
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category || (category === 'Coupons' && btn.id === 'couponsBtn'));
  });
}

// Search products
function searchProducts(query) {
  applyFilters(query);
}

// Apply all filters
function applyFilters(searchQuery = '') {
  filteredProducts = allProducts.filter(product => {
    const matchesCategory = currentCategory === 'All' || product.category === currentCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Price range filter
    let matchesPrice = true;
    if (currentPriceRange !== 'all') {
      const price = product.priceNum;
      if (currentPriceRange === '0-500') matchesPrice = price < 500;
      else if (currentPriceRange === '500-1000') matchesPrice = price >= 500 && price < 1000;
      else if (currentPriceRange === '1000-5000') matchesPrice = price >= 1000 && price < 5000;
      else if (currentPriceRange === '5000+') matchesPrice = price >= 5000;
    }
    
    return matchesCategory && matchesSearch && matchesPrice;
  });
  
  // Apply sorting
  if (currentSort === 'price-low') {
    filteredProducts.sort((a, b) => a.priceNum - b.priceNum);
  } else if (currentSort === 'price-high') {
    filteredProducts.sort((a, b) => b.priceNum - a.priceNum);
  } else if (currentSort === 'discount') {
    filteredProducts.sort((a, b) => {
      const discountA = ((a.mrpNum - a.priceNum) / a.mrpNum) * 100;
      const discountB = ((b.mrpNum - b.priceNum) / b.mrpNum) * 100;
      return discountB - discountA;
    });
  }
  
  currentPage = 1;
  renderProducts();
}

// Sort products
function sortProducts(sortType) {
  currentSort = sortType;
  applyFilters(document.getElementById('searchInput').value);
}

// Filter by price range
function filterByPrice(range) {
  currentPriceRange = range;
  applyFilters(document.getElementById('searchInput').value);
  
  document.querySelectorAll('.price-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.range === range);
  });
}

// Visitor counter
function initVisitorCounter() {
  const VISITOR_KEY = 'vibeandvelocity_visitor';
  const COUNT_KEY = 'vibeandvelocity_count';
  
  // Check if user has visited before
  const hasVisited = localStorage.getItem(VISITOR_KEY);
  
  if (!hasVisited) {
    // New visitor
    localStorage.setItem(VISITOR_KEY, 'true');
    
    // Increment count
    let count = parseInt(localStorage.getItem(COUNT_KEY) || '0');
    count++;
    localStorage.setItem(COUNT_KEY, count.toString());
  }
  
  // Display count
  const count = parseInt(localStorage.getItem(COUNT_KEY) || '0');
  document.getElementById('visitorCount').textContent = count;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  updateItemsPerPage();
  loadProducts();
  loadCoupons();
  initVisitorCounter();
  
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category || 'Coupons';
      filterByCategory(category);
    });
  });
  
  document.getElementById('searchInput').addEventListener('input', (e) => {
    if (!showingCoupons) {
      searchProducts(e.target.value);
    }
  });
  
  document.getElementById('sortSelect').addEventListener('change', (e) => {
    sortProducts(e.target.value);
  });
  
  document.querySelectorAll('.price-btn').forEach(btn => {
    btn.addEventListener('click', () => filterByPrice(btn.dataset.range));
  });
  
  // Site filter buttons for coupons
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('site-btn') || e.target.closest('.site-btn')) {
      const btn = e.target.classList.contains('site-btn') ? e.target : e.target.closest('.site-btn');
      filterCouponsBySite(btn.dataset.site);
    }
  });
  
  window.addEventListener('resize', () => {
    const oldItemsPerPage = itemsPerPage;
    updateItemsPerPage();
    if (oldItemsPerPage !== itemsPerPage) {
      currentPage = 1;
      renderProducts();
    }
  });
});
