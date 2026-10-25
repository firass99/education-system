import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async logout() {
    try {
      // Revoke the token server-side while it is still attached to the request
      await api.post('/auth/logout', null, { silent: true });
    } catch (e) {
      // Ignore: we clear local state regardless
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  async getProfile() {
    const response = await api.get('/auth/me');
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.put('/auth/profile', data);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },

  async getRoles() {
    const response = await api.get('/auth/roles');
    return response.data;
  },

  async getParents() {
    const response = await api.get('/auth/parents');
    return response.data;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
};

export const courseService = {
  async getAll(params = {}, config = {}) {
    const response = await api.get('/courses', { params, ...config });
    return response.data;
  },

  async getById(id, config = {}) {
    const response = await api.get(`/courses/${id}`, config);
    return response.data;
  },

  async create(courseData) {
    const response = await api.post('/courses', courseData);
    return response.data;
  },

  async update(id, courseData) {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },
};

export const categoryService = {
  async getAll(config = {}) {
    const response = await api.get('/categories', config);
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  async create(categoryData) {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  async update(id, categoryData) {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export const enrollmentService = {
  async getAll() {
    const response = await api.get('/enrollments');
    return response.data;
  },

  async enroll(courseId, studentId = null) {
    const payload = { course_id: courseId };
    if (studentId) payload.student_id = studentId;
    const response = await api.post('/enrollments', payload);
    return response.data;
  },

  async updateProgress(id, data) {
    const response = await api.put(`/enrollments/${id}`, data);
    return response.data;
  },

  async drop(id) {
    const response = await api.delete(`/enrollments/${id}`);
    return response.data;
  },
};

export const dashboardService = {
  async getStats() {
    const response = await api.get('/dashboard');
    return response.data;
  },
};

export const userService = {
  async getAll(params = {}) {
    const response = await api.get('/users', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async create(userData) {
    const response = await api.post('/users', userData);
    return response.data;
  },

  async update(id, userData) {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};
