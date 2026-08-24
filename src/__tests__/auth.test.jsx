// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Login from '../pages/Login'
import ProtectedRoute from '../components/ProtectedRoute'

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('super-admin authentication', () => {
  it('shows the API error for invalid credentials', async () => {
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url.endsWith('/health')) return Promise.resolve(new Response('{}', { status: 200 }))
      return Promise.resolve(new Response(JSON.stringify({ message: 'Invalid phone or password' }), {
        status: 401, headers: { 'content-type': 'application/json' },
      }))
    })

    render(<MemoryRouter><Login /></MemoryRouter>)
    fireEvent.change(screen.getByLabelText('Username or Phone'), { target: { value: 'wrong' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong-password' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In as Super Admin' }))

    expect(await screen.findByText('Invalid phone or password')).toBeVisible()
  })

  it('does not allow a stale auth flag without both tokens', () => {
    localStorage.setItem('sa_auth', 'true')
    render(<MemoryRouter initialEntries={['/protected']}><ProtectedRoute><div>private content</div></ProtectedRoute></MemoryRouter>)
    expect(screen.queryByText('private content')).not.toBeInTheDocument()
  })

  it('allows a session with both tokens', () => {
    localStorage.setItem('sa_auth', 'true')
    localStorage.setItem('sa_access_token', 'access')
    localStorage.setItem('sa_refresh_token', 'refresh')
    render(<MemoryRouter><ProtectedRoute><div>private content</div></ProtectedRoute></MemoryRouter>)
    expect(screen.getByText('private content')).toBeInTheDocument()
  })
})
