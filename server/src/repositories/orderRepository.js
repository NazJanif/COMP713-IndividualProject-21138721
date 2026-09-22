const pool = require('../config/db');

async function findAll() {
    const [rows] = await pool.query(
        `SELECT o.id, o.product_id, p.name AS product_name, o.customer_name,
                o.customer_email, o.quantity, o.total_price, o.status, o.created_at
         FROM orders o
         JOIN products p ON p.id = o.product_id
         ORDER BY o.id DESC`
    );
    return rows;
}

async function findById(id, connection = pool) {
    const [rows] = await connection.query(
        `SELECT o.id, o.product_id, p.name AS product_name, o.customer_name,
                o.customer_email, o.quantity, o.total_price, o.status, o.created_at
         FROM orders o
         JOIN products p ON p.id = o.product_id
         WHERE o.id = ?`,
        [id]
    );
    return rows[0] || null;
}

async function create({ product_id, customer_name, customer_email, quantity, total_price }, connection) {
    const [result] = await connection.query(
        `INSERT INTO orders (product_id, customer_name, customer_email, quantity, total_price, status)
         VALUES (?, ?, ?, ?, ?, 'pending')`,
        [product_id, customer_name, customer_email, quantity, total_price]
    );
    return findById(result.insertId, connection);
}

async function updateStatus(id, status, connection) {
    await connection.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
}

module.exports = { findAll, findById, create, updateStatus };
