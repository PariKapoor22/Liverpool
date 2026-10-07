const express = require('express');
const cors = require('cors');

const app = express();
const PORT = Number(process.env.PORT || 5000);
const MAX_CONNECTIONS = 20;
const ALLOWED_POOL_SIZES = [5, 10, 20, 30, 50];
const REQUEST_WINDOW_MS = 1000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const initialProducts = [
  // LAPTOPS
  {
    id: 1,
    name: 'MacBook Air M4',
    price: 89990,
    stock: 18,
    category: 'Laptops',
    rating: 4.9,
    reviews: 328,
    badge: 'BEST SELLER',
    image: 'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 7,
    name: 'Dell XPS 14',
    price: 124990,
    stock: 12,
    category: 'Laptops',
    rating: 4.7,
    reviews: 143,
    badge: 'PRO PICK',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 11,
    name: 'ASUS ROG Zephyrus G16',
    price: 159990,
    stock: 9,
    category: 'Laptops',
    rating: 4.8,
    reviews: 187,
    badge: 'GAMING',
    image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 12,
    name: 'HP Spectre x360',
    price: 119990,
    stock: 15,
    category: 'Laptops',
    rating: 4.7,
    reviews: 164,
    badge: 'PREMIUM',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 13,
    name: 'Lenovo Yoga Slim 7',
    price: 79990,
    stock: 23,
    category: 'Laptops',
    rating: 4.6,
    reviews: 219,
    badge: 'VALUE',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85'
  },

  // SMARTPHONES
  {
    id: 2,
    name: 'Galaxy S25 Ultra',
    price: 99999,
    stock: 31,
    category: 'Smartphones',
    rating: 4.8,
    reviews: 512,
    badge: 'TRENDING',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 14,
    name: 'iPhone 17 Pro',
    price: 134900,
    stock: 16,
    category: 'Smartphones',
    rating: 4.9,
    reviews: 741,
    badge: 'NEW',
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 15,
    name: 'Google Pixel 10 Pro',
    price: 109999,
    stock: 19,
    category: 'Smartphones',
    rating: 4.8,
    reviews: 382,
    badge: 'AI PHONE',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 16,
    name: 'OnePlus 13',
    price: 69999,
    stock: 34,
    category: 'Smartphones',
    rating: 4.7,
    reviews: 428,
    badge: 'FAST SELLER',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 17,
    name: 'Nothing Phone 3',
    price: 54999,
    stock: 27,
    category: 'Smartphones',
    rating: 4.6,
    reviews: 196,
    badge: 'TRENDING',
    image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=900&q=85'
  },

  // AUDIO
  {
    id: 3,
    name: 'Sony WH-1000XM6',
    price: 29990,
    stock: 46,
    category: 'Audio',
    rating: 4.7,
    reviews: 286,
    badge: 'TOP RATED',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 6,
    name: 'AirPods Pro 2',
    price: 24990,
    stock: 52,
    category: 'Audio',
    rating: 4.9,
    reviews: 634,
    badge: 'HOT',
    image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 18,
    name: 'Bose QuietComfort Ultra',
    price: 34990,
    stock: 28,
    category: 'Audio',
    rating: 4.8,
    reviews: 341,
    badge: 'PREMIUM',
    image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 19,
    name: 'JBL Live 770NC',
    price: 11999,
    stock: 64,
    category: 'Audio',
    rating: 4.6,
    reviews: 267,
    badge: 'VALUE',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 20,
    name: 'Marshall Emberton III',
    price: 16999,
    stock: 35,
    category: 'Audio',
    rating: 4.8,
    reviews: 223,
    badge: 'FAN FAVORITE',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85'
  },

  // WEARABLES
  {
    id: 4,
    name: 'Apple Watch Series 11',
    price: 41990,
    stock: 24,
    category: 'Wearables',
    rating: 4.8,
    reviews: 194,
    badge: 'NEW',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 21,
    name: 'Samsung Galaxy Watch 8',
    price: 34999,
    stock: 29,
    category: 'Wearables',
    rating: 4.7,
    reviews: 173,
    badge: 'NEW',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 22,
    name: 'Garmin Venu 4',
    price: 44990,
    stock: 17,
    category: 'Wearables',
    rating: 4.8,
    reviews: 152,
    badge: 'FITNESS',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=900&q=85'
  },

  // TABLETS
  {
    id: 5,
    name: 'iPad Air M3',
    price: 64990,
    stock: 27,
    category: 'Tablets',
    rating: 4.8,
    reviews: 241,
    badge: 'LIMITED',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 9,
    name: 'Kindle Paperwhite',
    price: 14999,
    stock: 38,
    category: 'Tablets',
    rating: 4.6,
    reviews: 215,
    badge: 'VALUE',
    image: 'https://images.unsplash.com/photo-1592496001020-d31bd830651f?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 23,
    name: 'Samsung Galaxy Tab S10',
    price: 74999,
    stock: 21,
    category: 'Tablets',
    rating: 4.7,
    reviews: 188,
    badge: 'PRODUCTIVE',
    image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=900&q=85'
  },

  // GAMING
  {
    id: 8,
    name: 'PlayStation 5 Slim',
    price: 54990,
    stock: 21,
    category: 'Gaming',
    rating: 4.9,
    reviews: 477,
    badge: 'FLASH DEAL',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 24,
    name: 'Xbox Series X',
    price: 52990,
    stock: 14,
    category: 'Gaming',
    rating: 4.8,
    reviews: 356,
    badge: 'HOT',
    image: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 25,
    name: 'Nintendo Switch OLED',
    price: 34990,
    stock: 26,
    category: 'Gaming',
    rating: 4.8,
    reviews: 421,
    badge: 'POPULAR',
    image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 26,
    name: 'Logitech G Pro X Superlight',
    price: 12999,
    stock: 43,
    category: 'Gaming',
    rating: 4.7,
    reviews: 312,
    badge: 'GAMER PICK',
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=85'
  },

  // ACCESSORIES
  {
    id: 10,
    name: 'Logitech MX Master 3S',
    price: 8995,
    stock: 61,
    category: 'Accessories',
    rating: 4.8,
    reviews: 389,
    badge: 'STAFF PICK',
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 27,
    name: 'Keychron K2 Pro',
    price: 9999,
    stock: 47,
    category: 'Accessories',
    rating: 4.7,
    reviews: 248,
    badge: 'MECHANICAL',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 28,
    name: 'Anker 737 Power Bank',
    price: 8999,
    stock: 58,
    category: 'Accessories',
    rating: 4.6,
    reviews: 294,
    badge: 'FAST CHARGE',
    image: 'https://images.unsplash.com/photo-1609592424263-6e2f2e2a0c4e?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 29,
    name: 'Apple Magic Keyboard',
    price: 10990,
    stock: 32,
    category: 'Accessories',
    rating: 4.7,
    reviews: 181,
    badge: 'PREMIUM',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 30,
    name: 'Samsung 990 Pro 2TB SSD',
    price: 16999,
    stock: 39,
    category: 'Accessories',
    rating: 4.9,
    reviews: 327,
    badge: 'BEST VALUE',
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=900&q=85'
  }
];

