// Run with: npm run init-db
// Reads sql/schema.sql and executes it against the configured database,
// creating the tables (and seed products) if they don't already exist.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function initDb() {
    const schemaPath = path.join(__dirname, '..', '..', 'sql', 'schema.sql');
    const seedPath = path.join(__dirname, '..', '..', 'sql', 'seed.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 3306,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        multipleStatements: true
    });

    try {
        console.log(`Connecting to ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME} ...`);
        await connection.query(schemaSql);
        console.log('Tables created (or already existed).');

        const [rows] = await connection.query('SELECT COUNT(*) AS count FROM products');
        if (rows[0].count === 0) {
            await connection.query(seedSql);
            console.log('Seed products inserted.');
        } else {
            console.log('Products table already has data — skipping seed.');
        }
    } catch (err) {
        console.error('Failed to apply schema:', err.message);
        process.exitCode = 1;
    } finally {
        await connection.end();
    }
}

initDb();
