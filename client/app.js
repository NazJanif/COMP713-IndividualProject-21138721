// Mini Shop client — talks to the Express API on the same origin.

const API = '/api';

// ---------- tabs ----------

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => {
      t.classList.remove('is-active');
      t.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.panel').forEach((p) => p.classList.remove('is-active'));

    tab.classList.add('is-active');
    tab.setAttribute('aria-selected', 'true');
    document.getElementById(`panel-${tab.dataset.tab}`).classList.add('is-active');

    if (tab.dataset.tab === 'orders') loadOrders();
    if (tab.dataset.tab === 'place-order') loadProductOptions();
  });
});

// ---------- products ----------

async function loadProducts() {
  const tbody = document.getElementById('products-tbody');
  tbody.innerHTML = '<tr><td colspan="4" class="empty">Loading products&hellip;</td></tr>';
  try {
    const res = await fetch(`${API}/products`);
    const products = await res.json();
    if (!res.ok) throw new Error(products.error || 'Failed to load products.');

    if (products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty">No products yet.</td></tr>';
      return;
    }

    tbody.innerHTML = products.map((p) => {
      const stockClass = p.stock_qty === 0 ? 'stock-out' : (p.stock_qty <= 5 ? 'stock-low' : '');
      return `
        <tr>
          <td>${escapeHtml(p.name)}</td>
          <td>${escapeHtml(p.description || '—')}</td>
          <td class="num">$${Number(p.price).toFixed(2)}</td>
          <td class="num ${stockClass}">${p.stock_qty}</td>
        </tr>`;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty">${escapeHtml(err.message)}</td></tr>`;
  }
}

document.getElementById('refresh-products').addEventListener('click', loadProducts);

document.getElementById('add-product-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const messageEl = document.getElementById('add-product-message');
  messageEl.textContent = '';
  messageEl.className = 'form-message';

  const body = {
    name: form.name.value.trim(),
    description: form.description.value.trim() || null,
    price: form.price.value,
    stock_qty: form.stock_qty.value
  };

  try {
    const res = await fetch(`${API}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add product.');

    messageEl.textContent = `Added "${data.name}".`;
    messageEl.className = 'form-message ok';
    form.reset();
    form.stock_qty.value = 0;
    loadProducts();
  } catch (err) {
    messageEl.textContent = err.message;
    messageEl.className = 'form-message error';
  }
});

// ---------- place order ----------

async function loadProductOptions() {
  const select = document.getElementById('order-product-select');
  select.innerHTML = '<option>Loading&hellip;</option>';
  try {
    const res = await fetch(`${API}/products`);
    const products = await res.json();
    if (!res.ok) throw new Error(products.error || 'Failed to load products.');

    select.innerHTML = products.map((p) =>
      `<option value="${p.id}" ${p.stock_qty === 0 ? 'disabled' : ''}>
        ${escapeHtml(p.name)} — $${Number(p.price).toFixed(2)} (${p.stock_qty} in stock)
      </option>`
    ).join('');
  } catch (err) {
    select.innerHTML = `<option value="">${escapeHtml(err.message)}</option>`;
  }
}

document.getElementById('order-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const messageEl = document.getElementById('order-message');
  messageEl.textContent = '';
  messageEl.className = 'form-message';

  const body = {
    product_id: form.product_id.value,
    quantity: form.quantity.value,
    customer_name: form.customer_name.value.trim(),
    customer_email: form.customer_email.value.trim()
  };

  try {
    const res = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to place order.');

    messageEl.textContent = `Order #${data.id} placed — total $${Number(data.total_price).toFixed(2)}.`;
    messageEl.className = 'form-message ok';
    form.reset();
    form.quantity.value = 1;
    loadProductOptions();
  } catch (err) {
    messageEl.textContent = err.message;
    messageEl.className = 'form-message error';
  }
});

// ---------- orders ledger ----------

async function loadOrders() {
  const tbody = document.getElementById('orders-tbody');
  tbody.innerHTML = '<tr><td colspan="7" class="empty">Loading orders&hellip;</td></tr>';
  try {
    const res = await fetch(`${API}/orders`);
    const orders = await res.json();
    if (!res.ok) throw new Error(orders.error || 'Failed to load orders.');

    if (orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty">No orders yet.</td></tr>';
      return;
    }

    tbody.innerHTML = orders.map((o) => `
      <tr>
        <td class="num">${o.id}</td>
        <td>${escapeHtml(o.product_name)}</td>
        <td class="num">${o.quantity}</td>
        <td class="num">$${Number(o.total_price).toFixed(2)}</td>
        <td>${escapeHtml(o.customer_name)}</td>
        <td><span class="status-pill ${o.status}">${o.status}</span></td>
        <td>
          ${o.status === 'pending'
            ? `<button class="btn btn--danger-outline btn--small" data-cancel="${o.id}">Cancel</button>`
            : ''}
        </td>
      </tr>`).join('');

    tbody.querySelectorAll('[data-cancel]').forEach((btn) => {
      btn.addEventListener('click', () => cancelOrder(btn.dataset.cancel));
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty">${escapeHtml(err.message)}</td></tr>`;
  }
}

async function cancelOrder(id) {
  try {
    const res = await fetch(`${API}/orders/${id}/cancel`, { method: 'PATCH' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to cancel order.');
    loadOrders();
    loadProducts();
  } catch (err) {
    alert(err.message);
  }
}

document.getElementById('refresh-orders').addEventListener('click', loadOrders);

// ---------- utils ----------

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

// ---------- init ----------

loadProducts();
