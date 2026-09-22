-- Sample products so the demo has something to order immediately.
-- Applied once by initDb.js, only if the products table is empty.
INSERT INTO products (name, description, price, stock_qty) VALUES
    ('Wireless Mouse',      'Compact 2.4GHz wireless mouse',          29.99, 15),
    ('Mechanical Keyboard', '87-key hot-swappable mechanical board',  89.99,  8),
    ('USB-C Hub',           '7-in-1 USB-C hub with HDMI',             45.50, 20),
    ('Webcam 1080p',        'Full HD webcam with built-in mic',       39.99,  0);
