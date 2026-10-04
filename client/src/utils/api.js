const API_BASE = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('tata_compliance_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  login: async (userId, password) => {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, password })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }
    return response.json();
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
    return response.json();
  },

  getOrders: async () => {
    const response = await fetch(`${API_BASE}/orders`, {
      headers: getHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    return response.json();
  },

  createOrder: async (orderData) => {
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create order');
    }
    return response.json();
  },

  getInventory: async () => {
    const response = await fetch(`${API_BASE}/inventory`, {
      headers: getHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch inventory');
    }
    return response.json();
  },

  getInventoryByProductCode: async (productCode) => {
    const response = await fetch(`${API_BASE}/inventory/${productCode}`, {
      headers: getHeaders()
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch product inventory');
    }
    return response.json();
  },

  updateInventoryStock: async (productCode, availableQuantity) => {
    const response = await fetch(`${API_BASE}/inventory/${productCode}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ availableQuantity })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update stock');
    }
    return response.json();
  },

  getCompliance: async () => {
    const response = await fetch(`${API_BASE}/compliance`, {
      headers: getHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch compliance reports');
    }
    return response.json();
  },

  getComplianceByOrderId: async (orderId) => {
    const response = await fetch(`${API_BASE}/compliance/${orderId}`, {
      headers: getHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch compliance report');
    }
    return response.json();
  },

  calculateCompliance: async (orderId) => {
    const response = await fetch(`${API_BASE}/compliance/calculate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ orderId })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to calculate compliance');
    }
    return response.json();
  },

  getHelpMessages: async () => {
    const response = await fetch(`${API_BASE}/help`, {
      headers: getHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch help messages');
    }
    return response.json();
  },

  createHelpMessage: async (subject, message) => {
    const response = await fetch(`${API_BASE}/help`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ subject, message })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send help message');
    }
    return response.json();
  },

  replyHelpMessage: async (id, reply) => {
    const response = await fetch(`${API_BASE}/help/${id}/reply`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reply })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to reply to message');
    }
    return response.json();
  },

  closeHelpMessage: async (id) => {
    const response = await fetch(`${API_BASE}/help/${id}/close`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to close message');
    }
    return response.json();
  }
};
