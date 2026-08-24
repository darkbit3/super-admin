import { beforeEach, describe, expect, it, vi } from 'vitest'
import { manageApi } from '../api/manageApi'

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('sa_access_token', 'access')
  localStorage.setItem('sa_refresh_token', 'refresh')
  localStorage.setItem('sa_auth', 'true')
  vi.restoreAllMocks()
})

describe('super-admin management API', () => {
  it('sends the admin creation payload to the management endpoint', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({ data: { id: 'admin-1' } }), {
      status: 201, headers: { 'content-type': 'application/json' },
    }))

    await manageApi.create({ name: 'New Admin', phone: '0900000003', password: 'password' })

    expect(fetchSpy).toHaveBeenCalledWith('http://localhost:5000/api/super/admins', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ name: 'New Admin', phone: '0900000003', password: 'password' }),
    }))
  })

  it('sends bulk status updates with the selected IDs and status', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { 'content-type': 'application/json' },
    }))

    await manageApi.bulkStatus(['admin-1', 'admin-2'], 'Inactive')

    expect(fetchSpy).toHaveBeenCalledWith('http://localhost:5000/api/super/admins/bulk/status', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ ids: ['admin-1', 'admin-2'], status: 'Inactive' }),
    }))
  })
})
