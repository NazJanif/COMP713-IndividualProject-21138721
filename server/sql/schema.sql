-- Customer–Order Mini Shop
-- Schema: products (1) -----< orders (many)

CREATE TABLE IF NOT EXISTS products (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(120)   NOT NULL,
    description VARCHAR(500)   NULL,
    price       DECIMAL(10,2)  NOT NULL,
    stock_qty   INT            NOT NULL DEFAULT 0,
    created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id     BIGINT         NOT NULL,
    customer_name  VARCHAR(120)   NOT NULL,
    customer_email VARCHAR(160)   NOT NULL,
    quantity       INT            NOT NULL,
    total_price    DECIMAL(10,2)  NOT NULL,
    status         ENUM('pending', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_product
        FOREIGN KEY (product_id) REFERENCES products(id)
);


