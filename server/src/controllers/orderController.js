const orderService = require('../services/orderService');

async function getOrders(req, res, next) {
    try {
        const orders = await orderService.listOrders();
        res.status(200).json(orders);
    } catch (err) {
        next(err);
    }
}

async function postOrder(req, res, next) {
    try {
        const order = await orderService.placeOrder(req.body);
        res.status(201).json(order);
    } catch (err) {
        next(err);
    }
}

async function cancelOrder(req, res, next) {
    try {
        const order = await orderService.cancelOrder(req.params.id);
        res.status(200).json(order);
    } catch (err) {
        next(err);
    }
}

module.exports = { getOrders, postOrder, cancelOrder };