let products;
let orders;
let requestLogs;
let history;
let requestCountWindow = [];
let totalRequests;
let successfulOrders;
let failedOrders;
let totalRevenue;
let peakConnections;
let peakWaiting;
let demoActive = 0;
let startedAt;
let orderSequence;

class ConnectionPool {
  constructor(size) {
    this.max = size;
    this.active = 0;
    this.waiting = 0;
    this.queue = [];
    this.nextId = 1;
  }

  acquire() {
    if (this.active < this.max) {
      this.active += 1;
      peakConnections = Math.max(peakConnections, this.active);
      return Promise.resolve({ id: this.nextId++ });
    }

    this.waiting += 1;
    peakWaiting = Math.max(peakWaiting, this.waiting);

    return new Promise((resolve) => {
      this.queue.push(resolve);
    });
  }

  release(connection) {
    const next = this.queue.shift();
    if (next) {
      this.waiting = Math.max(0, this.waiting - 1);
      next(connection);
      return;
    }
    this.active = Math.max(0, this.active - 1);
  }

  snapshot() {
    return {
      max: this.max,
      active: this.active,
      idle: Math.max(0, this.max - this.active - this.waiting),
      waiting: this.waiting,
      utilization: Math.round((this.active / this.max) * 100),
    };
  }
}

class Mutex {
  constructor() {
    this.locked = false;
    this.queue = [];
  }

  acquire() {
    if (!this.locked) {
      this.locked = true;
      return Promise.resolve(() => this.release());
    }
    return new Promise((resolve) => {
      this.queue.push(resolve);
    });
  }

  release() {
    const next = this.queue.shift();
    if (next) {
      next(() => this.release());
    } else {
      this.locked = false;
    }
  }
}

