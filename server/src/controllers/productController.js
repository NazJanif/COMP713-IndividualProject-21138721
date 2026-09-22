// Controller layer — parses HTTP requests, calls the service, and maps
// results/errors to HTTP responses
const productService = require('../services/productService');

async function getProducts(req, res, next) {
    try {
        const products = await productService.listProducts();
        res.status(200).json(products);
    } catch (err) {
        next(err);
    }
}

async function postProduct(req, res, next) {
    try {
        const product = await productService.createProduct(req.body);
        res.status(201).json(product);
    } catch (err) {
        next(err);
    }
}

module.exports = { getProducts, postProduct };
