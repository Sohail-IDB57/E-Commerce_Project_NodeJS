const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

// Sample products data
let products = [];

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve products to the admin route
app.get('/admin/products', (req, res) => {
    res.json(products);
});

// Handle admin actions
app.post('/admin/addProduct', express.json(), (req, res) => {
    const newProduct = req.body;
    newProduct.id = products.length + 1;
    products.push(newProduct);

    // Notify all connected users about the new product
    notifyUsers({ type: 'addProduct', product: newProduct });

    // Send the updated product list to WebSocket clients
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(products));
        }
    });

    res.json({ success: true });
});

app.post('/admin/updateProduct', express.json(), (req, res) => {
    const updatedProduct = req.body;
    const index = products.findIndex(product => product.id === updatedProduct.id);
    
    if (index !== -1) {
        products[index] = updatedProduct;

        // Notify all connected users about the updated product
        notifyUsers({ type: 'updateProduct', product: updatedProduct });

        // Send the updated product list to WebSocket clients
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(products));
            }
        });

        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Product not found' });
    }
});
app.post('/admin/removeProduct', express.json(), (req, res) => {
    const productId = req.body.id;
    products = products.filter(product => product.id !== productId);

    // Notify all connected users about the removed product
    notifyUsers({ type: 'removeProduct', productId });

    res.json({ success: true });
});

// WebSocket connection handling
wss.on('connection', ws => {
    // Send the initial product list to the user on connection
    ws.send(JSON.stringify(products));

    // Listen for admin updates
    ws.on('message', message => {
        const data = JSON.parse(message);
        
        if (data.type === 'addProduct' || data.type === 'updateProduct' || data.type === 'removeProduct') {
            // Update the products array
            if (data.type === 'addProduct') {
                products.push(data.product);
            } else if (data.type === 'updateProduct') {
                const index = products.findIndex(p => p.id === data.product.id);
                if (index !== -1) {
                    products[index] = data.product;
                }
            } else if (data.type === 'removeProduct') {
                products = products.filter(p => p.id !== data.productId);
            }

            // Send the updated product list to all connected users
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(products));
                }
            });
        }
    });
});

// Serve admin.html for the admin route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve user.html for the user route
app.get('/user', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user.html'));
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