const pool = new ConnectionPool(MAX_CONNECTIONS);

function resizePool(size) {
  const nextSize = Number(size);
  if (!ALLOWED_POOL_SIZES.includes(nextSize)) {
    throw new Error(`Pool size must be one of: ${ALLOWED_POOL_SIZES.join(', ')}`);
  }
  pool.max = nextSize;
  return pool.snapshot();
}
const productLocks = new Map();

function resetState() {
  products = initialProducts.map((p) => ({ ...p }));
  orders = [];
  requestLogs = [];
  history = [];
  requestCountWindow = [];
  totalRequests = 12847;
  successfulOrders = 142;
  failedOrders = 7;
  totalRevenue = 4827360;
  peakConnections = 20;
  peakWaiting = 184;
  demoActive = 5;
  const now = Date.now();
  requestCountWindow = Array.from({ length: 28 }, (_, i) => now - (i * 31));
  history = Array.from({ length: 24 }, (_, i) => ({
    time: new Date(now - (23 - i) * 1000).toISOString(),
    active: 5 + Math.round(Math.sin(i / 2) * 3),
    waiting: 8 + Math.round(Math.abs(Math.cos(i / 3)) * 12),
    idle: 12 - Math.round(Math.sin(i / 2) * 3),
    requestsPerSecond: 18 + (i % 8),
  }));
  startedAt = Date.now();
  orderSequence = 1000;
  const mockCustomers = ['Aarav Sharma', 'Meera Iyer', 'Kabir Nair', 'Ananya Rao', 'Rohan Mehta', 'Ishita Kapoor', 'Vihaan Singh', 'Diya Menon', 'Arjun Patel', 'Sara Khan', 'Aditya Das', 'Nisha Verma'];
  orders = mockCustomers.map((customer, index) => {
    const product = initialProducts[index % initialProducts.length];
    const quantity = (index % 3) + 1;
    return {
      id: `FP-${1001 + index}`,
      createdAt: new Date(Date.now() - index * 18 * 60000).toISOString(),
      customer,
      items: [{ id: product.id, name: product.name, price: product.price, quantity }],
      total: product.price * quantity,
      status: ['DELIVERED', 'SHIPPED', 'PACKED', 'CONFIRMED'][index % 4],
      source: 'demo-seed',
    };
  });
  requestLogs = orders.slice(0, 8).map((order, index) => ({
    id: `seed-${index}`,
    time: order.createdAt,
    type: index === 5 ? 'WARNING' : 'SUCCESS',
    message: index === 5 ? 'Checkout rejected: inventory revalidated' : `Order ${order.id} confirmed`,
    orderId: order.id,
    latency: 58 + index * 7,
    details: `${order.items[0].name} · ${order.items[0].quantity} item(s)`,
  }));
  pool.max = MAX_CONNECTIONS;
  pool.active = 0;
  pool.waiting = 0;
  pool.queue = [];
  productLocks.clear();
}

resetState();

function getProduct(id) {
  return products.find((p) => p.id === Number(id));
}

function getLock(id) {
  const key = Number(id);
  if (!productLocks.has(key)) productLocks.set(key, new Mutex());
  return productLocks.get(key);
}

function addLog(type, message, extra = {}) {
  requestLogs.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    time: new Date().toISOString(),
    type,
    message,
    ...extra,
  });
  if (requestLogs.length > 250) requestLogs.length = 250;
}

function recordRequest() {
  const now = Date.now();
  totalRequests += 1;
  requestCountWindow.push(now);
  requestCountWindow = requestCountWindow.filter((t) => now - t < REQUEST_WINDOW_MS);
}

function requestsPerSecond() {
  const now = Date.now();
  requestCountWindow = requestCountWindow.filter((t) => now - t < REQUEST_WINDOW_MS);
  return requestCountWindow.length;
}

function uptimeSeconds() {
  return Math.floor((Date.now() - startedAt) / 1000);
}

function snapshot() {
  const rawPool = pool.snapshot();
  const visibleActive = Math.min(rawPool.max, Math.max(rawPool.active, demoActive));
  return {
    pool: { ...rawPool, active: visibleActive, idle: Math.max(0, rawPool.max - visibleActive - rawPool.waiting), utilization: Math.round((visibleActive / rawPool.max) * 100) },
    totalRequests,
    successfulOrders,
    failedOrders,
    requestsPerSecond: Math.max(18, requestsPerSecond()),
    latency: 84 + Math.round(Math.abs(Math.sin(Date.now() / 3000)) * 32),
    activeUsers: Math.max(86, Math.round(Math.max(18, requestsPerSecond()) * 3.7)),
    totalRevenue,
    peakConnections,
    peakWaiting,
    history: history.slice(-40),
    server: {
      status: 'ONLINE',
      uptime: uptimeSeconds(),
      port: PORT,
      database: 'In-memory',
      nodeVersion: process.version,
    },
  };
}

