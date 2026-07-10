const API_BASE_URL = 'http://localhost:8080/api/v1';

// Helper to get headers with JWT token
const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

// Generic fetch wrapper
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { ...getHeaders(options.isMultipart), ...options.headers };
  
  const config = {
    ...options,
    headers
  };
  
  if (config.body && typeof config.body === 'object' && !options.isMultipart) {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: 'Something went wrong' };
    }
    throw errorData;
  }

  if (response.status === 204) {
    return null;
  }
  
  return response.json();
};

export const api = {
  // Auth
  login: async (email, password) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify({ email: data.email, roles: data.roles }));
    return data;
  },

  register: async (email, fullName, password, phoneNumber) => {
    return request('/auth/register', {
      method: 'POST',
      body: { email, fullName, password, phoneNumber }
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Products
  getProducts: async (page = 0, size = 12) => {
    return request(`/products?page=${page}&size=${size}&sort=id,desc`);
  },

  getProduct: async (id) => {
    const product = await request(`/products/${id}`);
    
    // Fetch variants & images dynamically as described in the backend controllers
    try {
      const variants = await request(`/products/${id}/variants`);
      product.variants = variants || [];
    } catch (e) {
      product.variants = [];
    }

    try {
      const images = await request(`/products/${id}/images`);
      product.images = images || [];
    } catch (e) {
      product.images = [];
    }

    return product;
  },

  // Cart
  getCart: async (userId) => {
    return request(`/carts?userId=${userId}`);
  },

  addToCart: async (userId, productVariantId, quantity) => {
    return request(`/carts/items?userId=${userId}`, {
      method: 'POST',
      body: { productVariantId, quantity }
    });
  },

  updateCartItem: async (userId, itemId, quantity) => {
    return request(`/carts/items/${itemId}?userId=${userId}&quantity=${quantity}`, {
      method: 'PUT'
    });
  },

  removeCartItem: async (userId, itemId) => {
    return request(`/carts/items/${itemId}?userId=${userId}`, {
      method: 'DELETE'
    });
  },

  clearCart: async (userId) => {
    return request(`/carts?userId=${userId}`, {
      method: 'DELETE'
    });
  },

  // Orders
  createOrder: async (userId, shippingAddress, warehouseId, shipperId, items, couponCode = null) => {
    return request(`/orders?userId=${userId}`, {
      method: 'POST',
      body: {
        shippingAddress,
        warehouseId,
        shipperId,
        items,
        couponCode
      }
    });
  },

  getOrder: async (orderId) => {
    return request(`/orders/${orderId}`);
  },

  getOrderHistory: async (userId, page = 0, size = 10) => {
    return request(`/orders/user/${userId}?page=${page}&size=${size}&sort=id,desc`);
  },

  // SePay Webhook Simulator (Allows easy UI demonstrations)
  simulateSePayPayment: async (orderCode, amount) => {
    return request('/payment/sepay/webhook', {
      method: 'POST',
      body: {
        id: Math.floor(Math.random() * 100000000),
        gateway: 'VietcomBank',
        transactionDate: new Date().toISOString(),
        accountNumber: '1234567890',
        subAccount: null,
        transferAmount: amount,
        transferType: 'in',
        code: orderCode,
        content: `Thanh toan don hang ${orderCode}`,
        referenceCode: 'SIM' + Math.floor(Math.random() * 100000000)
      }
    });
  }
};
