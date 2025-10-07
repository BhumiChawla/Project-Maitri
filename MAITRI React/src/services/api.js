const API_BASE_URL = 'http://localhost:8080/api/auth';

class ApiService {
  async makeRequest(endpoint, options = {}) {
    try {
      console.log('Making API request to:', `${API_BASE_URL}${endpoint}`);
      console.log('Request options:', options);
      
      const finalHeaders = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
      
      console.log('Final headers:', finalHeaders);
      console.log('Request body:', options.body);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: finalHeaders,
        ...options,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        // Try to parse as JSON to get the error message
        try {
          const errorData = JSON.parse(errorText);
          const errorMessage = errorData.message || errorText || `HTTP error! status: ${response.status}`;
          throw new Error(errorMessage);
        } catch (parseError) {
          // If it's not JSON, throw the raw text
          throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }
      }

      const result = await response.json();
      console.log('Success response:', result);
      return result;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async login(email, password) {
    return this.makeRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData) {
    return this.makeRequest('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async checkEmail(email) {
    return this.makeRequest(`/check-email?email=${encodeURIComponent(email)}`, {
      method: 'GET',
    });
  }

  async healthCheck() {
    return this.makeRequest('/health', {
      method: 'GET',
    });
  }

  async getProfile(token) {
    return this.makeRequest('/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async updateProfile(token, userData) {
    return this.makeRequest('/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
  }
}

export default new ApiService();
