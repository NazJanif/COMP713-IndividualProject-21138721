// Repository layer — the only place that talks SQL to the database
// All queries use parameterised (?) placeholders — mysql2 sends these
// as prepared statements, never string-concatenated SQL
const pool = require('../config/db');

async function findAll() {
    const [rows] = await pool.query(
        'SELECT id, name, description, price, stock_qty, created_at FROM products ORDER BY id'
    );
    return rows;
}

async function findById(id, connection = pool) {
    const [rows] = await connection.query(
        'SELECT id, name, description, price, stock_qty, created_at FROM products WHERE id = ?',
        [id]
    );
    return rows[0] || null;
}

async function create({ name, description, price, stock_qty }) {
    const [result] = await pool.query(
        'INSERT INTO products (name, description, price, stock_qty) VALUES (?, ?, ?, ?)',
        [name, description ?? null, price, stock_qty]
    );
    return findById(result.insertId);
}

async function decrementStock(id, quantity, connection) {
    await connection.query(
        'UPDATE products SET stock_qty = stock_qty - ? WHERE id = ?',
        [quantity, id]
    );
}

async function incrementStock(id, quantity, connection) {
    await connection.query(
        'UPDATE products SET stock_qty = stock_qty + ? WHERE id = ?',
        [quantity, id]
    );
}

module.exports = { findAll, findById, create, decrementStock, incrementStock };
