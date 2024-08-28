const productList = document.getElementById('productList');
const cartContainer = document.getElementById('cart');
const productDetailsContainer = document.getElementById('productDetails'); // Add this line

// Initialize WebSocket connection
const ws = new WebSocket('ws://localhost:3000');
let products = [];
let cart = loadCartFromLocalStorage();

function renderProductList(products) {
    if (!window.location.pathname.includes('productDetails.html')) { // Check if not on the product details page
        productList.innerHTML = '<h3>Product List</h3>';

        products.forEach(product => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = `
                <h4>${product.name}</h4>
                <p>Price: $${product.price}</p>
                <p>Image: ${product.img}</p>
                <p>Unit: ${product.unit}</p>
                <p>Brand: ${product.brand}</p>
                <button onclick="showProductDetails(${product.id})">Details</button>
                <button onclick="addToCart(${product.id})">Add to Cart</button>
            `;
            productList.appendChild(card);
        });
    }
}

function showProductDetails(productId) {
    // Navigate to productDetails.html with product ID
    window.location.href = `productDetails.html?id=${productId}`;
}

function renderProductDetails(product) {
    productDetailsContainer.innerHTML = `
        <h4>${product.name}</h4>
        <p>Price: $${product.price}</p>
        <p>Image: ${product.img}</p>
        <p>Unit: ${product.unit}</p>
        <p>Brand: ${product.brand}</p>
        <button onclick="addToCart(${product.id})">Add to Cart</button>
    `;
}

function renderProductDetailsError() {
    productDetailsContainer.innerHTML = '<p>Product details not available.</p>';
}

// ...

// Listen for updates from the server
ws.addEventListener('message', event => {
    const updatedProducts = JSON.parse(event.data);
    products = updatedProducts; // Update the local products array
    renderProductList(updatedProducts);

    if (window.location.pathname.includes('productDetails.html')) {
        const productId = new URLSearchParams(window.location.search).get('id');
        if (productId) {
            const selectedProduct = products.find(product => product.id === parseInt(productId));
            if (selectedProduct) {
                renderProductDetails(selectedProduct);
            } else {
                renderProductDetailsError();
            }
        } else {
            renderProductDetailsError();
        }
    }
});

function loadCartFromLocalStorage() {
    const cartFromStorage = localStorage.getItem('cart');
    return cartFromStorage ? JSON.parse(cartFromStorage) : [];
}

function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(productId) {
    const selectedProduct = products.find(product => product.id === productId);

    if (selectedProduct) {
        cart.push(selectedProduct);
        saveCartToLocalStorage(); // Save cart to local storage
        alert('Product added to cart!');
        
        // Redirect to cart.html
        window.location.href = 'cart.html';
    } else {
        console.error('Selected product not found.');
    }
}
function renderCart() {
    const cart = loadCartFromLocalStorage();
    const cartContainer = document.getElementById('cart');

    if (cartContainer) {
        cartContainer.innerHTML = '<h3>Shopping Cart</h3>';

        if (cart.length === 0) {
            cartContainer.innerHTML += '<p>Your cart is empty.</p>';
        } else {
            const cartTotal = cart.reduce((total, product) => total + product.price, 0);
            const cartElement = document.createElement('div');
            cartElement.classList.add('cart');
            cartElement.innerHTML = `
                <ul>
                    ${cart.map(product => `<li>${product.name} - $${product.price}</li>`).join('')}
                </ul>
                <p>Total: $${cartTotal}</p>
                <button onclick="checkout()">Checkout</button>
            `;
            cartContainer.appendChild(cartElement);
        }
    } else {
        console.error('Cart container not found.');
    }
}

// Load cart on cart.html page
renderCart();

function checkout() {
    alert('Order placed successfully!');
    clearCart(); // Clear the cart after checkout
    renderCart(); // Update cart display
}

function clearCart() {
    localStorage.removeItem('cart');
}



// Initial rendering
renderProductList([]);
