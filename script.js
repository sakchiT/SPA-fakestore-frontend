// 1. DATA
const products = [
    { id: 1, name: "Classic T-Shirt", category: "men", price: 25, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400" },
    { id: 2, name: "Denim Jacket", category: "men", price: 65, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400" },
    { id: 3, name: "Party Wear ", category: "men", price: 30, image: "https://medias.utsavfashion.com/media/catalog/product/cache/1/small_image/295x/040ec09b1e35df139433887a97daa66f/w/o/woven-satin-jacquard-sherwani-in-dark-green-v1-mkz515.jpg" },
    { id: 4, name: "Formal Outfit", category: "men", price: 45, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHLWiaYcnqR0Bs6lVeJMCM1IJKt7niB0tHnA&s" },
    
    { id: 5, name: "Summer Dress", category: "women", price: 45, image: "https://i5.walmartimages.com/asr/572c7130-580b-45f5-ac0c-bb8e7b3b6f98.6e5b7bd7bafc515d3891e3bd3348dff2.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF" },
    { id: 6, name: "Women Party Saree", category: "women", price: 40, image: "https://assets0.mirraw.com/images/12081712/image_zoom.jpeg?1701492933" },
    { id: 7, name: "Formal Outfit", category: "women", price: 50, image: "https://d1fufvy4xao6k9.cloudfront.net/images/blog/posts/2021/06/278a0084.jpg" },
    { id: 8, name: "Winter Coat", category: "women", price: 95, image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400" },
    
    { id: 9, name: "Kids Hoodie", category: "kids", price: 35, image: "https://printnstyle.in/wp-content/uploads/2024/12/KID-HOD-012-1.jpg" },
    { id: 10, name: "School Uniform", category: "kids", price: 45, image: "https://5.imimg.com/data5/SELLER/Default/2023/12/367863030/VH/FS/SH/4156856/kids-preschool-uniform-1000x1000.jpg" },
    { id: 11, name: "Kids Party Dress", category: "kids", price: 40, image: "https://printedsticker.files.wordpress.com/2021/04/boy-ethnic-wear-noida.jpg" },
    { id: 12, name: "Kids Jeans", category: "kids", price: 30, image: "https://img500.exportersindia.com/product_images/bc-500/2024/8/13159969/kids-denim-jeans-1723200410-7558705.jpeg" }
];

// 2. STATE
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentFilter = 'all';
let apiProducts = []; // For FakeStore API products

// 3. FAKESTORE API INTEGRATION - FILTERED FOR CLOTHING ONLY
async function loadFakeStoreProducts() {
    try {
        const response = await fetch('https://fakestoreapi.com/products');
        const data = await response.json();
        
        // Filter only clothing items (men's and women's clothing)
        const clothingItems = data.filter(item => 
            item.category === "men's clothing" || 
            item.category === "women's clothing"
        );
        
        // Convert filtered API products to match our format
        apiProducts = clothingItems.map((item, index) => ({
            id: 100 + index, // Start from 100 to avoid conflicts
            name: item.title.length > 30 ? item.title.substring(0, 30) + '...' : item.title,
            category: item.category === "men's clothing" ? "men" : "women",
            price: Math.round(item.price),
            image: item.image,
            fromAPI: true
        }));
        
        // Update products display if on products page
        if (window.location.hash.slice(1) === 'products') {
            renderProducts();
        }
        
    } catch (error) {
        console.log('API Error:', error);
    }
}

// 4. ROUTER
function handleRoute() {
    const hash = window.location.hash.slice(1) || 'home';
    
    // Update nav
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${hash}`);
    });
    
    // Show page
    const app = document.getElementById('app');
    
    if (hash === 'home') {
        const template = document.getElementById('home-template');
        app.innerHTML = '';
        app.appendChild(template.content.cloneNode(true));
    } 
    else if (hash === 'products') {
        const template = document.getElementById('products-template');
        app.innerHTML = '';
        app.appendChild(template.content.cloneNode(true));
        renderProducts();
    }
    else if (hash === 'cart') {
        const template = document.getElementById('cart-template');
        app.innerHTML = '';
        app.appendChild(template.content.cloneNode(true));
        renderCart();
    }
}

// 5. RENDER PRODUCTS (Updated to include API products)
function renderProducts() {
    const grid = document.querySelector('.products-grid');
    grid.innerHTML = '';
    
    // Combine local and API products
    const allProducts = [...products, ...apiProducts];
    
    const filtered = currentFilter === 'all' 
        ? allProducts 
        : allProducts.filter(p => p.category === currentFilter);
    
    filtered.forEach(product => {
        const template = document.getElementById('product-card-template');
        const card = template.content.cloneNode(true);
        
        // Set data
        card.querySelector('img').src = product.image;
        card.querySelector('.product-title').textContent = product.name;
        card.querySelector('.product-category').textContent = product.category;
        card.querySelector('.product-price span').textContent = product.price;
        
        // Add to cart button
        card.querySelector('.add-to-cart').addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(product);
        });
        
        grid.appendChild(card);
    });
    
    // Setup filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.category;
            renderProducts();
        });
    });
}

// 6. RENDER CART
function renderCart() {
    const container = document.querySelector('.cart-items');
    container.innerHTML = '';
    
    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    } else {
        cart.forEach(item => {
            const template = document.getElementById('cart-item-template');
            const cartItem = template.content.cloneNode(true);
            
            cartItem.querySelector('img').src = item.image;
            cartItem.querySelector('.cart-item-title').textContent = item.name;
            cartItem.querySelector('.cart-item-price span').textContent = item.price * item.quantity;
            cartItem.querySelector('.quantity').textContent = item.quantity;
            
            // Buttons
            cartItem.querySelector('.minus').addEventListener('click', () => updateQty(item.id, -1));
            cartItem.querySelector('.plus').addEventListener('click', () => updateQty(item.id, 1));
            cartItem.querySelector('.remove-btn').addEventListener('click', () => removeItem(item.id));
            
            container.appendChild(cartItem);
        });
    }
    
    updateCartTotal();
    updateCartCount();
}

// 7. CART FUNCTIONS
function addToCart(product) {
    const item = cart.find(item => item.id === product.id);
    
    if (item) {
        item.quantity++;
    } else {
        cart.push({...product, quantity: 1});
    }
    
    saveCart();
    updateCartCount();
    alert(`${product.name} added to cart!`);
}

function updateQty(id, change) {
    const item = cart.find(item => item.id === id);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeItem(id);
        } else {
            saveCart();
            renderCart();
        }
    }
}

function removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
}

function updateCartTotal() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + 5;
    
    if (document.querySelector('.subtotal')) {
        document.querySelector('.subtotal').textContent = `$${subtotal}`;
        document.querySelector('.total-price').textContent = `$${total}`;
    }
}

function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelector('.cart-count').textContent = total;
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// 8. INITIALIZE
function init() {
    // Setup router
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
    
    // Load FakeStore CLOTHING products on startup
    loadFakeStoreProducts();
    
    // Load cart count
    updateCartCount();
}

// START
document.addEventListener('DOMContentLoaded', init);