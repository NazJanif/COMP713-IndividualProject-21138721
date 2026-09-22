// Service layer — business rules and transaction boundaries live here
// following the Controller / Service / Repository split from class 10
// placeOrder and cancelOrder each touch two tables (products, orders) and
// must succeed or fail together, so each is wrapped in a single
// transaction: BEGIN ... COMMIT, or ROLLBACK if any step fails.
const pool = require('../config/db');
const orderRepository = require('../repositories/orderRepository');
const productRepository = require('../repositories/productRepository');
const AppError = require('../middleware/AppError');

async function listOrders() {
    return orderRepository.findAll();
}

async function placeOrder({ product_id, customer_name, customer_email, quantity }) {
    if (!product_id) throw new AppError('product_id is required.', 400);
    if (!customer_name || customer_name.trim() === '') {
        throw new AppError('customer_name is required.', 400);
    }
    if (!customer_email || !/^\S+@\S+\.\S+$/.test(customer_email)) {
        throw new AppError('A valid customer_email is required.', 400);
    }
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
        throw new AppError('quantity must be a positive integer.', 400);
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const product = await productRepository.findById(product_id, connection);
        if (!product) {
            throw new AppError(`Product ${product_id} does not exist.`, 404);
        }
        if (product.stock_qty < qty) {
            throw new AppError(
                `Insufficient stock for "${product.name}": requested ${qty}, only ${product.stock_qty} available.`,
                409
            );
        }

        const total_price = Number(product.price) * qty;

        await productRepository.decrementStock(product_id, qty, connection);
        const order = await orderRepository.create(
            { product_id, customer_name: customer_name.trim(), customer_email, quantity: qty, total_price },
            connection
        );

        await connection.commit();
        return order;
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

async function cancelOrder(orderId) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const order = await orderRepository.findById(orderId, connection);
        if (!order) {
            throw new AppError(`Order ${orderId} does not exist.`, 404);
        }
        if (order.status === 'cancelled') {
            throw new AppError(`Order ${orderId} is already cancelled.`, 409);
        }

        await productRepository.incrementStock(order.product_id, order.quantity, connection);
        await orderRepository.updateStatus(orderId, 'cancelled', connection);

        await connection.commit();
        return orderRepository.findById(orderId);
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

module.exports = { listOrders, placeOrder, cancelOrder };
