import { api, setTokens, clearTokens } from './client'

export const authApi = {
  async login(phone, password) {
    const res = await api.post('/super-auth/login', { phone, password }, { refreshOnUnauthorized: false })
    if (!res?.data?.accessToken) {
      throw new Error('Invalid response from server. Please try again.')
    }
    setTokens(res.data.accessToken, res.data.refreshToken)
    localStorage.setItem('sa_auth', 'true')
    return res.data.admin
  },

  async logout() {
    const refreshToken = localStorage.getItem('sa_refresh_token')
    try {
      await api.post('/super-auth/logout', { refreshToken })
    } finally {
      clearTokens()
    }
  },

  async getMe() {
    const data = await api.get('/super-auth/me')
    return data.data
  },

  async changePassword(currentPassword, newPassword) {
    return api.put('/super-auth/change-password', { currentPassword, newPassword })
  },
}
