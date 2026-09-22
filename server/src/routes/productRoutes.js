const express = require('express');
const { getProducts, postProduct } = require('../controllers/productController');

const router = express.Router();

router.get('/', getProducts);
router.post('/', postProduct);

module.exports = router;
