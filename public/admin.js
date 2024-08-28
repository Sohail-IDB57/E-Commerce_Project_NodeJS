const productList = document.getElementById('productList');
const addProductBtn = document.getElementById('addProductBtn');
const updateProductBtn = document.getElementById('updateProductBtn');
const removeProductBtn = document.getElementById('removeProductBtn');

// Initialize WebSocket connection
const ws = new WebSocket('ws://localhost:3000');

function renderProductList(products) {
    productList.innerHTML = '<h3>Product List</h3>';

    products.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <h4>ID: ${product.id}</h4>
            <h4>Name: ${product.name}</h4>
            <p>Price: $${product.price}</p>
            <p>Image: ${product.img}</p>
            <p>Unit: ${product.unit}</p>
            <p>Brand: ${product.brand}</p>
        `;
        productList.appendChild(card);
    });
}

// Add product
addProductBtn.addEventListener('click', () => {
    const productName = prompt('Enter product name:');
    const productPrice = prompt('Enter product price:');
    const productImg = prompt('Enter product image URL:');
    const productUnit = prompt('Enter product unit:');
    const productBrand = prompt('Enter product brand:');

    const newProduct = {
        id: Math.floor(Math.random() * 1000), // Random ID for simplicity
        name: productName,
        price: parseFloat(productPrice),
        img: productImg,
        unit: productUnit,
        brand: productBrand,
    };

    // Send the new product to the server
    ws.send(JSON.stringify({ type: 'addProduct', product: newProduct }));
});

// Update product
updateProductBtn.addEventListener('click', () => {
    const productId = prompt('Enter product ID to update:');
    const productName = prompt('Enter updated product name:');
    const productPrice = prompt('Enter updated product price:');
    const productImg = prompt('Enter updated product image URL:');
    const productUnit = prompt('Enter updated product unit:');
    const productBrand = prompt('Enter updated product brand:');

    const updatedProduct = {
        id: parseInt(productId),
        name: productName,
        price: parseFloat(productPrice),
        img: productImg,
        unit: productUnit,
        brand: productBrand,
    };

    // Send the updated product to the server
    ws.send(JSON.stringify({ type: 'updateProduct', product: updatedProduct }));
});

// Remove product
removeProductBtn.addEventListener('click', () => {
    const productId = prompt('Enter product ID to remove:');

    // Send the product ID to the server for removal
    ws.send(JSON.stringify({ type: 'removeProduct', productId: parseInt(productId) }));
});

// Listen for updates from the server
ws.addEventListener('message', event => {
    const updatedProducts = JSON.parse(event.data);
    renderProductList(updatedProducts);
});

// Initial rendering
renderProductList([]);
