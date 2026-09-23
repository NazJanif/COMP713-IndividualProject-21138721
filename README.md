# Mini Shop — Customer–Order Mini Shop

COMP713 Individual Project — Assessment 2, Option A (Distributed Web/API Application).

A small distributed web/API application: a browser client talks to an
Express REST API, which persists data in a MySQL database. Customers
browse products and place orders; placing or cancelling an order runs
inside a database transaction so stock levels and order status never
drift out of sync.

## Software and tools required

- Node.js 18+ (developed and tested on Node 22)
- npm (bundled with Node)
- A MySQL-compatible database (tested against MySQL 8 / MariaDB 10.11,
  including AWS RDS MySQL)
- A modern browser (Chrome, Firefox, Edge)

No build step, framework CLI, or bundler is required — the client is
plain HTML/CSS/JS, served directly by the Express server.

## Project structure

```
mini-shop/
├── server/                  Express API
│   ├── src/
│   │   ├── config/          DB connection pool + schema init script
│   │   ├── controllers/     HTTP request/response handling
│   │   ├── services/        Business rules + DB transactions
│   │   ├── repositories/    SQL (prepared statements) — the only layer that talks SQL
│   │   ├── middleware/      Error handling + AppError type
│   │   ├── routes/          Route definitions
│   │   ├── app.js           Express app wiring (middleware, routes, static client)
│   │   └── server.js        Entry point
│   ├── sql/
│   │   ├── schema.sql       Table definitions (products, orders)
│   │   └── seed.sql         Sample product data
│   ├── .env.example         Template for local environment config
│   └── package.json
├── client/                  Static browser client (served by Express)
│   ├── index.html
│   ├── style.css
│   └── app.js
└── docs/                    Supporting documentation for the report
```

## Setup instructions

1. **Install dependencies**

   ```bash
   cd server
   npm install
   ```

2. **Configure the database connection**

   Copy the example environment file and fill in your own values:

   ```bash
   cp .env.example .env
   ```

   Edit `.env`:

   ```
   DB_HOST=your-database-host
   DB_PORT=3306
   DB_NAME=comp713_21138721
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   PORT=3000
   ```
  Note: the AWS RDS MySQL instance requires SSL. The connection pool (src/config/db.js) and schema-init script (src/config/initDb.js) are both configured with ssl: { rejectUnauthorized: false } to connect over TLS without validating RDS's certificate chain
   

3. **Create the database** 

   Connect to your MySQL server and run:

   ```sql
   CREATE DATABASE mini_shop;
   ```

4. **Create the tables and load sample data**

   ```bash
   npm run init-db
   ```

   This applies `sql/schema.sql` (creates `products` and `orders`,
   with `orders.product_id` as a foreign key into `products`) and,
   only if the `products` table is empty, loads four sample products
   from `sql/seed.sql`. It's safe to re-run.

## Starting the system

```bash
npm start
```

You should see:

```
Mini Shop API listening on http://localhost:3000
```

Open **http://localhost:3000** in a browser. The client, API, and
static file server all run from this single command and single port —
there is nothing else to start separately.

For development with auto-restart on file changes:

```bash
npm run dev
```

## Testing the main functions

### Via the browser client

1. **Products tab** — lists all products with live stock levels.
   Use "+ Add a new product" to create a new one (a basic admin-style
   create function).
2. **Place order tab** — pick a product, quantity, name, and email,
   then submit. Products with 0 stock are disabled in the dropdown.
   A successful order shows its id and total; the product's stock
   drops immediately.
3. **Orders ledger tab** — lists all orders. Pending orders show a
   **Cancel** button; cancelling restores the product's stock and
   marks the order `cancelled` (the button then disappears for that
   order).

### Via the API directly (for automated/scripted testing)

```bash
# Health check
curl http://localhost:3000/api/health

# List products
curl http://localhost:3000/api/products

# Add a product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Desk Lamp","description":"LED desk lamp","price":19.99,"stock_qty":10}'

# Place an order (product_id 1 must have enough stock)
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"product_id":1,"customer_name":"Alice Tan","customer_email":"alice@example.com","quantity":3}'

# List orders
curl http://localhost:3000/api/orders

# Cancel an order
curl -X PATCH http://localhost:3000/api/orders/1/cancel
```

### Error-handling / invalid-input cases to demonstrate

| Case | Request | Expected result |
|---|---|---|
| Missing product name | `POST /api/products` with no `name` | `400` — "Product name is required." |
| Order exceeds stock | `POST /api/orders` with `quantity` > `stock_qty` | `409` — "Insufficient stock for ..." |
| Order for unknown product | `POST /api/orders` with a non-existent `product_id` | `404` — "Product X does not exist." |
| Invalid email | `POST /api/orders` with a malformed `customer_email` | `400` — "A valid customer_email is required." |
| Cancel unknown order | `PATCH /api/orders/999/cancel` | `404` — "Order 999 does not exist." |
| Cancel twice | `PATCH` the same order id twice | Second call: `409` — "Order X is already cancelled." |
| Unknown route | Any request to an undefined path | `404` — "No route for ..." |

## Configuration reference

| Env var | Purpose | Example |
|---|---|---|
| `DB_HOST` | MySQL host | `comp713-....rds.amazonaws.com` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | Database name | `mini_shop` |
| `DB_USER` | MySQL username | — |
| `DB_PASSWORD` | MySQL password | — |
| `PORT` | Port the Express server listens on | `3000` |

## Known limitations

- No authentication/authorization — this is a single-tenant demo, not
  a production multi-user system.
- No automated test suite (unit/integration tests); the app was
  verified manually and via the `curl` cases above.
- Products can be created and listed, but not edited or deleted, from
  the API/UI — out of scope for the assignment's indicative size.
- No pagination on `GET /api/products` or `GET /api/orders` — fine at
  demo scale, would need addressing for a larger dataset.
- Prices are returned by `mysql2` as strings (a `DECIMAL` driver
  quirk); the client converts with `Number(...)` before formatting.
- TLS certificate validation is disabled (rejectUnauthorized: false) when connecting to the database  

## Possible improvements

- Add authentication so orders are tied to a logged-in customer.
- Add product update/delete endpoints for full CRUD.
- Add pagination and search/filtering on the products and orders lists.
- Add an automated test suite (e.g. Jest + Supertest) covering the
  service layer and API contract.
