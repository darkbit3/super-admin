import { api } from './client'

export const manageApi = {
  // Stats
  getStats:      ()             => api.get('/super/admins/stats').then(r => r.data),

  // Single operations
  getAll:        ()             => api.get('/super/admins').then(r => r.data),
  getOne:        (id)           => api.get(`/super/admins/${id}`).then(r => r.data),
  create:        (body)         => api.post('/super/admins', body).then(r => r.data),
  update:        (id, body)     => api.put(`/super/admins/${id}`, body).then(r => r.data),
  delete:        (id)           => api.delete(`/super/admins/${id}`),
  updateStatus:  (id, status)   => api.patch(`/super/admins/${id}/status`, { status }),
  resetPassword: (id, password) => api.patch(`/super/admins/${id}/reset-password`, { password }),

  // Bulk operations
  bulkDelete:        (ids)           => api.post('/super/admins/bulk/delete',         { ids }),
  bulkStatus:        (ids, status)   => api.post('/super/admins/bulk/status',         { ids, status }),
  bulkResetPassword: (ids, password) => api.post('/super/admins/bulk/reset-password', { ids, password }),
}
