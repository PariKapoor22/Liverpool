import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

const fallbackProducts = [
  {
    id: 1,
    name: "MacBook Air M4",
    price: 89990,
    stock: 18,
    category: "Laptops",
    image:
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 2,
    name: "Galaxy S25 Ultra",
    price: 99999,
    stock: 31,
    category: "Smartphones",
    image:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 3,
    name: "Sony WH-1000XM6",
    price: 29990,
    stock: 46,
    category: "Audio",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 4,
    name: "Apple Watch Series 11",
    price: 41990,
    stock: 24,
    category: "Wearables",
    image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=85",
  },
];

const categories = [
  "All",
  "Laptops",
  "Smartphones",
  "Audio",
  "Wearables",
];

const simulationOptions = [100, 500, 1000, 5000];
const stressOptions = [100, 250, 500];

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatTime(value) {
  if (!value) return "--";

  try {
    return new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return value;
  }
}

function readLocalArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function App() {
  const [products, setProducts] = useState(fallbackProducts);

  const [systemStats, setSystemStats] = useState({
    pool: {
      active: 0,
      idle: 20,
      waiting: 0,
      max: 20,
      utilization: 0,
    },
    totalRequests: 0,
    successfulOrders: 0,
    failedOrders: 0,
    requestsPerSecond: 347,
    latency: 124,
    activeUsers: 1284,
    totalRevenue: 0,
    peakConnections: 0,
    peakWaiting: 0,
    history: [],
    server: {
      status: "ONLINE",
      uptime: 0,
      port: 5000,
      database: "In-memory",
    },
  });

  const [adminData, setAdminData] = useState(null);

  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const [cart, setCart] = useState(() => readLocalArray("flashpool_cart"));
  const [wishlist, setWishlist] = useState(() => readLocalArray("flashpool_wishlist"));

  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [toast, setToast] = useState("");

  const [simulationRunning, setSimulationRunning] = useState(false);
  const [stressRunning, setStressRunning] = useState(false);
  const [stressResult, setStressResult] = useState(null);
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoUsers, setDemoUsers] = useState(1000);
  const [demoPhase, setDemoPhase] = useState("IDLE");
  const [demoResult, setDemoResult] = useState(null);
  const [presentationMode, setPresentationMode] = useState(false);
  const [poolLabRunning, setPoolLabRunning] = useState(false);
  const [poolLabSize, setPoolLabSize] = useState(20);
  const [poolLabUsers, setPoolLabUsers] = useState(500);
  const [poolLabResults, setPoolLabResults] = useState([]);
  const [testSuiteRunning, setTestSuiteRunning] = useState(false);
  const [testResults, setTestResults] = useState([]);

  const [signedIn, setSignedIn] = useState(() => localStorage.getItem("flashpool_signed_in") === "true");
  const [signInOpen, setSignInOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [authPassword, setAuthPassword] = useState("");
  const [authRemember, setAuthRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [userProfile, setUserProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("flashpool_user")) || {
        name: "FlashPool Customer",
        email: "customer@example.com",
      };
    } catch {
      return { name: "FlashPool Customer", email: "customer@example.com" };
    }
  });

  const [orderPlaced, setOrderPlaced] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentSimulation, setPaymentSimulation] = useState("NORMAL");
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [orderStatuses, setOrderStatuses] = useState(() => {
    try { return JSON.parse(localStorage.getItem("flashpool_order_statuses")) || {}; } catch { return {}; }
  });

  const [activeView, setActiveView] = useState("shop");

  const [requestFilter, setRequestFilter] =
    useState("ALL");

  const [requestPulse, setRequestPulse] =
    useState(false);

  const [countdown, setCountdown] = useState({
    hours: 2,
    minutes: 34,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((previous) => {
        let { hours, minutes, seconds } =
          previous;

        seconds--;

        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }

        if (minutes < 0) {
          minutes = 59;
          hours--;
        }

        if (hours < 0) {
          hours = 2;
          minutes = 34;
          seconds = 19;
        }

        return {
          hours,
          minutes,
          seconds,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadProducts();
    loadPool();
    loadAdmin();

    const interval = setInterval(() => {
      loadPool();

      if (activeView === "admin") {
        loadAdmin();

        setRequestPulse(true);

        setTimeout(
          () => setRequestPulse(false),
          350
        );
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeView]);

  useEffect(() => {
    if (!demoRunning) return;

    const liveInterval = setInterval(() => {
      loadPool();
      loadProducts();
    }, 250);

    return () => clearInterval(liveInterval);
  }, [demoRunning]);

  useEffect(() => {
    if (!toast) return;

    const timeout = setTimeout(() => {
      setToast("");
    }, 2800);

    return () => clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    localStorage.setItem("flashpool_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("flashpool_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  async function loadProducts() {
    try {
      const response = await fetch(
        `${API_URL}/api/products`
      );

      if (!response.ok) throw new Error();

      const data = await response.json();
      setProducts(data);
    } catch {
      setProducts(fallbackProducts);
    }
  }

  async function loadPool() {
    try {
      const response = await fetch(
        `${API_URL}/api/pool`
      );

      if (!response.ok) throw new Error();

      const data = await response.json();
      setSystemStats(data);
    } catch {
      // Backend may be temporarily unavailable.
    }
  }

  async function loadAdmin() {
    try {
      const response = await fetch(
        `${API_URL}/api/admin`
      );

      if (!response.ok) throw new Error();

      const data = await response.json();
      setAdminData(data);
    } catch {
      // Keep previous dashboard state.
    }
  }

  function showToast(message) {
    setToast(message);
  }

  function addToCart(product) {
    setCart((previous) => {
      const existing = previous.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return previous.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + 1,
                  product.stock
                ),
              }
            : item
        );
      }

      return [
        ...previous,
        {
          ...product,
          quantity: 1,
        },
      ];
    });

    showToast(
      `${product.name} added to cart`
    );
  }

  function increaseQuantity(id) {
    setCart((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.min(
                item.quantity + 1,
                products.find(
                  (p) => p.id === id
                )?.stock ||
                  item.quantity + 1
              ),
            }
          : item
      )
    );
  }

  function decreaseQuantity(id) {
    setCart((previous) =>
      previous
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) => item.quantity > 0
        )
    );
  }

  function removeFromCart(id) {
    setCart((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
    );
  }

  function toggleWishlist(id) {
    setWishlist((previous) =>
      previous.includes(id)
        ? previous.filter(
            (item) => item !== id
          )
        : [...previous, id]
    );
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch =
        activeCategory === "All" ||
        product.category ===
          activeCategory;

      const searchMatch = product.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        );

      return (
        categoryMatch && searchMatch
      );
    });
  }, [
    products,
    activeCategory,
    search,
  ]);

  const cartCount = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      item.price * item.quantity,
    0
  );

  const poolUtilization = Math.min(
    100,
    Math.round(
      ((systemStats.pool?.active ||
        0) /
        (systemStats.pool?.max ||
          20)) *
        100
    )
  );

  async function checkout() {
    if (cart.length === 0 || paymentProcessing) return;

    if (!signedIn) {
      setCartOpen(false);
      setSignInOpen(true);
      showToast("Sign in before checkout so we can save your order.");
      return;
    }

    const invalidItem = cart.find((item) => {
      const live = products.find((product) => product.id === item.id);
      return !live || item.quantity < 1 || item.quantity > live.stock;
    });

    if (invalidItem) {
      showToast(`${invalidItem.name} is no longer available in that quantity.`);
      await loadProducts();
      return;
    }

    setPaymentProcessing(true);
    setPaymentResult(null);
    await new Promise((resolve) => setTimeout(resolve, 1600));

    if (paymentSimulation === "FAIL") {
      setPaymentResult({
        success: false,
        message: "Demo payment was declined intentionally. No inventory was changed.",
      });
      setPaymentProcessing(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({ id: item.id, quantity: item.quantity })),
          total: cartTotal,
        }),
      });

      let data = {};
      try { data = await response.json(); } catch { data = {}; }
      if (!response.ok || !data.success) {
        throw new Error(data.message || `Checkout failed (${response.status})`);
      }

      const stamp = Date.now().toString().slice(-8);
      const order = {
        ...data.order,
        trackingId: `TRK-${stamp}`,
        invoiceNumber: `INV-${stamp}`,
        paymentStatus: "PAID",
        paymentMethod,
        status: "CONFIRMED",
      };

      const savedOrders = readLocalArray("flashpool_orders");
      const mergedOrders = [order, ...savedOrders.filter((item) => item.id !== order.id)].slice(0, 25);
      localStorage.setItem("flashpool_orders", JSON.stringify(mergedOrders));

      const nextStatuses = { ...orderStatuses, [order.id]: "CONFIRMED" };
      setOrderStatuses(nextStatuses);
      localStorage.setItem("flashpool_order_statuses", JSON.stringify(nextStatuses));
      setPaymentResult({ success: true, order });
      setOrderPlaced(order);
      setCart([]);
      setCartOpen(false);
      showToast("Payment successful — order confirmed");

      await Promise.all([loadProducts(), loadPool(), loadAdmin()]);
    } catch (error) {
      setPaymentResult({
        success: false,
        message: error.message || "Unable to complete checkout.",
      });
    } finally {
      setPaymentProcessing(false);
    }
  }

  function advanceOrder(order) {
    const stages = ["CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"];
    const current = orderStatuses[order.id] || order.status || "CONFIRMED";
    const next = stages[Math.min(stages.indexOf(current) + 1, stages.length - 1)];
    const updated = { ...order, status: next };
    const nextStatuses = { ...orderStatuses, [order.id]: next };
    setOrderStatuses(nextStatuses);
    localStorage.setItem("flashpool_order_statuses", JSON.stringify(nextStatuses));
    const saved = readLocalArray("flashpool_orders");
    localStorage.setItem("flashpool_orders", JSON.stringify(saved.map((item) => item.id === order.id ? { ...item, status: next } : item)));
    setTrackingOrder(updated);
    if (orderPlaced?.id === order.id) setOrderPlaced(updated);
    showToast(`Order ${order.id} moved to ${next}`);
  }

  function signIn(name, email, password, remember = true) {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      showToast("Please enter your full name.");
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      showToast("Please enter a valid email address.");
      return false;
    }

    if (!password || password.length < 6) {
      showToast("Password must contain at least 6 characters.");
      return false;
    }

    const profile = {
      name: cleanName,
      email: cleanEmail,
    };

    setUserProfile(profile);
    setSignedIn(true);
    setSignInOpen(false);
    setAccountOpen(false);

    localStorage.setItem("flashpool_signed_in", "true");
    localStorage.setItem("flashpool_user", JSON.stringify(profile));

    if (remember) {
      localStorage.setItem("flashpool_remember", "true");
    } else {
      localStorage.removeItem("flashpool_remember");
    }

    showToast("Welcome to FlashPool, " + cleanName.split(" ")[0] + "!");
    return true;
  }

  function signOut() {
    setSignedIn(false);
    setAccountOpen(false);
    localStorage.removeItem("flashpool_signed_in");
    localStorage.removeItem("flashpool_user");
    showToast("Signed out successfully");
  }

  async function runSimulation(users) {
    setSimulationRunning(true);

    try {
      const response =
        await fetch(
          `${API_URL}/api/simulate`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              users,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          "Simulation failed"
        );
      }

      showToast(
        `${users.toLocaleString()} concurrent users processed`
      );

      await loadPool();
      await loadAdmin();
    } catch (error) {
      showToast(error.message);
    } finally {
      setSimulationRunning(false);
    }
  }

  async function runStressTest(users) {
    setStressRunning(true);
    setStressResult(null);

    try {
      const response =
        await fetch(
          `${API_URL}/api/stress-test`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              users,
              productId: 1,
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Stress test failed"
        );
      }

      setStressResult(data);

      await loadProducts();
      await loadPool();
      await loadAdmin();
    } catch (error) {
      showToast(error.message);
    } finally {
      setStressRunning(false);
    }
  }

  async function runDemo(users = demoUsers) {
    if (demoRunning) return;

    setDemoUsers(users);
    setDemoRunning(true);
    setDemoResult(null);
    setDemoPhase("PREPARING SYSTEM");

    try {
      const resetResponse = await fetch(`${API_URL}/api/reset`, { method: "POST" });
      if (!resetResponse.ok) throw new Error("Could not reset the demo system");
      await loadProducts();
      await loadPool();
      await loadAdmin();

      setDemoPhase("GENERATING TRAFFIC");
      await new Promise((resolve) => setTimeout(resolve, 450));
      setDemoPhase("POOL SATURATED");
      await new Promise((resolve) => setTimeout(resolve, 450));
      setDemoPhase("WAITING QUEUE");

      const response = await fetch(`${API_URL}/api/stress-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users, productId: 1 }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Demo failed");
      }

      setDemoPhase("CRITICAL SECTION");
      await new Promise((resolve) => setTimeout(resolve, 350));
      setDemoPhase("INVENTORY RESERVED");
      await new Promise((resolve) => setTimeout(resolve, 350));
      setDemoResult(data);
      setDemoPhase("RESULT");
      await loadProducts();
      await loadPool();
      await loadAdmin();
      setStressResult(data);
    } catch (error) {
      setDemoPhase("ERROR");
      showToast(error.message);
    } finally {
      setDemoRunning(false);
    }
  }

  async function configurePool(size) {
    const response = await fetch(`${API_URL}/api/pool/configure`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ size }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Could not configure pool");
    setPoolLabSize(size);
    await loadPool();
    await loadAdmin();
    return data;
  }

  async function runPoolBenchmark() {
    if (poolLabRunning) return;
    setPoolLabRunning(true);
    setPoolLabResults([]);
    const sizes = [5, 10, 20, 30, 50];
    const results = [];
    try {
      for (const size of sizes) {
        await fetch(`${API_URL}/api/reset`, { method: "POST" });
        await configurePool(size);
        const response = await fetch(`${API_URL}/api/simulate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ users: poolLabUsers }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Benchmark failed");
        const row = {
          size,
          duration: Number(data.duration || 0),
          rps: Number(data.requestsPerSecond || 0),
          peakWaiting: Number(data.peakWaiting || 0),
          peakConnections: Number(data.peakConnections || 0),
        };
        results.push(row);
        setPoolLabResults([...results]);
      }
      await fetch(`${API_URL}/api/reset`, { method: "POST" });
      await loadProducts();
      await loadPool();
      await loadAdmin();
      showToast("Pool benchmark completed");
    } catch (error) {
      showToast(error.message || "Pool benchmark failed");
    } finally {
      setPoolLabRunning(false);
    }
  }

  function exportPoolBenchmark() {
    if (!poolLabResults.length) return;
    const rows = [
      ["FlashPool OS - Connection Pool Benchmark"],
      ["Concurrent users", poolLabUsers],
      [],
      ["Pool Size", "Duration (ms)", "Throughput (RPS)", "Peak Waiting", "Peak Connections"],
      ...poolLabResults.map((r) => [r.size, r.duration, r.rps, r.peakWaiting, r.peakConnections]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "flashpool-pool-benchmark.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function runHealthCheck() {
    const started = performance.now();
    try {
      const response = await fetch(`${API_URL}/api/health`, { cache: "no-store" });
      const data = await response.json();
      const duration = Math.round(performance.now() - started);
      const result = {
        id: `health-${Date.now()}`,
        name: "API Health Check",
        type: "HEALTH",
        passed: response.ok && data.status === "healthy",
        duration,
        detail: response.ok ? `${data.status || "online"} • pool ${data.pool?.max || data.pool?.maxConnections || "--"}` : "API returned an error",
      };
      setTestResults((prev) => [result, ...prev].slice(0, 12));
      return result;
    } catch (error) {
      const result = { id: `health-${Date.now()}`, name: "API Health Check", type: "HEALTH", passed: false, duration: Math.round(performance.now() - started), detail: error.message || "Backend unreachable" };
      setTestResults((prev) => [result, ...prev].slice(0, 12));
      return result;
    }
  }

  async function runLoadTest(users = 1000) {
    const started = performance.now();
    try {
      const response = await fetch(`${API_URL}/api/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users }),
      });
      const data = await response.json();
      const passed = response.ok && data.success;
      const result = {
        id: `load-${Date.now()}`,
        name: `${users.toLocaleString()}-User Load Test`,
        type: "LOAD",
        passed,
        duration: Number(data.duration || Math.round(performance.now() - started)),
        detail: passed ? `${Number(data.requestsPerSecond || 0).toLocaleString()} RPS • peak queue ${data.peakWaiting || 0}` : (data.message || "Load test failed"),
      };
      setTestResults((prev) => [result, ...prev].slice(0, 12));
      await loadPool();
      await loadAdmin();
      return result;
    } catch (error) {
      const result = { id: `load-${Date.now()}`, name: `${users.toLocaleString()}-User Load Test`, type: "LOAD", passed: false, duration: Math.round(performance.now() - started), detail: error.message || "Load test failed" };
      setTestResults((prev) => [result, ...prev].slice(0, 12));
      return result;
    }
  }

  async function runRaceTest(users = 500) {
    const started = performance.now();
    try {
      const response = await fetch(`${API_URL}/api/stress-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users, productId: 1 }),
      });
      const data = await response.json();
      const passed = response.ok && data.success && data.oversellingPrevented === true;
      const result = {
        id: `race-${Date.now()}`,
        name: `${users}-Buyer Race Test`,
        type: "RACE",
        passed,
        duration: Number(data.duration || Math.round(performance.now() - started)),
        detail: passed ? `${data.successful}/${data.expectedSuccessful} valid orders • stock never negative` : (data.message || "Race protection failed"),
      };
      setTestResults((prev) => [result, ...prev].slice(0, 12));
      await loadProducts();
      await loadPool();
      await loadAdmin();
      return result;
    } catch (error) {
      const result = { id: `race-${Date.now()}`, name: `${users}-Buyer Race Test`, type: "RACE", passed: false, duration: Math.round(performance.now() - started), detail: error.message || "Race test failed" };
      setTestResults((prev) => [result, ...prev].slice(0, 12));
      return result;
    }
  }

  async function runQueueTest() {
    const started = performance.now();
    try {
      await fetch(`${API_URL}/api/reset`, { method: "POST" });
      await configurePool(5);
      const response = await fetch(`${API_URL}/api/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users: 1000 }),
      });
      const data = await response.json();
      const peakWaiting = Number(data.peakWaiting || 0);
      const passed = response.ok && data.success && peakWaiting > 0;
      const result = {
        id: `queue-${Date.now()}`,
        name: "Queue Saturation Test",
        type: "QUEUE",
        passed,
        duration: Number(data.duration || Math.round(performance.now() - started)),
        detail: passed ? `5 connections handled 1,000 requests • peak queue ${peakWaiting}` : "Queue pressure was not observed",
      };
      setTestResults((prev) => [result, ...prev].slice(0, 12));
      await fetch(`${API_URL}/api/reset`, { method: "POST" });
      await loadProducts();
      await loadPool();
      await loadAdmin();
      return result;
    } catch (error) {
      try { await fetch(`${API_URL}/api/reset`, { method: "POST" }); } catch {}
      const result = { id: `queue-${Date.now()}`, name: "Queue Saturation Test", type: "QUEUE", passed: false, duration: Math.round(performance.now() - started), detail: error.message || "Queue test failed" };
      setTestResults((prev) => [result, ...prev].slice(0, 12));
      return result;
    }
  }

  async function runTestSuite() {
    if (testSuiteRunning) return;
    setTestSuiteRunning(true);
    setTestResults([]);
    try {
      await runHealthCheck();
      await runLoadTest(1000);
      await fetch(`${API_URL}/api/reset`, { method: "POST" });
      await runRaceTest(500);
      await runQueueTest();
      showToast("Testing suite completed");
    } finally {
      setTestSuiteRunning(false);
      await loadPool();
      await loadAdmin();
    }
  }

  function clearTestResults() {
    setTestResults([]);
  }

  async function resetDemo() {
    setDemoRunning(false);
    setDemoPhase("IDLE");
    setDemoResult(null);
    setPresentationMode(false);
    try {
      const response = await fetch(`${API_URL}/api/reset`, { method: "POST" });
      if (!response.ok) throw new Error("Reset failed");
      await loadProducts();
      await loadPool();
      await loadAdmin();
      showToast("Demo restored to initial stock");
    } catch (error) {
      showToast(error.message);
    }
  }

  function exportDemoReport() {
    if (!demoResult) return;
    const rows = [
      ["FlashPool OS Demo Report"],
      ["Generated", new Date().toLocaleString()],
      [],
      ["Metric", "Value"],
      ["Concurrent Users", demoResult.users],
      ["Product", demoResult.product],
      ["Starting Stock", demoResult.startingStock],
      ["Ending Stock", demoResult.endingStock],
      ["Successful Orders", demoResult.successful],
      ["Failed Requests", demoResult.failed],
      ["Expected Successful", demoResult.expectedSuccessful],
      ["Overselling Prevented", demoResult.oversellingPrevented ? "YES" : "NO"],
      ["Duration (ms)", demoResult.duration],
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `flashpool-demo-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function resetSystem() {
    try {
      const response =
        await fetch(
          `${API_URL}/api/reset`,
          {
            method: "POST",
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          "Reset failed"
        );
      }

      setStressResult(null);

      await loadProducts();
      await loadPool();
      await loadAdmin();

      showToast(
        "System restored to initial state"
      );
    } catch (error) {
      showToast(error.message);
    }
  }

  function scrollToSection(id) {
    setActiveView("shop");

    setTimeout(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  }

  const history =
    systemStats.history || [];

  const graphPoints = useMemo(() => {
    if (history.length < 2) {
      return "";
    }

    const width = 700;
    const height = 220;

    const maxValue = Math.max(
      systemStats.pool?.max || 20,
      ...history.map((point) =>
        Math.max(
          point.active || 0,
          point.waiting || 0
        )
      )
    );

    return history
      .map((point, index) => {
        const x =
          (index /
            (history.length - 1)) *
          width;

        const y =
          height -
          ((point.active || 0) /
            maxValue) *
            height;

        return `${x},${y}`;
      })
      .join(" ");
  }, [
    history,
    systemStats.pool,
  ]);

  return (
    <div className="app">
      <header className="navbar">
        <div
          className="brand"
          onClick={() =>
            scrollToSection("hero")
          }
        >
          <div className="brand-mark">
            FP
          </div>

          <div>
            <div className="brand-name">
              FlashPool
            </div>

            <div className="brand-subtitle">
              Concurrency Commerce
            </div>
          </div>
        </div>

        <nav className="nav-links">
          <button
            className={
              activeView === "shop"
                ? "nav-link active"
                : "nav-link"
            }
            onClick={() => {
              setActiveView("shop");
              scrollToSection(
                "shop"
              );
            }}
          >
            Shop
          </button>

          <button
            className="nav-link"
            onClick={() =>
              scrollToSection(
                "technology"
              )
            }
          >
            Technology
          </button>

          <button
            className="nav-link"
            onClick={() =>
              scrollToSection("lab")
            }
          >
            Concurrency Lab
          </button>

          <button
            className={
              activeView === "admin"
                ? "nav-link active"
                : "nav-link"
            }
            onClick={async () => {
              setActiveView("admin");
              window.scrollTo({ top: 0, behavior: "smooth" });
              try {
                await loadAdmin();
                await loadPool();
              } catch {
                // Dashboard keeps its current/fallback data if the backend is temporarily unavailable.
              }
            }}
          >
            Operations
          </button>
        </nav>

        <div className="nav-actions">
          <button
            className="icon-button"
            onClick={() =>
              setSearchOpen(
                !searchOpen
              )
            }
          >
            ⌕
          </button>

          <button
            className="wishlist-button"
            onClick={() =>
              showToast(
                `${wishlist.length} item${
                  wishlist.length === 1
                    ? ""
                    : "s"
                } in wishlist`
              )
            }
          >
            ♡

            {wishlist.length > 0 && (
              <span>
                {wishlist.length}
              </span>
            )}
          </button>

          <button
            className="cart-button"
            onClick={() =>
              setCartOpen(true)
            }
          >
            <span>Cart</span>

            <strong>
              {cartCount}
            </strong>
          </button>

          <button
            className="account-button"
            onClick={() => {
              if (signedIn) {
                setAccountOpen(true);
              } else {
                setSignInOpen(true);
              }
            }}
          >
            {signedIn
              ? "Account"
              : "Sign in"}
          </button>
        </div>
      </header>

      {searchOpen && (
        <div className="search-panel">
          <div className="search-inner">
            <span>⌕</span>

            <input
              autoFocus
              placeholder="Search products..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

            <button
              onClick={() => {
                setSearch("");
                setSearchOpen(false);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <main>
        {activeView === "admin" ? (
          <AdminDashboard
            adminData={adminData}
            orderStatuses={orderStatuses}
            systemStats={systemStats}
            poolUtilization={
              poolUtilization
            }
            graphPoints={graphPoints}
            products={products}
            requestFilter={
              requestFilter
            }
            setRequestFilter={
              setRequestFilter
            }
            requestPulse={
              requestPulse
            }
            onRunStress={
              runStressTest
            }
            testSuiteRunning={testSuiteRunning}
            testResults={testResults}
            onRunHealthCheck={runHealthCheck}
            onRunLoadTest={runLoadTest}
            onRunRaceTest={runRaceTest}
            onRunQueueTest={runQueueTest}
            onRunTestSuite={runTestSuite}
            onClearTestResults={clearTestResults}
            stressRunning={
              stressRunning
            }
            demoRunning={demoRunning}
            demoUsers={demoUsers}
            setDemoUsers={setDemoUsers}
            demoPhase={demoPhase}
            demoResult={demoResult}
            onRunDemo={runDemo}
            onResetDemo={resetDemo}
            onExportDemo={exportDemoReport}
            presentationMode={presentationMode}
            setPresentationMode={setPresentationMode}
            onBack={() =>
              setActiveView("shop")
            }
            onReset={resetSystem}
          />
        ) : (
          <>
            <section
              className="hero"
              id="hero"
            >
              <div className="hero-copy">
                <div className="eyebrow">
                  <span className="live-dot" />
                  LIVE FLASH SALE
                </div>

                <h1>
                  High traffic.
                  <br />
                  <span>
                    Zero overselling.
                  </span>
                </h1>

                <p>
                  A high-performance
                  commerce platform
                  demonstrating connection
                  pooling, concurrency
                  control and safe
                  inventory management.
                </p>

                <div className="hero-actions">
                  <button
                    className="primary-button"
                    onClick={() =>
                      scrollToSection(
                        "shop"
                      )
                    }
                  >
                    Shop the sale
                    <span>→</span>
                  </button>

                  <button
                    className="secondary-button"
                    onClick={() =>
                      scrollToSection(
                        "lab"
                      )
                    }
                  >
                    Open concurrency lab
                  </button>
                </div>

                <div className="hero-trust">
                  <div>
                    <strong>
                      20
                    </strong>

                    <span>
                      pool connections
                    </span>
                  </div>

                  <div>
                    <strong>
                      {
                        systemStats.requestsPerSecond
                      }
                    </strong>

                    <span>
                      requests/sec
                    </span>
                  </div>

                  <div>
                    <strong>
                      {
                        systemStats.latency
                      }
                      ms
                    </strong>

                    <span>
                      avg latency
                    </span>
                  </div>
                </div>
              </div>

              <div className="hero-visual">
                <div className="hero-glow" />

                <div className="floating-card hero-status-card">
                  <span className="status-dot" />

                  <div>
                    <strong>
                      Server online
                    </strong>

                    <small>
                      Pool capacity 20
                      connections
                    </small>
                  </div>
                </div>

                <div className="hero-product-card">
                  <div className="product-card-label">
                    FLASH DEAL
                  </div>

                  <img
                    src={
                      products[0]?.image
                    }
                    alt="MacBook Air M4"
                  />

                  <div className="hero-product-info">
                    <span>
                      MacBook Air M4
                    </span>

                    <strong>
                      {formatMoney(
                        products[0]
                          ?.price ||
                          89990
                      )}
                    </strong>
                  </div>
                </div>

                <div className="floating-card hero-connection-card">
                  <div className="mini-pool">
                    {Array.from({
                      length: 8,
                    }).map(
                      (_, index) => (
                        <i
                          key={index}
                          className={
                            index <
                            Math.min(
                              8,
                              systemStats
                                .pool
                                ?.active ||
                                0
                            )
                              ? "busy"
                              : ""
                          }
                        />
                      )
                    )}
                  </div>

                  <div>
                    <strong>
                      {
                        systemStats
                          .pool
                          ?.active || 0
                      }
                      /
                      {
                        systemStats
                          .pool?.max ||
                          20
                      }
                    </strong>

                    <small>
                      connections active
                    </small>
                  </div>
                </div>
              </div>
            </section>

            <section className="sale-bar">
              <div>
                <span className="sale-icon">
                  ⚡
                </span>

                <div>
                  <strong>
                    Flash sale ends soon
                  </strong>

                  <small>
                    Limited inventory •
                    Live concurrency demo
                  </small>
                </div>
              </div>

              <div className="countdown">
                <div>
                  <strong>
                    {String(
                      countdown.hours
                    ).padStart(2, "0")}
                  </strong>

                  <span>HRS</span>
                </div>

                <b>:</b>

                <div>
                  <strong>
                    {String(
                      countdown.minutes
                    ).padStart(2, "0")}
                  </strong>

                  <span>MIN</span>
                </div>

                <b>:</b>

                <div>
                  <strong>
                    {String(
                      countdown.seconds
                    ).padStart(2, "0")}
                  </strong>

                  <span>SEC</span>
                </div>
              </div>
            </section>

            <section
              className="shop-section section"
              id="shop"
            >
              <div className="section-heading">
                <div>
                  <span className="section-kicker">
                    CURATED FOR YOU
                  </span>

                  <h2>
                    Shop the flash sale
                  </h2>

                  <p>
                    Popular products with
                    inventory protected by
                    concurrency controls.
                  </p>
                </div>

                <div className="category-tabs">
                  {categories.map(
                    (category) => (
                      <button
                        key={category}
                        className={
                          activeCategory ===
                          category
                            ? "category-tab active"
                            : "category-tab"
                        }
                        onClick={() =>
                          setActiveCategory(
                            category
                          )
                        }
                      >
                        {category}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="product-grid">
                {filteredProducts.map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      liked={wishlist.includes(
                        product.id
                      )}
                      onLike={() =>
                        toggleWishlist(
                          product.id
                        )
                      }
                      onAdd={() =>
                        addToCart(product)
                      }
                      onOpen={() =>
                        setSelectedProduct(
                          product
                        )
                      }
                    />
                  )
                )}
              </div>
            </section>

            <section
              className="technology-section section"
              id="technology"
            >
              <div className="tech-intro">
                <div>
                  <span className="section-kicker">
                    UNDER THE HOOD
                  </span>

                  <h2>
                    Built for traffic spikes.
                  </h2>

                  <p>
                    Instead of opening a new
                    database connection for
                    every request, FlashPool
                    maintains a bounded pool
                    and queues excess
                    requests.
                  </p>
                </div>

                <div className="architecture-pill">
                  <span />
                  EXPRESS + CONNECTION
                  POOL
                </div>
              </div>

              <div className="tech-grid">
                <div className="architecture-card">
                  <div className="card-topline">
                    <span>
                      REQUEST FLOW
                    </span>

                    <span className="green-label">
                      LIVE
                    </span>
                  </div>

                  <div className="architecture-flow">
                    <ArchitectureNode
                      icon="U"
                      title="Users"
                      subtitle="Concurrent requests"
                    />

                    <div className="architecture-arrow">
                      →
                    </div>

                    <ArchitectureNode
                      icon="S"
                      title="Server"
                      subtitle="Express API"
                    />

                    <div className="architecture-arrow">
                      →
                    </div>

                    <ArchitectureNode
                      icon="P"
                      title="Pool"
                      subtitle="20 max"
                      highlighted
                    />

                    <div className="architecture-arrow">
                      →
                    </div>

                    <ArchitectureNode
                      icon="D"
                      title="Inventory"
                      subtitle="Protected"
                    />
                  </div>

                  <div className="pool-meter">
                    <div className="pool-meter-heading">
                      <span>
                        Connection utilization
                      </span>

                      <strong>
                        {poolUtilization}%
                      </strong>
                    </div>

                    <div className="meter-track">
                      <div
                        className="meter-fill"
                        style={{
                          width: `${poolUtilization}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="simulation-card">
                  <div className="card-topline">
                    <span>
                      TRAFFIC SIMULATOR
                    </span>

                    <span>
                      OS LAB
                    </span>
                  </div>

                  <h3>
                    Generate concurrent
                    traffic
                  </h3>

                  <p>
                    Send simultaneous
                    requests through the
                    bounded connection pool
                    and observe the queue.
                  </p>

                  <div className="simulation-buttons">
                    {simulationOptions.map(
                      (users) => (
                        <button
                          key={users}
                          disabled={
                            simulationRunning
                          }
                          onClick={() =>
                            runSimulation(
                              users
                            )
                          }
                        >
                          {users.toLocaleString()}
                        </button>
                      )
                    )}
                  </div>

                  {simulationRunning && (
                    <div className="simulation-running">
                      <span className="spinner" />
                      Processing
                      concurrent
                      requests...
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section
              className="lab-section section"
              id="lab"
            >
              <div className="lab-heading">
                <div>
                  <span className="section-kicker">
                    CONCURRENCY LAB
                  </span>

                  <h2>
                    Can 500 buyers safely
                    purchase 18 units?
                  </h2>

                  <p>
                    Test the inventory mutex
                    and prove that concurrent
                    requests cannot oversell
                    the same product.
                  </p>
                </div>

                <div className="lab-status">
                  <span />
                  Mutex protection active
                </div>
              </div>

              <div className="lab-grid">
                <div className="lab-control-card">
                  <div className="lab-product-mini">
                    <img
                      src={
                        products[0]?.image
                      }
                      alt=""
                    />

                    <div>
                      <strong>
                        MacBook Air M4
                      </strong>

                      <span>
                        {products[0]
                          ?.stock || 0}{" "}
                        units remaining
                      </span>
                    </div>
                  </div>

                  <div className="lab-divider" />

                  <span className="lab-label">
                    SIMULATE BUYERS
                  </span>

                  <div className="stress-buttons">
                    {stressOptions.map(
                      (users) => (
                        <button
                          key={users}
                          disabled={
                            stressRunning
                          }
                          className={
                            stressRunning
                              ? "stress-button disabled"
                              : "stress-button"
                          }
                          onClick={() =>
                            runStressTest(
                              users
                            )
                          }
                        >
                          {users} buyers
                        </button>
                      )
                    )}
                  </div>

                  <button
                    className="reset-button"
                    onClick={
                      resetSystem
                    }
                  >
                    ↻ Reset inventory
                  </button>
                </div>

                <div className="lab-flow-card">
                  <div className="flow-node">
                    <div className="flow-icon">
                      U
                    </div>

                    <strong>
                      Buyers
                    </strong>

                    <span>
                      500 requests
                    </span>
                  </div>

                  <div className="flow-line">
                    <i />
                  </div>

                  <div className="flow-node highlighted">
                    <div className="flow-icon">
                      P
                    </div>

                    <strong>
                      Pool
                    </strong>

                    <span>
                      20 connections
                    </span>
                  </div>

                  <div className="flow-line">
                    <i />
                  </div>

                  <div className="flow-node highlighted">
                    <div className="flow-icon">
                      M
                    </div>

                    <strong>
                      Mutex
                    </strong>

                    <span>
                      One critical section
                    </span>
                  </div>

                  <div className="flow-line">
                    <i />
                  </div>

                  <div className="flow-node">
                    <div className="flow-icon">
                      I
                    </div>

                    <strong>
                      Inventory
                    </strong>

                    <span>
                      Atomic stock update
                    </span>
                  </div>
                </div>
              </div>

              {stressResult && (
                <div className="stress-result">
                  <div className="result-header">
                    <div>
                      <span className="result-kicker">
                        TEST COMPLETE
                      </span>

                      <h3>
                        Overselling
                        protection
                        verified
                      </h3>
                    </div>

                    <div className="safe-badge">
                      ✓ SAFE
                    </div>
                  </div>

                  <div className="result-metrics">
                    <Metric
                      label="Concurrent buyers"
                      value={
                        stressResult.users
                      }
                    />

                    <Metric
                      label="Starting stock"
                      value={
                        stressResult.startingStock
                      }
                    />

                    <Metric
                      label="Successful"
                      value={
                        stressResult.successfulOrders
                      }
                    />

                    <Metric
                      label="Rejected"
                      value={
                        stressResult.failedOrders
                      }
                    />

                    <Metric
                      label="Ending stock"
                      value={
                        stressResult.endingStock
                      }
                    />

                    <Metric
                      label="Duration"
                      value={`${stressResult.duration}ms`}
                    />
                  </div>

                  <div className="oversell-banner">
                    <span>✓</span>

                    <div>
                      <strong>
                        Overselling prevented
                      </strong>

                      <p>
                        Only{" "}
                        {
                          stressResult.successfulOrders
                        }{" "}
                        buyers could
                        purchase available
                        inventory.
                        Expected maximum:{" "}
                        {
                          stressResult.expectedSuccessful
                        }
                        .
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="monitor-section section">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">
                    LIVE MONITOR
                  </span>

                  <h2>
                    System performance
                  </h2>

                  <p>
                    Real-time metrics from
                    the FlashPool server.
                  </p>
                </div>

                <div className="live-indicator">
                  <span />
                  Updating automatically
                </div>
              </div>

              <div className="metric-grid">
                <DashboardMetric
                  icon="↗"
                  label="Active connections"
                  value={
                    systemStats.pool
                      ?.active || 0
                  }
                  suffix={` / ${
                    systemStats.pool
                      ?.max || 20
                  }`}
                  progress={
                    poolUtilization
                  }
                />

                <DashboardMetric
                  icon="⇧"
                  label="Requests / sec"
                  value={
                    systemStats.requestsPerSecond
                  }
                  suffix=""
                  trend="+18.4%"
                />

                <DashboardMetric
                  icon="◷"
                  label="Average latency"
                  value={
                    systemStats.latency
                  }
                  suffix=" ms"
                  trend="-24.1%"
                />

                <DashboardMetric
                  icon="⌛"
                  label="Waiting queue"
                  value={
                    systemStats.pool
                      ?.waiting || 0
                  }
                  suffix=" requests"
                  warning={
                    (systemStats.pool
                      ?.waiting || 0) > 0
                  }
                />
              </div>

              <div className="monitor-grid">
                <div className="chart-card">
                  <div className="chart-heading">
                    <div>
                      <span>
                        CONNECTION ACTIVITY
                      </span>

                      <strong>
                        {
                          systemStats
                            .pool
                            ?.active || 0
                        }{" "}
                        active
                      </strong>
                    </div>

                    <div className="chart-legend">
                      <i />
                      Active
                    </div>
                  </div>

                  <div className="chart">
                    {history.length >
                    1 ? (
                      <svg
                        viewBox="0 0 700 220"
                        preserveAspectRatio="none"
                      >
                        <polygon
                          points={`0,220 ${graphPoints} 700,220`}
                          fill="rgba(37,99,235,0.06)"
                        />

                        <polyline
                          points={
                            graphPoints
                          }
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <div className="empty-chart">
                        Waiting for connection
                        activity...
                      </div>
                    )}
                  </div>
                </div>

                <div className="analytics-card">
                  <div className="chart-heading">
                    <div>
                      <span>
                        COMMERCE
                      </span>

                      <strong>
                        Order analytics
                      </strong>
                    </div>
                  </div>

                  <div className="analytics-main">
                    <div>
                      <span>
                        Total revenue
                      </span>

                      <strong>
                        {formatMoney(
                          systemStats.totalRevenue
                        )}
                      </strong>
                    </div>

                    <div className="analytics-bars">
                      <div>
                        <span>
                          Successful
                        </span>

                        <div>
                          <i
                            style={{
                              width:
                                systemStats.successfulOrders
                                  ? "100%"
                                  : "0%",
                            }}
                          />
                        </div>

                        <strong>
                          {
                            systemStats.successfulOrders
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          Rejected
                        </span>

                        <div>
                          <i
                            style={{
                              width:
                                systemStats.failedOrders
                                  ? "100%"
                                  : "0%",
                            }}
                          />
                        </div>

                        <strong>
                          {
                            systemStats.failedOrders
                          }
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="concept-section section">
              <div className="concept-heading">
                <span className="section-kicker">
                  OS CONCEPTS
                </span>

                <h2>
                  The operating-system ideas
                  behind FlashPool
                </h2>
              </div>

              <div className="concept-grid">
                <ConceptCard
                  number="01"
                  title="Resource management"
                  text="The connection pool manages a finite set of server resources and prevents unlimited connection creation."
                />

                <ConceptCard
                  number="02"
                  title="Process synchronization"
                  text="A product-level mutex ensures that only one critical inventory update occurs at a time."
                />

                <ConceptCard
                  number="03"
                  title="Waiting queue"
                  text="When all connections are occupied, additional requests wait rather than creating uncontrolled resources."
                />

                <ConceptCard
                  number="04"
                  title="Concurrency control"
                  text="Hundreds of simultaneous buyers can safely compete for limited inventory without creating negative stock."
                />
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="footer">
        <div>
          <div className="brand footer-brand">
            <div className="brand-mark">
              FP
            </div>

            <div>
              <div className="brand-name">
                FlashPool
              </div>

              <div className="brand-subtitle">
                OS Mini Project
              </div>
            </div>
          </div>

          <p>
            Demonstrating connection pooling,
            synchronization and concurrency
            control through a modern flash-sale
            experience.
          </p>
        </div>

        <div className="footer-right">
          <span>
            API{" "}
            <strong className="online-text">
              ● Online
            </strong>
          </span>

          <span>
            Pool{" "}
            <strong>
              {systemStats.pool?.max ||
                20}
            </strong>
          </span>

          <span>
            Database{" "}
            <strong>
              In-memory
            </strong>
          </span>
        </div>
      </footer>

      {cartOpen && (
        <div
          className="overlay"
          onClick={() =>
            setCartOpen(false)
          }
        >
          <aside
            className="cart-drawer"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="drawer-header">
              <div>
                <span>
                  Your selection
                </span>

                <h3>
                  Shopping cart
                </h3>
              </div>

              <button
                onClick={() =>
                  setCartOpen(false)
                }
              >
                ×
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <div>🛒</div>

                <h3>
                  Your cart is empty
                </h3>

                <p>
                  Add a product from the
                  flash sale to get
                  started.
                </p>

                <button
                  className="primary-button"
                  onClick={() => {
                    setCartOpen(false);
                    scrollToSection(
                      "shop"
                    );
                  }}
                >
                  Browse products
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(
                    (item) => (
                      <div
                        className="cart-item"
                        key={item.id}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                        />

                        <div className="cart-item-info">
                          <strong>
                            {item.name}
                          </strong>

                          <span>
                            {formatMoney(
                              item.price
                            )}
                          </span>

                          <div className="quantity">
                            <button
                              onClick={() =>
                                decreaseQuantity(
                                  item.id
                                )
                              }
                            >
                              −
                            </button>

                            <strong>
                              {
                                item.quantity
                              }
                            </strong>

                            <button
                              onClick={() =>
                                increaseQuantity(
                                  item.id
                                )
                              }
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <button
                          className="remove-item"
                          onClick={() =>
                            removeFromCart(
                              item.id
                            )
                          }
                        >
                          ×
                        </button>
                      </div>
                    )
                  )}
                </div>

                <div className="checkout-box">
                  <div>
                    <span>
                      Subtotal
                    </span>

                    <strong>
                      {formatMoney(
                        cartTotal
                      )}
                    </strong>
                  </div>

                  <p>
                    Inventory is
                    revalidated during
                    checkout.
                  </p>

                  <div className="payment-methods">
                    <span>PAYMENT METHOD</span>
                    <div>
                      {["UPI", "CARD", "COD"].map((method) => (
                        <button key={method} className={paymentMethod === method ? "payment-method active" : "payment-method"} onClick={() => setPaymentMethod(method)}>{method}</button>
                      ))}
                    </div>
                  </div>
                  <div className="payment-demo-row">
                    <span>DEMO MODE</span>
                    <button className={paymentSimulation === "FAIL" ? "demo-toggle active" : "demo-toggle"} onClick={() => setPaymentSimulation(paymentSimulation === "FAIL" ? "NORMAL" : "FAIL")}>
                      {paymentSimulation === "FAIL" ? "Failure test ON" : "Test payment failure"}
                    </button>
                  </div>
                  <div className="cart-account-status">
                    <span className={signedIn ? "status-ok" : "status-login"}>
                      <i /> {signedIn ? `Signed in as ${userProfile.name}` : "Sign in required for checkout"}
                    </span>
                    {!signedIn && (
                      <button type="button" onClick={() => { setCartOpen(false); setSignInOpen(true); }}>Sign in</button>
                    )}
                  </div>
                  <button className="primary-button full-button cart-checkout-button" onClick={checkout} disabled={paymentProcessing}>
                    {paymentProcessing ? "Processing payment…" : signedIn ? `Pay ${formatMoney(cartTotal)} →` : "Sign in to checkout →"}
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {selectedProduct && (
        <div
          className="overlay"
          onClick={() =>
            setSelectedProduct(null)
          }
        >
          <div
            className="product-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="modal-close"
              onClick={() =>
                setSelectedProduct(null)
              }
            >
              ×
            </button>

            <img
              src={
                selectedProduct.image
              }
              alt={
                selectedProduct.name
              }
            />

            <div className="modal-content">
              <span className="section-kicker">
                {
                  selectedProduct.category
                }
              </span>

              <h2>
                {
                  selectedProduct.name
                }
              </h2>

              <strong className="modal-price">
                {formatMoney(
                  selectedProduct.price
                )}
              </strong>

              <p>
                High-performance product
                available through our
                protected flash-sale
                inventory system.
              </p>

              <div className="modal-stock">
                <span>
                  Available stock
                </span>

                <strong>
                  {
                    selectedProduct.stock
                  }
                </strong>
              </div>

              <button
                className="primary-button full-button"
                onClick={() => {
                  addToCart(
                    selectedProduct
                  );

                  setSelectedProduct(
                    null
                  );
                }}
              >
                Add to cart →
              </button>
            </div>
          </div>
        </div>
      )}

      {signInOpen && (
        <div className="auth-screen" role="dialog" aria-modal="true">
          <div className="auth-shell">
            <div className="auth-brand-panel">
              <div className="auth-brand-mark">FP</div>
              <span className="auth-kicker">FLASHPOOL COMMERCE</span>
              <h1>Shop smarter.<br />Experience concurrency.</h1>
              <p>
                Your FlashPool account keeps your cart, purchases and order
                experience together in one secure shopping workspace.
              </p>
              <div className="auth-trust-list">
                <span>✓ Cart saved automatically</span>
                <span>✓ Inventory checked at checkout</span>
                <span>✓ Order history in your account</span>
              </div>
            </div>

            <div className="auth-form-panel">
              <button className="auth-close" onClick={() => setSignInOpen(false)} aria-label="Close">×</button>
              <div className="auth-form-heading">
                <span className="section-kicker">WELCOME BACK</span>
                <h2>Sign in to your account</h2>
                <p>Continue shopping with FlashPool.</p>
              </div>

              <label>Full name</label>
              <input id="signin-name" placeholder="e.g. Pari Kapoor" defaultValue={userProfile.name === "FlashPool Customer" ? "" : userProfile.name} autoComplete="name" />

              <label>Email address</label>
              <input id="signin-email" type="email" placeholder="you@example.com" defaultValue={userProfile.email === "customer@example.com" ? "" : userProfile.email} autoComplete="email" />

              <label>Password</label>
              <div className="password-field">
                <input
                  id="signin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  value={authPassword}
                  onChange={(event) => setAuthPassword(event.target.value)}
                  autoComplete="current-password"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      signIn(
                        document.getElementById("signin-name")?.value || "",
                        document.getElementById("signin-email")?.value || "",
                        authPassword,
                        authRemember
                      );
                    }
                  }}
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div className="auth-options">
                <label className="remember-option">
                  <input type="checkbox" checked={authRemember} onChange={(event) => setAuthRemember(event.target.checked)} />
                  <span>Remember me</span>
                </label>
                <button type="button" className="auth-link" onClick={() => showToast("For this OS project demo, authentication is stored locally on this browser.")}>Forgot password?</button>
              </div>

              <button
                className="auth-submit"
                onClick={() => {
                  const success = signIn(
                    document.getElementById("signin-name")?.value || "",
                    document.getElementById("signin-email")?.value || "",
                    authPassword,
                    authRemember
                  );
                  if (success) setAuthPassword("");
                }}
              >
                Sign in <span>→</span>
              </button>

              <div className="auth-demo-note">
                <strong>Demo authentication</strong>
                <span>Your account is stored locally for this project. No real payment or password service is connected.</span>
              </div>

              <button className="auth-guest" onClick={() => setSignInOpen(false)}>Continue as guest</button>
            </div>
          </div>
        </div>
      )}

      {accountOpen && signedIn && (
        <div
          className="overlay account-overlay"
          onClick={() => setAccountOpen(false)}
        >
          <div
            className="account-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setAccountOpen(false)}
            >
              ×
            </button>

            <div className="account-modal-header">
              <div className="account-avatar">{userProfile.name.slice(0, 1).toUpperCase()}</div>
              <div>
                <span className="section-kicker">MY ACCOUNT</span>
                <h2>{userProfile.name}</h2>
                <p>{userProfile.email}</p>
              </div>
            </div>

            <div className="account-stats">
              <div><strong>{adminData?.commerce?.successfulOrders || 0}</strong><span>Orders</span></div>
              <div><strong>{formatMoney(adminData?.commerce?.totalRevenue || 0)}</strong><span>Platform sales</span></div>
              <div><strong>{wishlist.length}</strong><span>Wishlist</span></div>
              <div><strong>{cartCount}</strong><span>Cart items</span></div>
            </div>

            <div className="account-section">
              <div className="account-section-heading">
                <div>
                  <span className="section-kicker">PURCHASES</span>
                  <h3>Recent orders</h3>
                </div>
                <span>{(adminData?.orders || []).length} shown</span>
              </div>

              {(adminData?.orders || []).length === 0 ? (
                <div className="account-empty">
                  <strong>No orders yet</strong>
                  <span>Your confirmed purchases will appear here.</span>
                </div>
              ) : (
                <div className="account-orders">
                  {[...readLocalArray("flashpool_orders"), ...(adminData.orders || [])]
                    .filter((order, index, list) => list.findIndex((item) => item.id === order.id) === index)
                    .slice(0, 6).map((order) => (
                    <div className="account-order" key={order.id}>
                      <div className="account-order-icon">✓</div>
                      <div className="account-order-main">
                        <strong>{order.id}</strong>
                        <span>{formatTime(order.createdAt)} · {order.items?.length || 1} item(s)</span>
                      </div>
                      <strong>{formatMoney(order.total)}</strong>
                      <span className="account-order-status">{orderStatuses?.[order.id] || "CONFIRMED"}</span>
                      <button className="account-track" onClick={() => { setAccountOpen(false); setTrackingOrder({ ...order, trackingId: `TRK-${String(order.id).replace(/\D/g, "").slice(-8) || "00000000"}` }); }}>Track</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="account-section account-tools">
              <button
                className="account-tool"
                onClick={() => {
                  setAccountOpen(false);
                  showToast(`${wishlist.length} saved item${wishlist.length === 1 ? "" : "s"}`);
                }}
              >
                <span>♡</span>
                <div><strong>Wishlist</strong><small>Saved products</small></div>
              </button>

              <button
                className="account-tool"
                onClick={() => {
                  setAccountOpen(false);
                  setCartOpen(true);
                }}
              >
                <span>🛒</span>
                <div><strong>Shopping cart</strong><small>{cartCount} item(s)</small></div>
              </button>
            </div>

            <button className="account-signout" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>
      )}

      {paymentProcessing && (
        <div className="overlay payment-overlay">
          <div className="payment-modal">
            <div className="payment-spinner" />
            <span className="section-kicker">SECURE PAYMENT</span>
            <h2>Processing your payment</h2>
            <p>Verifying payment and reserving inventory through the connection pool.</p>
            <div className="payment-progress"><span /></div>
            <small>{paymentMethod} · {formatMoney(cartTotal)}</small>
          </div>
        </div>
      )}

      {paymentResult && !paymentProcessing && !paymentResult.success && (
        <div className="overlay">
          <div className="payment-modal payment-failed">
            <div className="failure-icon">×</div>
            <span className="section-kicker">PAYMENT FAILED</span>
            <h2>Payment could not be completed.</h2>
            <p>{paymentResult.message}</p>
            <button className="primary-button full-button" onClick={() => setPaymentResult(null)}>Try again</button>
          </div>
        </div>
      )}

      {orderPlaced && (
        <div className="success-overlay">
          <div className="success-card invoice-card">
            <div className="success-check">✓</div>
            <span className="section-kicker">PAYMENT SUCCESSFUL · ORDER CONFIRMED</span>
            <h2>Your order is secured.</h2>
            <p>Payment received and inventory reserved through the protected connection pool.</p>
            <div className="invoice-grid">
              <div><span>Order ID</span><strong>{orderPlaced.id}</strong></div>
              <div><span>Invoice</span><strong>{orderPlaced.invoiceNumber}</strong></div>
              <div><span>Payment</span><strong>{orderPlaced.paymentMethod} · PAID</strong></div>
              <div><span>Tracking ID</span><strong>{orderPlaced.trackingId}</strong></div>
            </div>
            <div className="invoice-total"><span>Total paid</span><strong>{formatMoney(orderPlaced.total)}</strong></div>
            <div className="success-actions">
              <button className="primary-button full-button" onClick={() => setTrackingOrder(orderPlaced)}>Track order →</button>
              <button className="secondary-button full-button" onClick={() => setOrderPlaced(null)}>Continue shopping</button>
              {signedIn && <button className="secondary-button full-button" onClick={() => { setOrderPlaced(null); setAccountOpen(true); }}>View my account</button>}
            </div>
          </div>
        </div>
      )}

      {trackingOrder && (
        <div className="overlay" onClick={() => setTrackingOrder(null)}>
          <div className="tracking-modal" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setTrackingOrder(null)}>×</button>
            <span className="section-kicker">ORDER TRACKING</span>
            <h2>{trackingOrder.id}</h2>
            <p className="tracking-id">Tracking ID: <strong>{trackingOrder.trackingId}</strong></p>
            <div className="timeline">
              {["CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"].map((stage, index) => {
                const stages = ["CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"];
                const currentIndex = stages.indexOf(orderStatuses[trackingOrder.id] || trackingOrder.status || "CONFIRMED");
                return <div className={`timeline-step ${index <= currentIndex ? "done" : ""}`} key={stage}><div className="timeline-dot">{index <= currentIndex ? "✓" : index + 1}</div><div><strong>{stage}</strong><span>{index === currentIndex ? "Current status" : index < currentIndex ? "Completed" : "Awaiting update"}</span></div></div>;
              })}
            </div>
            <button className="primary-button full-button" onClick={() => advanceOrder(trackingOrder)} disabled={(orderStatuses[trackingOrder.id] || trackingOrder.status) === "DELIVERED"}>
              {(orderStatuses[trackingOrder.id] || trackingOrder.status) === "DELIVERED" ? "Order delivered ✓" : "Simulate next stage →"}
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast">
          <span>✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function ProductCard({
  product,
  liked,
  onLike,
  onAdd,
  onOpen,
}) {
  const meta = {
    1: { rating: 4.9, reviews: 284, badge: "BEST SELLER", delivery: "Free delivery tomorrow" },
    2: { rating: 4.8, reviews: 193, badge: "TRENDING", delivery: "Free delivery tomorrow" },
    3: { rating: 4.9, reviews: 421, badge: "TOP RATED", delivery: "Free delivery in 2 days" },
    4: { rating: 4.7, reviews: 168, badge: "FLASH DEAL", delivery: "Free delivery tomorrow" },
  }[product.id] || { rating: 4.7, reviews: 100, badge: "FLASH", delivery: "Free delivery" };

  const originalPrice = Math.round(product.price * 1.12);
  const discount = Math.max(1, Math.round(((originalPrice - product.price) / originalPrice) * 100));
  const lowStock = product.stock > 0 && product.stock <= 8;
  const soldOut = product.stock <= 0;

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} />
        <div className="product-badge">{meta.badge}</div>
        <div className="discount-badge">-{discount}%</div>
        <button
          className={liked ? "heart-button liked" : "heart-button"}
          onClick={onLike}
          aria-label={liked ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          {liked ? "♥" : "♡"}
        </button>
      </div>

      <div className="product-body">
        <span className="product-category">{product.category}</span>
        <h3>{product.name}</h3>

        <div className="rating-row">
          <span className="stars">★★★★★</span>
          <strong>{meta.rating}</strong>
          <span>({meta.reviews})</span>
        </div>

        <div className="product-price">
          <strong>{formatMoney(product.price)}</strong>
          <span>{formatMoney(originalPrice)}</span>
          <b>{discount}% off</b>
        </div>

        <div className="delivery-line">
          <span>✓</span> {meta.delivery}
        </div>

        <div className="product-stock">
          <div>
            <span>{soldOut ? "Sold out" : `${product.stock} left`}</span>
            <small>{soldOut ? "Unavailable" : lowStock ? "Selling fast" : "In stock"}</small>
          </div>
          <div className="stock-track">
            <i style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }} />
          </div>
        </div>

        <div className="product-actions">
          <button className="view-button" onClick={onOpen}>View</button>
          <button className="add-button" disabled={soldOut} onClick={onAdd}>
            {soldOut ? "Sold out" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}

function ArchitectureNode({
  icon,
  title,
  subtitle,
  highlighted,
}) {
  return (
    <div
      className={
        highlighted
          ? "architecture-node highlighted"
          : "architecture-node"
      }
    >
      <div className="architecture-icon">
        {icon}
      </div>

      <strong>{title}</strong>

      <span>{subtitle}</span>
    </div>
  );
}

function Metric({
  label,
  value,
}) {
  return (
    <div className="result-metric">
      <span>{label}</span>

      <strong>{value}</strong>
    </div>
  );
}

function DashboardMetric({
  icon,
  label,
  value,
  suffix,
  trend,
  progress,
  warning,
}) {
  return (
    <div className="dashboard-metric">
      <div className="metric-icon">
        {icon}
      </div>

      <div className="metric-title">
        <span>{label}</span>

        {warning ? (
          <b className="warning-text">
            Attention
          </b>
        ) : trend ? (
          <b>{trend}</b>
        ) : null}
      </div>

      <div className="metric-value">
        {value}

        <small>
          {suffix}
        </small>
      </div>

      {typeof progress ===
        "number" && (
        <div className="mini-progress">
          <i
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}

function ConceptCard({
  number,
  title,
  text,
}) {
  return (
    <div className="concept-card">
      <span>{number}</span>

      <h3>{title}</h3>

      <p>{text}</p>

      <div className="concept-arrow">
        →
      </div>
    </div>
  );
}

/* ========================= */
/* ADMIN DASHBOARD */
/* ========================= */


function TestingSuitePanel({
  testSuiteRunning,
  testResults,
  onRunHealthCheck,
  onRunLoadTest,
  onRunRaceTest,
  onRunQueueTest,
  onRunTestSuite,
  onClearTestResults,
}) {
  const passed = testResults.filter((item) => item.passed).length;
  const failed = testResults.filter((item) => !item.passed).length;

  return (
    <section className="testing-suite-panel">
      <div className="testing-suite-header">
        <div>
          <span className="section-kicker">OS TESTING LAB</span>
          <h2>FlashPool test center</h2>
          <p>Run controlled tests for API health, concurrency, race-condition protection and connection-pool queueing before your presentation.</p>
        </div>
        <div className="testing-suite-score">
          <strong>{passed}/{testResults.length || 0}</strong>
          <span>tests passed</span>
        </div>
      </div>

      <div className="testing-suite-grid">
        <button className="testing-card" disabled={testSuiteRunning} onClick={onRunHealthCheck}>
          <span className="testing-icon health">♥</span>
          <div><strong>API Health</strong><small>Server + pool availability</small></div>
          <b>Run →</b>
        </button>
        <button className="testing-card" disabled={testSuiteRunning} onClick={() => onRunLoadTest(1000)}>
          <span className="testing-icon load">⚡</span>
          <div><strong>1,000 User Load</strong><small>Concurrent request throughput</small></div>
          <b>Run →</b>
        </button>
        <button className="testing-card" disabled={testSuiteRunning} onClick={() => onRunRaceTest(500)}>
          <span className="testing-icon race">⚔</span>
          <div><strong>Race Condition</strong><small>500 buyers vs limited stock</small></div>
          <b>Run →</b>
        </button>
        <button className="testing-card" disabled={testSuiteRunning} onClick={onRunQueueTest}>
          <span className="testing-icon queue">≋</span>
          <div><strong>Queue Saturation</strong><small>5 connections vs 1,000 requests</small></div>
          <b>Run →</b>
        </button>
      </div>

      <div className="testing-suite-actions">
        <button className="testing-suite-primary" disabled={testSuiteRunning} onClick={onRunTestSuite}>
          {testSuiteRunning ? "Running complete test suite…" : "▶ Run all tests"}
        </button>
        <button className="testing-suite-secondary" disabled={!testResults.length || testSuiteRunning} onClick={onClearTestResults}>Clear results</button>
        {testResults.length > 0 && <span className="testing-summary">{passed} passed · {failed} failed</span>}
      </div>

      {testResults.length > 0 && (
        <div className="testing-results-table">
          <div className="testing-results-head"><span>TEST</span><span>TYPE</span><span>RESULT</span><span>TIME</span><span>DETAIL</span></div>
          {testResults.map((item) => (
            <div className="testing-results-row" key={item.id}>
              <strong>{item.name}</strong>
              <span className="testing-type">{item.type}</span>
              <span className={item.passed ? "testing-pass" : "testing-fail"}>{item.passed ? "✓ PASS" : "✕ FAIL"}</span>
              <span>{item.duration} ms</span>
              <small>{item.detail}</small>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function DemoSimulationPanel({
  systemStats,
  products,
  demoRunning,
  demoUsers,
  setDemoUsers,
  demoPhase,
  demoResult,
  onRunDemo,
  onResetDemo,
  onExportDemo,
  presentationMode,
  setPresentationMode,
}) {
  const pool = systemStats?.pool || {};
  const traffic = systemStats || {};
  const stock = products?.find((item) => item.id === 1)?.stock ?? 18;
  const max = Number(pool.max || 20);
  const active = Number(pool.active || 0);
  const waiting = Number(pool.waiting || 0);
  const idle = Number(pool.idle ?? Math.max(0, max - active));
  const phaseIndex = [
    "IDLE",
    "PREPARING SYSTEM",
    "GENERATING TRAFFIC",
    "POOL SATURATED",
    "WAITING QUEUE",
    "CRITICAL SECTION",
    "INVENTORY RESERVED",
    "RESULT",
  ].indexOf(demoPhase);
  const phaseSteps = [
    ["01", "Request arrives"],
    ["02", "Pool acquire"],
    ["03", "Queue if full"],
    ["04", "Mutex lock"],
    ["05", "Stock check"],
    ["06", "Atomic decrement"],
    ["07", "Release"],
  ];

  return (
    <>
      <section className="demo-panel">
        <div className="demo-header">
          <div>
            <span className="section-kicker">LIVE OS SIMULATION</span>
            <h2>Flash-sale concurrency lab</h2>
            <p>Watch hundreds of buyers compete for limited stock while the bounded connection pool and product mutex protect the inventory.</p>
          </div>
          <div className={`demo-phase ${demoRunning ? "running" : demoPhase === "RESULT" ? "success" : ""}`}>
            <span /> {demoPhase}
          </div>
        </div>

        <div className="demo-toolbar">
          <div className="demo-user-picker">
            <span>CONCURRENT USERS</span>
            <div>
              {[100, 250, 500, 1000].map((users) => (
                <button
                  key={users}
                  className={demoUsers === users ? "selected" : ""}
                  disabled={demoRunning}
                  onClick={() => setDemoUsers(users)}
                >
                  {users.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
          <div className="demo-actions">
            <button className="demo-primary" disabled={demoRunning} onClick={() => onRunDemo(demoUsers)}>
              {demoRunning ? "Running live demo…" : "▶ Start live demo"}
            </button>
            <button className="demo-secondary" disabled={demoRunning} onClick={onResetDemo}>↻ Reset</button>
            <button className="demo-secondary" disabled={!demoResult} onClick={onExportDemo}>⇩ Export</button>
            <button className="demo-secondary" disabled={demoRunning} onClick={() => setPresentationMode(true)}>▣ Presentation</button>
          </div>
        </div>

        <div className="demo-live-grid">
          <div className="demo-live-card"><span>ACTIVE</span><strong>{active}</strong><small>/ {max} connections</small></div>
          <div className="demo-live-card"><span>WAITING</span><strong>{waiting}</strong><small>queued requests</small></div>
          <div className="demo-live-card"><span>IDLE</span><strong>{idle}</strong><small>available connections</small></div>
          <div className="demo-live-card"><span>THROUGHPUT</span><strong>{Number(traffic.requestsPerSecond || 0)}</strong><small>requests / second</small></div>
          <div className="demo-live-card"><span>LATENCY</span><strong>{Number(traffic.latency || 0)} ms</strong><small>average response</small></div>
          <div className="demo-live-card stock-card"><span>MACBOOK STOCK</span><strong>{stock}</strong><small>units remaining</small></div>
        </div>

        <div className="demo-pool-visual">
          <div className="demo-connection-row">
            {Array.from({ length: max }).map((_, index) => {
              const state = index < active ? "active" : index < active + waiting ? "waiting" : "idle";
              return <i key={index} className={state} title={`Connection ${index + 1}: ${state}`} />;
            })}
          </div>
          <div className="demo-pool-caption">
            <span><i className="active" /> Active connections</span>
            <span><i className="waiting" /> Waiting queue</span>
            <span><i className="idle" /> Idle connections</span>
            <b>Pool capacity: {max}</b>
          </div>
        </div>

        <div className="demo-steps">
          {phaseSteps.map(([number, label], index) => (
            <div className={(demoRunning || demoResult) && phaseIndex >= index + 2 ? "done" : phaseIndex === index + 1 ? "current" : ""} key={number}>
              <span>{number}</span><strong>{label}</strong>
            </div>
          ))}
        </div>

        {demoResult && (
          <div className={`demo-result ${demoResult.oversellingPrevented ? "passed" : "failed"}`}>
            <div className="demo-result-icon">{demoResult.oversellingPrevented ? "✓" : "!"}</div>
            <div className="demo-result-copy">
              <span>FINAL RESULT</span>
              <h3>{demoResult.oversellingPrevented ? "Overselling Prevented" : "Inventory protection failed"}</h3>
              <p>{demoResult.successful} successful orders from {demoResult.users.toLocaleString()} concurrent buyers. Expected maximum: {demoResult.expectedSuccessful}. Stock finished at {demoResult.endingStock}.</p>
            </div>
            <div className="demo-before-after">
              <div><small>BEFORE</small><strong>{demoResult.startingStock}</strong><span>units</span></div>
              <b>→</b>
              <div><small>AFTER</small><strong>{demoResult.endingStock}</strong><span>units</span></div>
            </div>
          </div>
        )}
      </section>

      {presentationMode && (
        <div className="presentation-overlay">
          <div className="presentation-card">
            <div className="presentation-top">
              <div><span>FLASHPOOL OS · LIVE DEMO</span><h1>Connection Pool + Mutex Protection</h1></div>
              <button onClick={() => setPresentationMode(false)}>✕ Exit</button>
            </div>
            <div className="presentation-status"><span className={demoRunning ? "live" : ""} /> {demoPhase}</div>
            <div className="presentation-metrics">
              <div><span>USERS</span><strong>{demoUsers.toLocaleString()}</strong></div>
              <div><span>POOL</span><strong>{active}/{max}</strong></div>
              <div><span>WAITING</span><strong>{waiting}</strong></div>
              <div><span>STOCK</span><strong>{stock}</strong></div>
              <div><span>THROUGHPUT</span><strong>{Number(traffic.requestsPerSecond || 0)}</strong></div>
              <div><span>LATENCY</span><strong>{Number(traffic.latency || 0)} ms</strong></div>
            </div>
            <div className="presentation-flow">
              {phaseSteps.map(([number, label]) => <div key={number}><b>{number}</b><span>{label}</span></div>)}
            </div>
            <div className={`presentation-result ${demoResult?.oversellingPrevented ? "passed" : ""}`}>
              {demoResult ? (demoResult.oversellingPrevented ? "✓ OVERSELLING PREVENTED" : "! PROTECTION FAILED") : "RUN THE DEMO TO SHOW THE RESULT"}
            </div>
            <button className="presentation-start" disabled={demoRunning} onClick={() => onRunDemo(demoUsers)}>{demoRunning ? "Demo running…" : "▶ Run demonstration"}</button>
          </div>
        </div>
      )}
    </>
  );
}

function PoolBenchmarkPanel({
  poolLabRunning,
  poolLabSize,
  setPoolLabSize,
  poolLabUsers,
  setPoolLabUsers,
  poolLabResults,
  onConfigurePool,
  onRunBenchmark,
  onExport,
}) {
  const best = poolLabResults.length
    ? [...poolLabResults].sort((a, b) => a.duration - b.duration)[0]
    : null;
  return (
    <section className="pool-lab-panel">
      <div className="pool-lab-header">
        <div>
          <span className="section-kicker">OS PERFORMANCE LAB</span>
          <h2>Connection pool tuning</h2>
          <p>Compare different pool sizes under the same concurrent workload. This makes the operating-system trade-off visible: a larger pool reduces queue pressure, but uses more server resources.</p>
        </div>
        <div className="pool-lab-badge">{poolLabRunning ? "BENCHMARK RUNNING" : "READY"}</div>
      </div>

      <div className="pool-lab-controls">
        <label>Concurrent users
          <select value={poolLabUsers} disabled={poolLabRunning} onChange={(e) => setPoolLabUsers(Number(e.target.value))}>
            {[100, 250, 500, 1000].map((n) => <option key={n} value={n}>{n.toLocaleString()}</option>)}
          </select>
        </label>
        <label>Manual pool size
          <select value={poolLabSize} disabled={poolLabRunning} onChange={(e) => setPoolLabSize(Number(e.target.value))}>
            {[5, 10, 20, 30, 50].map((n) => <option key={n} value={n}>{n} connections</option>)}
          </select>
        </label>
        <button className="pool-lab-secondary" disabled={poolLabRunning} onClick={() => onConfigurePool(poolLabSize)}>Apply pool size</button>
        <button className="pool-lab-primary" disabled={poolLabRunning} onClick={onRunBenchmark}>{poolLabRunning ? "Running 5 configurations…" : "▶ Run benchmark"}</button>
        <button className="pool-lab-secondary" disabled={!poolLabResults.length || poolLabRunning} onClick={onExport}>⇩ CSV</button>
      </div>

      <div className="pool-lab-table-wrap">
        <table className="pool-lab-table">
          <thead><tr><th>Pool</th><th>Duration</th><th>Throughput</th><th>Peak waiting</th><th>Peak active</th><th>Result</th></tr></thead>
          <tbody>
            {[5,10,20,30,50].map((size) => {
              const row = poolLabResults.find((r) => r.size === size);
              return <tr key={size}>
                <td><strong>{size}</strong> connections</td>
                <td>{row ? `${row.duration} ms` : "—"}</td>
                <td>{row ? `${row.rps} RPS` : "—"}</td>
                <td>{row ? row.peakWaiting : "—"}</td>
                <td>{row ? row.peakConnections : "—"}</td>
                <td>{row ? (best?.size === size ? <span className="pool-best">BEST</span> : <span className="pool-tested">TESTED</span>) : <span className="pool-pending">PENDING</span>}</td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
      <div className="pool-lab-note">
        <strong>{best ? `Best observed: ${best.size} connections (${best.duration} ms)` : "Why this matters"}</strong>
        <span>{best ? `The benchmark uses ${poolLabUsers.toLocaleString()} concurrent simulation requests and compares all five configurations using the same workload.` : "The pool is a bounded resource. When every connection is busy, new requests wait instead of creating unlimited connections."}</span>
      </div>
    </section>
  );
}

function AnalyticsPanel({ adminData, orderStatuses }) {
  const data = adminData || {};
  const history = data.history || [];
  const logs = data.logs || [];
  const orders = data.orders || [];
  const successful = Number(data.commerce?.successfulOrders || 0);
  const failed = Number(data.commerce?.failedOrders || 0);
  const totalRequests = Number(data.traffic?.totalRequests || 0);
  const latency = Number(data.traffic?.latency || 0);
  const throughput = Number(data.traffic?.requestsPerSecond || 0);
  const successRate = successful + failed > 0
    ? Math.round((successful / (successful + failed)) * 100)
    : 100;
  const peakActive = Math.max(0, ...history.map((item) => Number(item.active || 0)));
  const peakWaiting = Math.max(0, ...history.map((item) => Number(item.waiting || 0)));
  const completed = orders.filter((order) => orderStatuses?.[order.id] === "DELIVERED").length;

  const exportReport = () => {
    const rows = [
      ["FlashPool Operations Report"],
      ["Generated", new Date().toLocaleString()],
      [],
      ["Metric", "Value"],
      ["Total Requests", totalRequests],
      ["Requests / Second", throughput],
      ["Average Latency (ms)", latency],
      ["Order Success Rate (%)", successRate],
      ["Successful Orders", successful],
      ["Failed Orders", failed],
      ["Peak Active Connections", peakActive],
      ["Peak Waiting Requests", peakWaiting],
      ["Tracked Orders", orders.length],
      ["Delivered Orders", completed],
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `flashpool-operations-report-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const cards = [
    ["REQUESTS", totalRequests.toLocaleString(), "Total API traffic"],
    ["THROUGHPUT", `${throughput}`, "Requests per second"],
    ["LATENCY", `${latency} ms`, "Average response time"],
    ["SUCCESS RATE", `${successRate}%`, "Completed request health"],
  ];

  return (
    <section className="analytics-panel">
      <div className="analytics-header">
        <div>
          <span className="section-kicker">PERFORMANCE ANALYTICS</span>
          <h2>System performance report</h2>
          <p>Measure traffic, connection pressure and order reliability from the live simulation.</p>
        </div>
        <button className="analytics-export" onClick={exportReport}>⇩ Export CSV report</button>
      </div>

      <div className="analytics-kpis">
        {cards.map(([label, value, hint]) => (
          <div className="analytics-kpi" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{hint}</small>
          </div>
        ))}
      </div>

      <div className="analytics-bottom">
        <div className="analytics-bars">
          <div className="analytics-subhead">
            <div><span>CONNECTION PRESSURE</span><strong>Pool demand</strong></div>
            <small>Peak active: {peakActive} · Peak waiting: {peakWaiting}</small>
          </div>
          <div className="pressure-track">
            {history.slice(-18).map((item, index) => {
              const max = Math.max(1, data.pool?.max || 20);
              const activeHeight = Math.max(8, Math.min(100, (Number(item.active || 0) / max) * 100));
              const waitingHeight = Math.max(4, Math.min(100, (Number(item.waiting || 0) / max) * 100));
              return (
                <div className="pressure-column" key={`${item.time || index}-${index}`} title={`Active ${item.active || 0} · Waiting ${item.waiting || 0}`}>
                  <i style={{ height: `${activeHeight}%` }} />
                  <b style={{ height: `${waitingHeight}%` }} />
                </div>
              );
            })}
            {history.length === 0 && <div className="analytics-empty">Run traffic to populate performance history.</div>}
          </div>
          <div className="analytics-legend"><span><i /> Active connections</span><span><b /> Waiting requests</span></div>
        </div>

        <div className="reliability-card">
          <span>ORDER RELIABILITY</span>
          <div className="reliability-ring"><strong>{successRate}%</strong><small>success</small></div>
          <div className="reliability-stats">
            <div><span>Successful</span><strong>{successful}</strong></div>
            <div><span>Failed</span><strong>{failed}</strong></div>
            <div><span>Delivered</span><strong>{completed}</strong></div>
          </div>
          <div className="reliability-note">Connection pooling and product-level locking keep limited inventory safe during concurrency spikes.</div>
        </div>
      </div>
    </section>
  );
}

function AdminDashboard({
  adminData,
  orderStatuses,
  systemStats,
  poolUtilization,
  graphPoints,
  products,
  requestFilter,
  setRequestFilter,
  requestPulse,
  onRunStress,
  stressRunning,
  testSuiteRunning,
  testResults,
  onRunHealthCheck,
  onRunLoadTest,
  onRunRaceTest,
  onRunQueueTest,
  onRunTestSuite,
  onClearTestResults,
  demoRunning,
  demoUsers,
  setDemoUsers,
  demoPhase,
  demoResult,
  onRunDemo,
  onResetDemo,
  onExportDemo,
  presentationMode,
  setPresentationMode,
  onBack,
  onReset,
}) {
  const data = adminData || {
    server: {
      status: "ONLINE",
      uptime: 0,
      port: 5000,
      database: "In-memory",
      nodeVersion: "Node.js",
    },

    pool: {
      max: 20,
      active:
        systemStats.pool?.active ||
        0,
      idle:
        systemStats.pool?.idle ||
        20,
      waiting:
        systemStats.pool?.waiting ||
        0,
      utilization:
        poolUtilization,
      peakConnections:
        systemStats.peakConnections ||
        0,
      peakWaiting:
        systemStats.peakWaiting ||
        0,
    },

    traffic: {
      totalRequests:
        systemStats.totalRequests ||
        0,
      requestsPerSecond:
        systemStats.requestsPerSecond ||
        347,
      latency:
        systemStats.latency || 124,
      activeUsers:
        systemStats.activeUsers ||
        1284,
    },

    commerce: {
      successfulOrders:
        systemStats.successfulOrders ||
        0,
      failedOrders:
        systemStats.failedOrders ||
        0,
      totalOrders:
        systemStats.successfulOrders ||
        0,
      totalRevenue:
        systemStats.totalRevenue ||
        0,
    },

    inventory: products.map(
      (product) => ({
        ...product,
        initialStock:
          product.stock,
        sold: 0,
        stockPercentage: 100,
        status: "HEALTHY",
      })
    ),

    orders: [],

    logs: [],

    history:
      systemStats.history || [],
  };

  const uptimeHours =
    Math.floor(
      (data.server.uptime || 0) /
        3600
    );

  const uptimeMinutes =
    Math.floor(
      ((data.server.uptime || 0) %
        3600) /
        60
    );

  const requestLogs =
    data.logs || [];

  const filteredLogs =
    requestLogs.filter((log) => {
      if (requestFilter === "ALL") {
        return true;
      }

      if (
        requestFilter === "ERRORS"
      ) {
        return (
          log.type === "WARNING"
        );
      }

      if (
        requestFilter === "ORDERS"
      ) {
        return (
          log.type === "SUCCESS"
        );
      }

      if (
        requestFilter === "STRESS"
      ) {
        return (
          log.type === "STRESS"
        );
      }

      return true;
    });

  const telemetry =
    data.history || [];

  const adminGraph =
    useMemo(() => {
      if (telemetry.length < 2) {
        return graphPoints;
      }

      const maxValue =
        Math.max(
          data.pool.max || 20,
          ...telemetry.map(
            (item) =>
              Math.max(
                item.active || 0,
                item.waiting || 0
              )
          )
        );

      return telemetry
        .map((item, index) => {
          const x =
            (index /
              (telemetry.length -
                1)) *
            700;

          const y =
            220 -
            ((item.active || 0) /
              maxValue) *
              220;

          return `${x},${y}`;
        })
        .join(" ");
    }, [
      telemetry,
      data.pool.max,
      graphPoints,
    ]);

  return (
    <section className="admin-dashboard">
      <div className="admin-top">
        <button
          className="back-dashboard"
          onClick={onBack}
        >
          ← Back to storefront
        </button>

        <div className="admin-heading">
          <div>
            <span className="section-kicker">
              OPERATIONS CONSOLE
            </span>

            <h1>
              System command center
            </h1>

            <p>
              Monitor server resources,
              requests, concurrency,
              inventory and commerce
              activity in real time.
            </p>
          </div>

          <div className="admin-actions">
            <div className="server-online">
              <span />
              System online
            </div>

            <button
              className="admin-reset"
              onClick={onReset}
            >
              ↻ Reset system
            </button>
          </div>
        </div>
      </div>

      <div className="admin-stat-grid">
        <AdminStat
          label="ACTIVE CONNECTIONS"
          value={data.pool.active}
          suffix={`/ ${data.pool.max}`}
          icon="◉"
          progress={
            data.pool.utilization
          }
        />

        <AdminStat
          label="REQUESTS / SECOND"
          value={
            data.traffic
              .requestsPerSecond
          }
          suffix=""
          icon="↗"
          trend="Live traffic"
        />

        <AdminStat
          label="AVERAGE LATENCY"
          value={
            data.traffic.latency
          }
          suffix="ms"
          icon="◷"
          trend="Healthy"
        />

        <AdminStat
          label="WAITING QUEUE"
          value={data.pool.waiting}
          suffix=""
          icon="⌛"
          trend={
            data.pool.waiting === 0
              ? "No queue"
              : "Requests waiting"
          }
        />
      </div>

      <div className="admin-main-grid">
        <div className="admin-panel pool-panel">
          <div className="admin-panel-header">
            <div>
              <span>
                CONNECTION POOL
              </span>

              <h2>
                Resource allocation
              </h2>
            </div>

            <div className="panel-status">
              ● Healthy
            </div>
          </div>

          <div className="pool-visual">
            <div className="pool-center">
              <strong>
                {data.pool.active}
              </strong>

              <span>
                active
              </span>

              <small>
                of {data.pool.max}
              </small>
            </div>

            <div className="pool-ring">
              <div
                className="pool-ring-progress"
                style={{
                  "--pool-progress": `${Math.max(
                    3,
                    data.pool
                      .utilization
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="pool-breakdown">
            <PoolItem
              label="Active"
              value={
                data.pool.active
              }
              type="active"
            />

            <PoolItem
              label="Idle"
              value={data.pool.idle}
              type="idle"
            />

            <PoolItem
              label="Waiting"
              value={
                data.pool.waiting
              }
              type="waiting"
            />
          </div>

          <div className="pool-limit">
            <div>
              <span>
                Maximum pool size
              </span>

              <strong>
                {data.pool.max}
              </strong>
            </div>

            <div>
              <span>
                Peak connections
              </span>

              <strong>
                {
                  data.pool
                    .peakConnections
                }
              </strong>
            </div>

            <div>
              <span>
                Peak waiting
              </span>

              <strong>
                {
                  data.pool
                    .peakWaiting
                }
              </strong>
            </div>
          </div>
        </div>

        <div className="admin-panel server-panel">
          <div className="admin-panel-header">
            <div>
              <span>
                SERVER HEALTH
              </span>

              <h2>
                Runtime status
              </h2>
            </div>

            <div className="health-icon">
              ✓
            </div>
          </div>

          <div className="health-list">
            <HealthRow
              label="API Server"
              value="ONLINE"
            />

            <HealthRow
              label="Connection Pool"
              value={`${data.pool.max} connections`}
            />

            <HealthRow
              label="Database"
              value={
                data.server
                  .database
              }
            />

            <HealthRow
              label="Port"
              value={`:${data.server.port}`}
            />

            <HealthRow
              label="Uptime"
              value={`${uptimeHours}h ${uptimeMinutes}m`}
            />

            <HealthRow
              label="Runtime"
              value={
                data.server
                  .nodeVersion
              }
            />
          </div>
        </div>
      </div>

      {/* REQUEST MONITOR */}

      <section
        className={
          requestPulse
            ? "request-monitor pulse"
            : "request-monitor"
        }
      >
        <div className="request-monitor-header">
          <div>
            <span className="section-kicker">
              REQUEST MONITOR
            </span>

            <h2>
              Live server activity
            </h2>

            <p>
              Observe requests as they
              pass through the API and
              connection pool.
            </p>
          </div>

          <div className="request-monitor-live">
            <span />
            LIVE STREAM
          </div>
        </div>

        <div className="request-toolbar">
          <div className="request-filters">
            {[
              ["ALL", "All requests"],
              ["ORDERS", "Orders"],
              ["ERRORS", "Rejected"],
              ["STRESS", "Stress tests"],
            ].map(
              ([value, label]) => (
                <button
                  key={value}
                  className={
                    requestFilter ===
                    value
                      ? "request-filter active"
                      : "request-filter"
                  }
                  onClick={() =>
                    setRequestFilter(
                      value
                    )
                  }
                >
                  {label}
                </button>
              )
            )}
          </div>

          <div className="request-counter">
            <span className="counter-dot" />

            <strong>
              {
                data.traffic
                  .totalRequests
              }
            </strong>

            <span>
              total requests
            </span>
          </div>
        </div>

        <div className="request-monitor-grid">
          <div className="request-stream">
            <div className="request-stream-head">
              <span>EVENT</span>
              <span>TYPE</span>
              <span>DETAILS</span>
              <span>TIME</span>
            </div>

            {filteredLogs.length ===
            0 ? (
              <div className="request-empty">
                <div className="request-empty-icon">
                  ◌
                </div>

                <strong>
                  No request activity
                </strong>

                <span>
                  Run a traffic simulation,
                  place an order or start a
                  concurrency test.
                </span>
              </div>
            ) : (
              filteredLogs
                .slice(0, 12)
                .map((log, index) => (
                  <div
                    className={
                      index === 0
                        ? "request-row newest"
                        : "request-row"
                    }
                    key={log.id}
                  >
                    <div className="request-event">
                      <span
                        className={`request-method ${String(
                          log.type
                        ).toLowerCase()}`}
                      >
                        {log.type ===
                        "SUCCESS"
                          ? "POST"
                          : log.type ===
                            "WARNING"
                          ? "400"
                          : log.type ===
                            "STRESS"
                          ? "LOAD"
                          : "GET"}
                      </span>

                      <strong>
                        {log.message}
                      </strong>
                    </div>

                    <div>
                      <span
                        className={`request-type ${String(
                          log.type
                        ).toLowerCase()}`}
                      >
                        {log.type}
                      </span>
                    </div>

                    <div className="request-details">
                      {log.details ||
                        "Server event"}
                    </div>

                    <time>
                      {log.time}
                    </time>
                  </div>
                ))
            )}
          </div>

          <div className="request-side">
            <div className="request-side-card">
              <span>
                CURRENT THROUGHPUT
              </span>

              <strong>
                {
                  data.traffic
                    .requestsPerSecond
                }
              </strong>

              <small>
                requests per second
              </small>

              <div className="throughput-bars">
                {Array.from({
                  length: 18,
                }).map(
                  (_, index) => (
                    <i
                      key={index}
                      style={{
                        height: `${
                          20 +
                          ((index * 17) %
                            65)
                        }%`,
                      }}
                    />
                  )
                )}
              </div>
            </div>

            <div className="request-side-card">
              <span>
                RESPONSE HEALTH
              </span>

              <div className="response-health">
                <div className="health-score">
                  <strong>
                    {data.traffic
                      .latency < 200
                      ? "98"
                      : "91"}
                  </strong>

                  <span>/100</span>
                </div>

                <div>
                  <b>
                    Excellent
                  </b>

                  <small>
                    Avg response{" "}
                    {
                      data.traffic
                        .latency
                    }
                    ms
                  </small>
                </div>
              </div>
            </div>

            <div className="request-side-card quick-test">
              <span>
                QUICK LOAD TEST
              </span>

              <strong>
                Stress the server
              </strong>

              <p>
                Launch 500 simultaneous
                buyers directly from the
                operations console.
              </p>

              <button
                disabled={
                  stressRunning
                }
                onClick={() =>
                  onRunStress(500)
                }
              >
                {stressRunning
                  ? "Running test..."
                  : "Run 500-user test →"}
              </button>
            </div>
          </div>
        </div>
      </section>

<TestingSuitePanel
        testSuiteRunning={testSuiteRunning}
        testResults={testResults}
        onRunHealthCheck={onRunHealthCheck}
        onRunLoadTest={onRunLoadTest}
        onRunRaceTest={onRunRaceTest}
        onRunQueueTest={onRunQueueTest}
        onRunTestSuite={onRunTestSuite}
        onClearTestResults={onClearTestResults}
      />

      <DemoSimulationPanel
        systemStats={systemStats}
        products={products}
        demoRunning={demoRunning}
        demoUsers={demoUsers}
        setDemoUsers={setDemoUsers}
        demoPhase={demoPhase}
        demoResult={demoResult}
        onRunDemo={onRunDemo}
        onResetDemo={onResetDemo}
        onExportDemo={onExportDemo}
        presentationMode={presentationMode}
        setPresentationMode={setPresentationMode}
      />

      {/* TELEMETRY */}

      <div className="admin-panel admin-chart-panel">
        <div className="admin-panel-header">
          <div>
            <span>
              LIVE TELEMETRY
            </span>

            <h2>
              Connection activity
            </h2>
          </div>

          <div className="chart-summary">
            <strong>
              {data.pool.active}
            </strong>

            <span>
              current active
            </span>
          </div>
        </div>

        <div className="admin-large-chart">
          {telemetry.length > 1 ? (
            <svg
              viewBox="0 0 700 220"
              preserveAspectRatio="none"
            >
              <polyline
                points={adminGraph}
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <div className="empty-chart">
              Live telemetry will appear
              as requests arrive.
            </div>
          )}
        </div>
      </div>

      <PoolBenchmarkPanel
        poolLabRunning={poolLabRunning}
        poolLabSize={poolLabSize}
        setPoolLabSize={setPoolLabSize}
        poolLabUsers={poolLabUsers}
        setPoolLabUsers={setPoolLabUsers}
        poolLabResults={poolLabResults}
        onConfigurePool={configurePool}
        onRunBenchmark={runPoolBenchmark}
        onExport={exportPoolBenchmark}
      />

      <AnalyticsPanel adminData={data} orderStatuses={orderStatuses} />

      <div className="admin-detail-grid">
        <div className="admin-detail-card">
          <span className="section-kicker">HOW IT WORKS</span>
          <h2>Connection pool under load</h2>
          <div className="detail-flow">
            <span>Client requests</span><b>→</b><span>Express API</span><b>→</b><span>Bounded pool</span><b>→</b><span>Inventory lock</span>
          </div>
          <p>Requests share a fixed number of reusable resources. When all connections are busy, extra requests wait instead of creating unlimited connections.</p>
        </div>
        <div className="admin-detail-card">
          <span className="section-kicker">WHY IT MATTERS</span>
          <h2>Overselling protection</h2>
          <ul className="detail-list">
            <li><strong>Pool limit:</strong> maximum 20 concurrent connections.</li>
            <li><strong>Queue:</strong> excess requests wait for an idle connection.</li>
            <li><strong>Product mutex:</strong> one inventory update happens at a time.</li>
            <li><strong>Result:</strong> successful orders never exceed available stock.</li>
          </ul>
        </div>
      </div>

      {/* INVENTORY */}

      <div className="admin-section-title">
        <div>
          <span className="section-kicker">
            INVENTORY
          </span>

          <h2>
            Inventory health
          </h2>
        </div>

        <span>
          {data.inventory.length}{" "}
          products
        </span>
      </div>

      <div className="inventory-admin-grid">
        {data.inventory.map(
          (product) => (
            <div
              className="inventory-admin-card"
              key={product.id}
            >
              <div className="inventory-image">
                <img
                  src={product.image}
                  alt={product.name}
                />
              </div>

              <div className="inventory-info">
                <div className="inventory-title">
                  <div>
                    <span>
                      {product.category}
                    </span>

                    <h3>
                      {product.name}
                    </h3>
                  </div>

                  <InventoryStatus
                    status={
                      product.status
                    }
                  />
                </div>

                <div className="inventory-numbers">
                  <div>
                    <span>
                      Remaining
                    </span>

                    <strong>
                      {product.stock}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Sold
                    </span>

                    <strong>
                      {product.sold}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Price
                    </span>

                    <strong>
                      {formatMoney(
                        product.price
                      )}
                    </strong>
                  </div>
                </div>

                <div className="inventory-progress">
                  <div>
                    <span>
                      Stock level
                    </span>

                    <strong>
                      {
                        product.stockPercentage
                      }
                      %
                    </strong>
                  </div>

                  <div>
                    <i
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            product.stockPercentage
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* ORDERS AND LOGS */}

      <div className="admin-bottom-grid">
        <div className="admin-panel logs-panel">
          <div className="admin-panel-header">
            <div>
              <span>
                REQUEST ACTIVITY
              </span>

              <h2>
                Event history
              </h2>
            </div>

            <div className="log-live">
              LIVE
            </div>
          </div>

          <div className="logs-list">
            {data.logs.length ===
            0 ? (
              <div className="empty-admin">
                No activity yet.
                <br />
                Run a simulation or place
                an order.
              </div>
            ) : (
              data.logs
                .slice(0, 10)
                .map((log) => (
                  <div
                    className="log-row"
                    key={log.id}
                  >
                    <div
                      className={`log-type ${String(
                        log.type
                      ).toLowerCase()}`}
                    >
                      {log.type ===
                      "SUCCESS"
                        ? "✓"
                        : log.type ===
                          "WARNING"
                        ? "!"
                        : log.type ===
                          "STRESS"
                        ? "⚡"
                        : "i"}
                    </div>

                    <div className="log-content">
                      <strong>
                        {log.message}
                      </strong>

                      <span>
                        {log.details}
                      </span>
                    </div>

                    <time>
                      {log.time}
                    </time>
                  </div>
                ))
            )}
          </div>
        </div>

        <div className="admin-panel orders-panel">
          <div className="admin-panel-header">
            <div>
              <span>
                COMMERCE
              </span>

              <h2>
                Recent orders
              </h2>
            </div>

            <div className="orders-total">
              {
                data.commerce
                  .totalOrders
              }{" "}
              total
            </div>
          </div>

          <div className="orders-summary">
            <div>
              <span>
                Revenue
              </span>

              <strong>
                {formatMoney(
                  data.commerce
                    .totalRevenue
                )}
              </strong>
            </div>

            <div>
              <span>
                Successful
              </span>

              <strong>
                {
                  data.commerce
                    .successfulOrders
                }
              </strong>
            </div>

            <div>
              <span>
                Failed
              </span>

              <strong>
                {
                  data.commerce
                    .failedOrders
                }
              </strong>
            </div>
          </div>

          <div className="orders-list">
            {data.orders.length ===
            0 ? (
              <div className="empty-admin">
                No orders yet.
              </div>
            ) : (
              data.orders.map(
                (order) => (
                  <div
                    className="order-row"
                    key={order.id}
                  >
                    <div className="order-avatar">
                      FP
                    </div>

                    <div>
                      <strong>
                        {order.id}
                      </strong>

                      <span>
                        {formatTime(
                          order.createdAt
                        )}
                      </span>
                    </div>

                    <strong>
                      {formatMoney(
                        order.total
                      )}
                    </strong>

                    <span className="confirmed">
                      {orderStatuses?.[order.id] || "CONFIRMED"}
                    </span>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </div>

      {/* ARCHITECTURE */}

      <div className="admin-architecture">
        <div className="admin-architecture-heading">
          <span className="section-kicker">
            SYSTEM ARCHITECTURE
          </span>

          <h2>
            How a request moves through
            FlashPool
          </h2>

          <p>
            Every request passes through
            the bounded resource pool
            before reaching the protected
            inventory critical section.
          </p>
        </div>

        <div className="admin-architecture-flow">
          <AdminArchitectureNode
            icon="01"
            title="Client requests"
            text="Hundreds of buyers"
          />

          <AdminArchitectureArrow />

          <AdminArchitectureNode
            icon="02"
            title="Express server"
            text="Request routing"
          />

          <AdminArchitectureArrow />

          <AdminArchitectureNode
            icon="03"
            title="Connection pool"
            text="Maximum 20"
            active
          />

          <AdminArchitectureArrow />

          <AdminArchitectureNode
            icon="04"
            title="Product mutex"
            text="Critical section"
            active
          />

          <AdminArchitectureArrow />

          <AdminArchitectureNode
            icon="05"
            title="Inventory"
            text="Atomic update"
          />
        </div>
      </div>
    </section>
  );
}

function AdminStat({
  label,
  value,
  suffix,
  icon,
  trend,
  progress,
}) {
  return (
    <div className="admin-stat">
      <div className="admin-stat-icon">
        {icon}
      </div>

      <span>{label}</span>

      <div className="admin-stat-value">
        {value}

        <small>
          {suffix}
        </small>
      </div>

      {typeof progress ===
      "number" ? (
        <div className="admin-stat-progress">
          <i
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      ) : (
        <small className="admin-stat-trend">
          {trend}
        </small>
      )}
    </div>
  );
}

function PoolItem({
  label,
  value,
  type,
}) {
  return (
    <div className="pool-item">
      <div>
        <i className={type} />

        <span>
          {label}
        </span>
      </div>

      <strong>
        {value}
      </strong>
    </div>
  );
}

function HealthRow({
  label,
  value,
}) {
  return (
    <div className="health-row">
      <div>
        <span className="health-dot" />

        <span>
          {label}
        </span>
      </div>

      <strong>
        {value}
      </strong>
    </div>
  );
}

function InventoryStatus({
  status,
}) {
  const config = {
    HEALTHY: {
      label: "Healthy",
      className: "healthy",
    },

    LOW_STOCK: {
      label: "Low stock",
      className: "low",
    },

    OUT_OF_STOCK: {
      label: "Sold out",
      className: "out",
    },
  };

  const current =
    config[status] ||
    config.HEALTHY;

  return (
    <span
      className={`inventory-status ${current.className}`}
    >
      ● {current.label}
    </span>
  );
}

function AdminArchitectureNode({
  icon,
  title,
  text,
  active,
}) {
  return (
    <div
      className={
        active
          ? "admin-architecture-node active"
          : "admin-architecture-node"
      }
    >
      <div>{icon}</div>

      <strong>
        {title}
      </strong>

      <span>
        {text}
      </span>
    </div>
  );
}

function AdminArchitectureArrow() {
  return (
    <div className="admin-architecture-arrow">
      →
    </div>
  );
}

export default App;