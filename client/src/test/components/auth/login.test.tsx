import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../test-utils'
import Login from '@/pages/login'

// Mock the wouter hook
vi.mock('wouter', () => ({
  useLocation: () => ['/login', vi.fn()],
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock the auth hook
const mockLogin = vi.fn()
vi.mock('@/hooks/use-simple-auth', () => ({
  useAuth: () => ({
    login: mockLogin,
    isLoading: false,
    isAuthenticated: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

describe('Login Component', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form correctly', () => {
    render(<Login />)
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByText('Sign in to your PropertyPro account')).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    render(<Login />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument()
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    })
  })

  it('submits form with valid credentials', async () => {
    mockLogin.mockResolvedValue({ success: true })
    render(<Login />)
    
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      })
    })
  })

  it('displays link to registration page', () => {
    render(<Login />)
    
    const registerLink = screen.getByText(/create an account/i)
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register')
  })
})