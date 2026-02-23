let allProducts = [];
let filteredProducts = [];
let currentCategory = 'All';

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

// Render products
function renderProducts() {
  const productList = document.getElementById('productList');
  
  if (filteredProducts.length === 0) {
    productList.innerHTML = '<div class="no-products">No products found</div>';
    return;
  }
  
  productList.innerHTML = filteredProducts.map((product, index) => `
    <div class="product-card" style="animation-delay: ${index * 0.1}s">
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <span>Shop Now</span>
        </button>
      </div>
    </div>
  `).join('');
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
  
  renderProducts();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => filterByCategory(btn.dataset.category));
  });
  
  document.getElementById('searchInput').addEventListener('input', (e) => {
    searchProducts(e.target.value);
  });
});
