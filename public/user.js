const productDetailsContainer = document.getElementById('productDetails'); 

// Initialize WebSocket connection
const ws = new WebSocket('ws://localhost:3000');

let products = [];


function renderProductList(products) {
    const vegetableProductList = document.getElementById('vegetableProductList');
    const fruitProductList = document.getElementById('fruitProductList');
    const dairyProductList = document.getElementById('dairyProductList');

    if (!vegetableProductList || !fruitProductList || !dairyProductList) {
        console.error('Category product lists not found.');
        return;
    }

    vegetableProductList.innerHTML = '<h3>Vegetables</h3>';
    fruitProductList.innerHTML = '<h3>Fruits</h3>';
    dairyProductList.innerHTML = '<h3>Dairy</h3>';

    products.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <img src="/images/${product.img}" alt="${product.name}" width="100px" height="100px">
            <h4>${product.name}</h4>
            <p>Price: ৳ ${product.price} TK</p>   
            <p>Unit: ${product.unit}</p>
            <p>Brand: ${product.brand}</p>
            <button onclick="showProductDetails(${product.id})">Details</button>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
        `;

        // Append the card to the respective category list
        if (product.category === 'vegetable') {
            vegetableProductList.appendChild(card);
        } else if (product.category === 'fruit') {
            fruitProductList.appendChild(card);
        } else if (product.category === 'dairy') {
            dairyProductList.appendChild(card);
        }
    });
}

function showProductDetails(productId) {
    // Placeholder function for showing product details
    window.location.href = `productDetails.html?id=${productId}`;
}

function renderProductDetails(product) {
        productDetailsContainer.innerHTML = `
            <img src="/images/${product.img}" alt="${product.name}" width="250px" height="250px">  
            <h4>${product.name}</h4>
            <p>Price: ৳ ${product.price} TK</p>
            <p>Unit: ${product.unit}</p>
            <p>Brand: ${product.brand}</p>
            <p>Description: ${product.description}</p>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
        `;
    }
    
    function renderProductDetailsError() {
        productDetailsContainer.innerHTML = '<p>Product details not available.</p>';
    }
    
    
    // // Listen for updates from the server
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


const cartContainer = document.getElementById('cart');
let cart = loadCartFromLocalStorage();

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
        const existingCartItem = cart.find(item => item.id === productId);

        if (existingCartItem) {
            // Product already in cart, increase quantity
            existingCartItem.quantity = (existingCartItem.quantity || 1) + 1;
        } else {
            // Product not in cart, add with quantity 1
            const newCartItem = { ...selectedProduct, quantity: 1 };
            cart.push(newCartItem);
        }

        saveCartToLocalStorage(); // Save cart to local storage
        alert('Product added to cart!');
        renderCart(); // Update cart display
    } else {
        console.error('Selected product not found.');
    }
}

function renderCart() {
    if (cartContainer) {
        cartContainer.innerHTML = '';

        if (cart.length === 0) {
            cartContainer.innerHTML += '<p>Your cart is empty.</p>';
        } else {
            const cartTotal = cart.reduce((total, product) => total + product.price * product.quantity, 0);
            const cartElement = document.createElement('div');
            cartElement.classList.add('cart');
            cartElement.innerHTML = cart.map(product => `
                <div class="cart-item">
                    <img src="/images/${product.img}" alt="${product.name}" width="50" height="50">
                    <div class="cart-item-details">
                        <p>${product.name}</p>
                        <p>৳ ${product.price} TK</p>
                        <input type="number" value="${product.quantity}" min="1" onchange="updateQuantity(${product.id}, this.value)">
                        <button onclick="removeFromCart(${product.id})">Remove</button>
                    </div>
                </div>`
            ).join('');

            cartElement.innerHTML += `<p>Total: ৳ ${cartTotal} TK</p>`;
            cartElement.innerHTML += `<button onclick="checkout()">Checkout</button>`;

            cartContainer.appendChild(cartElement);
        }
    } else {
        console.error('Cart container not found.');
    }
}

function updateQuantity(productId, newQuantity) {
    const selectedProduct = cart.find(product => product.id === productId);

    if (selectedProduct) {
        selectedProduct.quantity = parseInt(newQuantity, 10);
        saveCartToLocalStorage(); // Save updated cart to local storage
        renderCart(); // Update cart display
    } else {
        console.error('Selected product not found in the cart.');
    }
}

function removeFromCart(productId) {
    cart = cart.filter(product => product.id !== productId);
    saveCartToLocalStorage(); // Save updated cart to local storage
    renderCart(); // Update cart display
}

// Load cart on cart.html page
renderCart();

function checkout() {
    const customerName = prompt('Enter your name:');
    const customerAddress = prompt('Enter Address:');
    const customerPhone = prompt('Enter Phone no:');

    if (customerName && customerAddress && customerPhone) {
        const orderDetails = {
            name: customerName,
            address: customerAddress,
            phone: customerPhone,
            cart: cart,
            total: calculateCartTotal(),
        };

        
        clearCart(); 
        renderCart(); // Update cart display

        alert('Order placed successfully! Thank you for shopping with us.\nOrder Details:\n' +
            `Name: ${customerName}\nAddress: ${customerAddress}\nPhone: ${customerPhone}\nTotal Amount: ৳ ${orderDetails.total} TK`);
    } else {
        alert('Invalid input. Please provide valid information.');
    }
}
function clearCart() {
    localStorage.removeItem('cart');
}

function calculateCartTotal() {
    return cart.reduce((total, product) => total + product.price * product.quantity, 0);
}

    

// Listen for updates from the server
ws.addEventListener('message', event => {
    const updatedProducts = JSON.parse(event.data);
    console.log('Received updated products:', updatedProducts);
    products = updatedProducts; // Update the local products array
    renderProductList(products);
});



// Toggle btn

$(".menu-item .sub-btn").click(function () {
    $(this).next(".sub-menu").slideToggle();
    $(this).find(".fa-angle-down").toggleClass("rotated"); 
});


var menu = document.querySelector(".menu");
var menuBtn = document.querySelector(".menu-btn");
var closeBtn = document.querySelector(".close-btn");

menuBtn.addEventListener("click", () => {
    menu.classList.add("active");
});

closeBtn.addEventListener("click", () => {
    menu.classList.remove("active");
});