setInterval(() => {
  // Lightweight demo telemetry keeps the commercial dashboard alive even when nobody is clicking.
  const burst = 12 + Math.floor(Math.random() * 14);
  totalRequests += burst;
  const now = Date.now();
  for (let i = 0; i < burst; i += 1) requestCountWindow.push(now - Math.floor(Math.random() * 700));
  requestCountWindow = requestCountWindow.filter((t) => now - t < REQUEST_WINDOW_MS);
  demoActive = 3 + Math.floor(Math.random() * 8);
  setTimeout(() => { demoActive = 2 + Math.floor(Math.random() * 5); }, 500);

  const p = pool.snapshot();
  history.push({
    time: new Date().toISOString(),
    active: p.active,
    waiting: p.waiting,
    idle: p.idle,
    requestsPerSecond: requestsPerSecond(),
  });
  if (history.length > 40) history.shift();
}, 1000).unref();

async function withConnection(fn) {
  const connection = await pool.acquire();
  const started = Date.now();
  try {
    return await fn(connection);
  } finally {
    pool.release(connection);
    const latency = Date.now() - started;
    snapshot().latency = latency;
  }
}

async function processOrder({ items, source = 'checkout' }) {
  return withConnection(async () => {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Cart is empty.');
    }

    const normalized = items.map((item) => ({
      id: Number(item.id),
      quantity: Number(item.quantity),
    }));

    if (normalized.some((item) => !Number.isInteger(item.id) || !Number.isInteger(item.quantity) || item.quantity < 1)) {
      throw new Error('Invalid cart item.');
    }

    const uniqueIds = [...new Set(normalized.map((item) => item.id))].sort((a, b) => a - b);
    const releases = [];

    try {
      for (const id of uniqueIds) releases.push(await getLock(id).acquire());

      const checked = normalized.map((item) => {
        const product = getProduct(item.id);
        if (!product) throw new Error(`Product ${item.id} was not found.`);
        if (item.quantity > product.stock) {
          throw new Error(`${product.name}: only ${product.stock} left in stock.`);
        }
        return { product, quantity: item.quantity };
      });

      const total = checked.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

      // Inventory is changed only after every item has passed validation.
      for (const item of checked) item.product.stock -= item.quantity;

      const order = {
        id: `FP-${++orderSequence}`,
        createdAt: new Date().toISOString(),
        items: checked.map(({ product, quantity }) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity,
        })),
        total,
        status: 'CONFIRMED',
        source,
      };

      orders.unshift(order);
      successfulOrders += 1;
      totalRevenue += total;
      addLog('SUCCESS', `Order ${order.id} confirmed`, { orderId: order.id, total });
      return order;
    } finally {
      for (let i = releases.length - 1; i >= 0; i -= 1) releases[i]();
    }
  });
}

app.use((req, res, next) => {
  recordRequest();
  const started = Date.now();
  res.on('finish', () => {
    const latency = Date.now() - started;
    if (req.path !== '/api/pool' && req.path !== '/api/admin') {
      addLog(res.statusCode >= 400 ? 'WARNING' : 'INFO', `${req.method} ${req.path} → ${res.statusCode}`, { latency });
    }
  });
  next();
});

app.get('/', (req, res) => {
  res.json({
    service: 'FlashPool API',
    status: 'online',
    database: 'in-memory',
    pool: MAX_CONNECTIONS,
    endpoints: ['/api/products', '/api/pool', '/api/admin', '/api/checkout', '/api/simulate', '/api/stress-test', '/api/reset', '/api/health'],
  });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'healthy', ...snapshot() });
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = getProduct(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
  res.json(product);
});

app.get('/api/pool', (req, res) => {
  res.json(snapshot());
});

