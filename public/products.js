const products = [
    { id: 1, name: 'Product 1', price: 10, img: 'product1.jpg', unit: 'pcs', brand: 'Brand A' },
    { id: 2, name: 'Product 2', price: 15, img: 'product2.jpg', unit: 'kg', brand: 'Brand B' },
    // { id: 3, name: 'Product 3', price: 20, img: 'product3.jpg', unit: 'pcs', brand: 'Brand C' },
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = products;
}
