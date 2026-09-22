const path = require('path');
const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Serve the client (Products / Place Order / My Orders page) from the
// same origin as the API, so the whole app runs with one `npm start`
// and no cross-origin requests are needed for the demo.
app.use(express.static(path.join(__dirname, '..', '..', 'client')));

// Simple request log — useful when demonstrating communication in the video.
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
    next();
});

app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
