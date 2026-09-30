import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT access token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('bozor_access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to auto-refresh expired access token
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('bozor_refresh_token');

      // If no refresh token or already retried, do not loop
      if (!refreshToken || originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem('bozor_access_token', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('bozor_refresh_token', newRefreshToken);
        }

        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('bozor_access_token');
        localStorage.removeItem('bozor_refresh_token');
        localStorage.removeItem('bozor_user');
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Endpoints
export const api = {
  // Auth
  auth: {
    register: (data: any) => apiClient.post('/auth/register', data),
    login: (data: any) => apiClient.post('/auth/login', data),
    getMe: () => apiClient.get('/auth/me'),
    updateProfile: (data: any) => apiClient.put('/auth/profile', data),
    changePassword: (data: any) => apiClient.put('/auth/password', data),
  },

  // Products
  products: {
    getAll: (params?: any) => apiClient.get('/products', { params }),
    getById: (id: string) => apiClient.get(`/products/${id}`),
    create: (data: any) => apiClient.post('/products', data),
    update: (id: string, data: any) => apiClient.put(`/products/${id}`, data),
    delete: (id: string) => apiClient.delete(`/products/${id}`),
  },

  // Categories
  categories: {
    getAll: (params?: any) => apiClient.get('/categories', { params }),
    getById: (id: string) => apiClient.get(`/categories/${id}`),
    create: (data: any) => apiClient.post('/categories', data),
    update: (id: string, data: any) => apiClient.put(`/categories/${id}`, data),
    delete: (id: string) => apiClient.delete(`/categories/${id}`),
  },

  // Cart
  cart: {
    get: () => apiClient.get('/cart'),
    add: (productId: string, quantity = 1) => apiClient.post('/cart', { productId, quantity }),
    update: (itemId: string, quantity: number) => apiClient.put(`/cart/${itemId}`, { quantity }),
    remove: (itemId: string) => apiClient.delete(`/cart/${itemId}`),
    clear: () => apiClient.delete('/cart'),
    sync: (items: any[]) => apiClient.post('/cart/sync', { items }),
  },

  // Orders
  orders: {
    create: (data: any) => apiClient.post('/orders', data),
    getAll: () => apiClient.get('/orders'),
    getById: (id: string) => apiClient.get(`/orders/${id}`),
    updateStatus: (id: string, status: string, paymentStatus?: string) =>
      apiClient.put(`/orders/${id}/status`, { status, paymentStatus }),
  },

  // Favorites
  favorites: {
    getAll: () => apiClient.get('/favorites'),
    add: (productId: string) => apiClient.post(`/favorites/${productId}`),
    remove: (productId: string) => apiClient.delete(`/favorites/${productId}`),
  },

  // Reviews
  reviews: {
    getByProduct: (productId: string) => apiClient.get(`/products/${productId}/reviews`),
    create: (productId: string, data: any) => apiClient.post(`/products/${productId}/reviews`, data),
  },

  // Seller
  seller: {
    register: (data: any) => apiClient.post('/seller/register', data),
    getDashboard: () => apiClient.get('/seller/dashboard'),
    getProducts: () => apiClient.get('/seller/products'),
    getOrders: () => apiClient.get('/seller/orders'),
  },

  // Admin
  admin: {
    getDashboard: () => apiClient.get('/admin/dashboard'),
    getUsers: (params?: any) => apiClient.get('/admin/users', { params }),
    updateUserRole: (id: string, role: string) => apiClient.put(`/admin/users/${id}/role`, { role }),
    updateUserStatus: (id: string, status: string) => apiClient.put(`/admin/users/${id}/status`, { status }),
    getSellers: () => apiClient.get('/admin/sellers'),
    updateSellerStatus: (id: string, status: string) => apiClient.put(`/admin/sellers/${id}/status`, { status }),
    getProducts: () => apiClient.get('/admin/products'),
    updateProductStatus: (id: string, status: string) => apiClient.put(`/admin/products/${id}/status`, { status }),
    getOrders: () => apiClient.get('/admin/orders'),
    resetData: () => apiClient.post('/admin/reset-data'),
  },

  // Notifications
  notifications: {
    getAll: () => apiClient.get('/notifications'),
    markAsRead: (id: string) => apiClient.put(`/notifications/${id}/read`),
    markAllAsRead: () => apiClient.put('/notifications/read-all'),
  },

  // Upload
  upload: {
    image: (data: any) => apiClient.post('/upload', data),
  },
};
