const productRepository = require('../repositories/productRepository');
const AppError = require('../middleware/AppError');

async function listProducts() {
    return productRepository.findAll();
}

async function createProduct({ name, description, price, stock_qty }) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
        throw new AppError('Product name is required.', 400);
    }
    if (price === undefined || Number.isNaN(Number(price)) || Number(price) < 0) {
        throw new AppError('Price must be a non-negative number.', 400);
    }
    const qty = stock_qty === undefined ? 0 : Number(stock_qty);
    if (Number.isNaN(qty) || qty < 0) {
        throw new AppError('stock_qty must be a non-negative integer.', 400);
    }

    return productRepository.create({
        name: name.trim(),
        description: description ?? null,
        price: Number(price),
        stock_qty: qty
    });
}

module.exports = { listProducts, createProduct };
