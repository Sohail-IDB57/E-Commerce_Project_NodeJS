const express = require('express');
const path = require('path');
const http = require('http');
const formidable = require('formidable');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

let products = [];

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve admin.html for the admin route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve user.html for the user route
app.get('/user', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user.html'));
});

// Handle file uploads using formidable
app.post('/admin/addProduct', (req, res) => {
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error parsing form data.' });
        }

        const newProduct = {
            id: generateUniqueId(),
            name: fields.productName,
            price: parseFloat(fields.productPrice),
            unit: fields.productUnit,
            brand: fields.productBrand,
            category: fields.category,
            description: fields.description,
            img: files.image ? files.image.name : null, // Assuming the file input has the name 'image'
        };

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
                // Use a more robust method to generate unique IDs
                data.product.id = generateUniqueId();
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

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

// Generate a unique ID (replace this with a more robust method)
 function generateUniqueId() {
     return Math.floor(Math.random() * 1000);
 }

// Notify all connected users
function notifyUsers(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

