const BASE_URL = 'http://localhost:3000/api/v1';

export const fetchApi = async (endpoint, options = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    // Moleculer API Gateway often returns data inside 'data' property if using aliases
    // but error handling may vary. We'll handle basic JSON return.
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const API = {
  products: {
    getHomepage: () => fetchApi('/aggregates/homepage-products'),
    getDetails: (id) => fetchApi(`/aggregates/product-details/${id}`),
    getBasicInfo: (id) => fetchApi(`/products/id/${id}`),
    getCatalogs: () => fetchApi('/products/catalogs'),
    getShop: (id) => fetchApi(`/products/get-shop/${id}`),
  },
  cart: {
    get: (userId) => fetchApi(`/carts/user/${userId}`),
    add: (userId, data) => fetchApi(`/carts/user/${userId}/add`, { method: 'POST', body: JSON.stringify(data) }),
    update: (userId, data) => fetchApi(`/carts/user/${userId}/update`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (userId, productId) => fetchApi(`/carts/user/${userId}/remove`, { method: 'DELETE', body: JSON.stringify({ productId }) }),
    clear: (userId) => fetchApi(`/carts/user/${userId}/clear`, { method: 'DELETE' }),
  },
  order: {
    create: (data) => fetchApi('/orders/create', { method: 'POST', body: JSON.stringify(data) }),
  },
  user: {
    getProvinces: () => fetchApi('/users/address/province/all'),
    getDistricts: (provinceId) => fetchApi(`/users/address/district/by-province/${provinceId}`),
    getWards: (districtId) => fetchApi(`/users/address/ward/by-district/${districtId}`),
  }
};
