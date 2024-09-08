const addProductSection = document.getElementById('addProductSection');
const updateProductSection = document.getElementById('updateProductSection');
const removeProductSection = document.getElementById('removeProductSection');

// Function to display/hide sections
function displaySection(section) {
    addProductSection.style.display = 'none';
    updateProductSection.style.display = 'none';
    removeProductSection.style.display = 'none';

    if (section === 'add') {
        addProductSection.style.display = 'block';
    } else if (section === 'update') {
        updateProductSection.style.display = 'block';
    } else if (section === 'remove') {
        removeProductSection.style.display = 'block';
    } else if (section === 'none') {
        return; // Hide all sections
    }
}

// Function to render the initial product list
function renderInitialProductList() {
    const vegetableProductList = document.getElementById('vegetableProductList');
    const fruitProductList = document.getElementById('fruitProductList');
    const dairyProductList = document.getElementById('dairyProductList');

    // Make sure the elements exist before calling renderProductList
    if (vegetableProductList) {
        renderProductList([], vegetableProductList, 'vegetable');
    } else {
        console.error("Vegetable product list element not found.");
    }

    if (fruitProductList) {
        renderProductList([], fruitProductList, 'fruit');
    } else {
        console.error("Fruit product list element not found.");
    }

    if (dairyProductList) {
        renderProductList([], dairyProductList, 'dairy');
    } else {
        console.error("Dairy product list element not found.");
    }
}

const addProductForm = document.getElementById('addProductForm');
const updateProductForm = document.getElementById('updateProductForm');
const removeProductForm = document.getElementById('removeProductForm');

const ws = new WebSocket('ws://localhost:3000');

// Event listener for add product form submission
if (addProductForm) {
    addProductForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const productName = document.getElementById('productNameAdd');
        const productPrice = document.getElementById('productPriceAdd');
        const productUnit = document.getElementById('productUnitAdd');
        const productBrand = document.getElementById('productBrandAdd');
        const category = document.getElementById('categoryAdd');
        const description = document.getElementById('descriptionAdd');
        const imageInput = document.getElementById('imageInputAdd');

        if (productName && productPrice && productUnit && productBrand && category && description && imageInput) {
            const productNameValue = productName.value;
            const productPriceValue = productPrice.value;
            const productUnitValue = productUnit.value;
            const productBrandValue = productBrand.value;
            const categoryValue = category.value;  // Get the selected category
            const descriptionValue = description.value;
            const productImg = imageInput.files.length > 0 ? imageInput.files[0].name : "";

            const newProduct = {
                id: Math.floor(Math.random() * 1000),
                name: productNameValue,
                price: parseFloat(productPriceValue),
                unit: productUnitValue,
                brand: productBrandValue,
                category: categoryValue,
                description: descriptionValue,
                img: productImg,
            };

            // Send the new product to the server
            ws.send(JSON.stringify({ type: 'addProduct', product: newProduct }));
            addProductForm.reset();

            // Add the new product to local storage
            saveProductToLocal(newProduct);

            // Hide the add product section
            displaySection('none');
        }
    });
}

// Function to save product to local storage
function saveProductToLocal(product) {
    // Get existing products from local storage
    const existingProducts = JSON.parse(localStorage.getItem('products')) || [];

    // Add the new product
    existingProducts.push(product);

    // Save the updated products back to local storage
    localStorage.setItem('products', JSON.stringify(existingProducts));
}

// Event listener for update product form submission
if (updateProductForm) {
    updateProductForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // Extract form data
        const productId = document.getElementById('updateProductId').value;
        const productName = document.getElementById('updateProductName').value;
        const productPrice = document.getElementById('updateProductPrice').value;
        const productUnit = document.getElementById('updateProductUnit').value;
        const productBrand = document.getElementById('updateProductBrand').value;
        const category = document.getElementById('updateCategory').value;
        const description = document.getElementById('updateDescription').value;
        const imageInput = document.getElementById('updateImageInput');
        const productImg = imageInput.files.length > 0 ? imageInput.files[0].name : "";

        const updatedProduct = {
            id: parseInt(productId),
            name: productName,
            price: parseFloat(productPrice),
            unit: productUnit,
            brand: productBrand,
            category: category,
            description: description,
            img: productImg,
        };

        // Send the updated product to the server
        ws.send(JSON.stringify({ type: 'updateProduct', product: updatedProduct }));
        updateProductForm.reset();

        // Hide the update product section
        displaySection('none');
    });
}

// Event listener for remove product form submission
if (removeProductForm) {
    removeProductForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // Extract form data
        const removeProductId = document.getElementById('removeProductId').value;

        // Send the product ID to the server for removal
        ws.send(JSON.stringify({ type: 'removeProduct', productId: parseInt(removeProductId) }));
        removeProductForm.reset();

        // Hide the remove product section
        displaySection('none');
    });
}

// Listen for updates from the server
ws.addEventListener('message', (event) => {
    const updatedProducts = JSON.parse(event.data);

    // Ensure product list elements exist before calling renderProductList
    const vegetableProductList = document.getElementById('vegetableProductList');
    const fruitProductList = document.getElementById('fruitProductList');
    const dairyProductList = document.getElementById('dairyProductList');

    if (vegetableProductList) {
        renderProductList(updatedProducts, vegetableProductList, 'vegetable');
    }
    if (fruitProductList) {
        renderProductList(updatedProducts, fruitProductList, 'fruit');
    }
    if (dairyProductList) {
        renderProductList(updatedProducts, dairyProductList, 'dairy');
    }
});

// Function to render the product list based on category
function renderProductList(products, productListElement, category) {
    if (!productListElement) {
        console.error(`Product list element for category '${category}' is undefined or null.`);
        return;
    }

    productListElement.innerHTML = '';

    const storedProducts = JSON.parse(localStorage.getItem('products')) || [];
    const allProducts = [...products, ...storedProducts];
    const uniqueProducts = allProducts.reduce((acc, current) => {
        if (!acc.some(product => product.id === current.id)) {
            acc.push(current);
        }
        return acc;
    }, []);

    const filteredProducts = category === 'all' ? uniqueProducts : uniqueProducts.filter(product => product.category === category);

    filteredProducts.forEach((product) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <img src="/images/${product.img}" alt="${product.name}" width="100px" height="100px">    
            <h4>ID: ${product.id}</h4>
            <h4>Name: ${product.name}</h4>
            <p>Price: BDT ${product.price} TK</p>
            <p>Unit: ${product.unit}</p>
            <p>Brand: ${product.brand}</p>
            <button class="update-btn" onclick="displaySection('update'); populateUpdateForm(${product.id});">Update</button>
            <button onclick="displaySection('remove'); populateRemoveForm(${product.id});">Remove</button>
        `;

        productListElement.appendChild(card);
    });
}


// Call the function to render the initial product list when the page loads
document.addEventListener('DOMContentLoaded', renderInitialProductList);

// Handle WebSocket connection errors
ws.addEventListener('error', (error) => {
    console.error('WebSocket Error:', error);
    alert('Unable to connect to the server. Please try again later.');
});
