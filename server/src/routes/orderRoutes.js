const express = require('express');
const { getOrders, postOrder, cancelOrder } = require('../controllers/orderController');

const router = express.Router();

router.get('/', getOrders);
router.post('/', postOrder);
router.patch('/:id/cancel', cancelOrder);

module.exports = router;
