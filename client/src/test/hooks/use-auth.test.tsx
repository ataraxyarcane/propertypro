import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth, AuthProvider } from '@/hooks/use-simple-auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useAuth Hook', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    
    // Clear localStorage
    localStorage.clear()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )

  it('initializes with unauthenticated state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.isLoading).toBe(true)
  })

  it('handles successful login', async () => {
    const mockUser = { id: 1, username: 'testuser', role: 'tenant' }
    const mockToken = 'mock-jwt-token'

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser, token: mockToken }),
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const loginResult = await result.current.login({
      username: 'testuser',
      password: 'password123'
    })

    expect(loginResult.success).toBe(true)
    expect(localStorage.getItem('token')).toBe(mockToken)
  })

  it('handles login failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' }),
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const loginResult = await result.current.login({
      username: 'testuser',
      password: 'wrongpassword'
    })

    expect(loginResult.success).toBe(false)
    expect(loginResult.message).toBe('Invalid credentials')
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('handles successful registration', async () => {
    const mockUser = { id: 1, username: 'newuser', role: 'tenant' }
    const mockToken = 'mock-jwt-token'

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser, token: mockToken }),
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const registerResult = await result.current.register({
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123',
      role: 'tenant'
    })

    expect(registerResult.success).toBe(true)
    expect(localStorage.getItem('token')).toBe(mockToken)
  })

  it('clears authentication state on logout', async () => {
    // Set up initial authenticated state
    localStorage.setItem('token', 'mock-token')
    
    const { result } = renderHook(() => useAuth(), { wrapper })

    result.current.logout()

    expect(localStorage.getItem('token')).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('restores authentication from localStorage', async () => {
    const mockUser = { id: 1, username: 'testuser', role: 'tenant' }
    localStorage.setItem('token', 'existing-token')

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isLoading).toBe(false)
    })
  })
})