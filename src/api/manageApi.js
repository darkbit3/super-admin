import { api } from './client'

export const manageApi = {
  // Stats
  getStats: () => api.get('/super/admins/stats').then(r => r.data),

  // Settings
  getRegisterFee: () => api.get('/super/admins/settings/register-fee').then(r => r.data),
  updateRegisterFee: (plans) => api.put('/super/admins/settings/register-fee', plans).then(r => r.data),

  // Single operations
  getAll: () => api.get('/super/admins').then(r => r.data),
  getOne: (id) => api.get(`/super/admins/${id}`).then(r => r.data),
  create: (body) => api.post('/super/admins', body).then(r => r.data),
  update: (id, body) => api.put(`/super/admins/${id}`, body).then(r => r.data),
  delete: (id) => api.delete(`/super/admins/${id}`),
  updateStatus: (id, status) => api.patch(`/super/admins/${id}/status`, { status }),
  resetPassword: (id, password) => api.patch(`/super/admins/${id}/reset-password`, { password }),

  // Bulk operations
  bulkDelete: (ids) => api.post('/super/admins/bulk/delete', { ids }),
  bulkStatus: (ids, status) => api.post('/super/admins/bulk/status', { ids, status }),
  bulkResetPassword: (ids, password) => api.post('/super/admins/bulk/reset-password', { ids, password }),

  // Payment info
  getPaymentInfo: () => api.get('/super/admins/settings/payment-info').then(r => r.data),
  updatePaymentInfo: (body) => api.put('/super/admins/settings/payment-info', body).then(r => r.data),

  // Registration Approvals
  getRegistrationRequests: (status) => api.get('/super/admins/registration-requests', { params: { status } }).then(r => r.data),
  getRegistrationStats: () => api.get('/super/admins/registration-requests/stats').then(r => r.data),
  approveRegistration: (id) => api.post(`/super/admins/registration-requests/${id}/approve`).then(r => r.data),
  rejectRegistration: (id, reason) => api.post(`/super/admins/registration-requests/${id}/reject`, { reason }).then(r => r.data),
}
