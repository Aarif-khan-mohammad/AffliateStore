let allProducts = [];
let filteredProducts = [];
let currentCategory = 'All';
let currentPage = 1;
let itemsPerPage = 10;

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
        link: values[5]
      };
    });
    
    filteredProducts = allProducts;
    renderProducts();
  } catch (error) {
    document.getElementById('productList').innerHTML = '<div class="no-products">Error loading products</div>';
  }
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
  
  productList.innerHTML = paginatedProducts.map((product, index) => `
    <div class="product-card" style="animation-delay: ${index * 0.05}s">
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
  `).join('');
  
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
  applyFilters();
  
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
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
    return matchesCategory && matchesSearch;
  });
  
  currentPage = 1;
  renderProducts();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  updateItemsPerPage();
  loadProducts();
  
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => filterByCategory(btn.dataset.category));
  });
  
  document.getElementById('searchInput').addEventListener('input', (e) => {
    searchProducts(e.target.value);
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