app.get('/api/admin', (req, res) => {
  const inventory = products.map((product) => {
    const initial = initialProducts.find((p) => p.id === product.id)?.stock || product.stock;
    const sold = Math.max(0, initial - product.stock);
    const percentage = Math.round((product.stock / initial) * 100);
    return {
      ...product,
      initialStock: initial,
      sold,
      stockPercentage: percentage,
      status: product.stock === 0 ? 'OUT_OF_STOCK' : product.stock <= Math.max(2, Math.ceil(initial * 0.2)) ? 'LOW_STOCK' : 'HEALTHY',
    };
  });

  res.json({
    server: snapshot().server,
    pool: { ...pool.snapshot(), peakConnections, peakWaiting },
    traffic: {
      totalRequests,
      requestsPerSecond: requestsPerSecond(),
      latency: requestLogs.length ? Math.round(requestLogs.slice(0, 30).reduce((s, x) => s + Number(x.latency || 0), 0) / Math.max(1, requestLogs.slice(0, 30).length)) : 0,
      activeUsers: Math.max(0, Math.round(requestsPerSecond() * 3.7)),
    },
    commerce: {
      successfulOrders,
      failedOrders,
      totalOrders: Math.max(orders.length, successfulOrders + failedOrders),
      totalRevenue,
    },
    inventory,
    orders: orders.slice(0, 100),
    logs: requestLogs.slice(0, 100),
    history: history.slice(-40),
  });
});

app.post('/api/checkout', async (req, res) => {
  try {
    const order = await processOrder({ items: req.body?.items, source: 'checkout' });
    res.status(201).json({ success: true, order });
  } catch (error) {
    failedOrders += 1;
    addLog('WARNING', `Checkout rejected: ${error.message}`);
    res.status(409).json({ success: false, message: error.message });
  }
});

app.post('/api/pool/configure', (req, res) => {
  try {
    const configured = resizePool(req.body?.size);
    addLog('SYSTEM', `Connection pool resized to ${configured.max}`, { poolSize: configured.max });
    res.json({ success: true, pool: configured, allowedSizes: ALLOWED_POOL_SIZES });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message, allowedSizes: ALLOWED_POOL_SIZES });
  }
});

app.post('/api/simulate', async (req, res) => {
  const users = Math.min(5000, Math.max(1, Number(req.body?.users) || 100));
  const started = Date.now();
  const jobs = Array.from({ length: users }, (_, index) => withConnection(async () => {
    await new Promise((resolve) => setTimeout(resolve, 2 + (index % 8)));
    return true;
  }));
  await Promise.all(jobs);
  const duration = Date.now() - started;
  addLog('STRESS', `Simulation completed for ${users} concurrent users`, { users, duration });
  res.json({ success: true, users, duration, pool: pool.snapshot(), requestsPerSecond: requestsPerSecond(), peakConnections, peakWaiting });
});

app.post('/api/stress-test', async (req, res) => {
  const users = Math.min(1000, Math.max(1, Number(req.body?.users) || 100));
  const productId = Number(req.body?.productId) || 1;
  const product = getProduct(productId);
  if (!product) return res.status(404).json({ success: false, message: 'Stress-test product not found.' });

  const startingStock = product.stock;
  const started = Date.now();
  let successful = 0;
  let failed = 0;

  const jobs = Array.from({ length: users }, async () => {
    try {
      await processOrder({ items: [{ id: productId, quantity: 1 }], source: 'stress-test' });
      successful += 1;
    } catch {
      failed += 1;
    }
  });

  await Promise.all(jobs);

  const endingStock = product.stock;
  const expectedSuccessful = Math.min(users, startingStock);
  const oversellingPrevented = endingStock >= 0 && successful === expectedSuccessful && startingStock - endingStock === successful;
  addLog('STRESS', `Stress test: ${users} buyers competed for ${product.name}`, { users, productId, successful, failed, oversellingPrevented });

  res.json({
    success: true,
    users,
    productId,
    product: product.name,
    startingStock,
    endingStock,
    successful,
    failed,
    expectedSuccessful,
    oversellingPrevented,
    duration: Date.now() - started,
    pool: pool.snapshot(),
  });
});

app.post('/api/reset', (req, res) => {
  resetState();
  addLog('INFO', 'System reset to initial state');
  res.json({ success: true, message: 'System reset', products });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log('');
  console.log('==============================================');
  console.log(' FlashPool — E-commerce Concurrency Server');
  console.log('==============================================');
  console.log(` API:        http://localhost:${PORT}`);
  console.log(` Database:   In-memory`);
  console.log(` Pool size:  ${MAX_CONNECTIONS}`);
  console.log(` Locking:    Product-level mutex`);
  console.log(` Queueing:   Bounded connection pool`);
  console.log(` Stress:     /api/stress-test`);
  console.log('==============================================');
});
