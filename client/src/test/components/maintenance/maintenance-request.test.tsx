import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../test-utils'
import AddMaintenanceRequest from '@/pages/maintenance/add'

// Mock react query
const mockUseMutation = vi.fn()
const mockUseQuery = vi.fn()
vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: any) => mockUseQuery(options),
  useMutation: (options: any) => mockUseMutation(options),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock wouter
vi.mock('wouter', () => ({
  useLocation: () => ['/maintenance/add', vi.fn()],
}))

// Mock auth
vi.mock('@/hooks/use-simple-auth', () => ({
  useAuth: () => ({
    user: { id: 1, role: 'tenant', username: 'testuser' },
    isAuthenticated: true,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

describe('Maintenance Request Component', () => {
  const user = userEvent.setup()
  const mockProperties = [
    { id: 1, name: 'Test Property 1' },
    { id: 2, name: 'Test Property 2' }
  ]

  const mockMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseQuery.mockReturnValue({
      data: mockProperties,
      isLoading: false,
      error: null
    })
    mockUseMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null
    })
  })

  it('renders maintenance request form correctly', async () => {
    render(<AddMaintenanceRequest />)

    await waitFor(() => {
      expect(screen.getByText('Submit Maintenance Request')).toBeInTheDocument()
      expect(screen.getByLabelText(/property/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
    })
  })

  it('validates required fields', async () => {
    render(<AddMaintenanceRequest />)

    const submitButton = screen.getByRole('button', { name: /submit request/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument()
      expect(screen.getByText(/description is required/i)).toBeInTheDocument()
    })
  })

  it('submits maintenance request with valid data', async () => {
    render(<AddMaintenanceRequest />)

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/title/i), 'Leaking faucet')
    await user.type(screen.getByLabelText(/description/i), 'The kitchen faucet is leaking and needs repair')
    
    const submitButton = screen.getByRole('button', { name: /submit request/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Leaking faucet',
          description: 'The kitchen faucet is leaking and needs repair',
          priority: 'medium'
        })
      )
    })
  })

  it('allows selection of priority levels', async () => {
    render(<AddMaintenanceRequest />)

    const prioritySelect = screen.getByLabelText(/priority/i)
    expect(prioritySelect).toBeInTheDocument()

    // Check that priority options are available
    await user.click(prioritySelect)
    await waitFor(() => {
      expect(screen.getByText('Low')).toBeInTheDocument()
      expect(screen.getByText('Medium')).toBeInTheDocument()
      expect(screen.getByText('High')).toBeInTheDocument()
      expect(screen.getByText('Emergency')).toBeInTheDocument()
    })
  })
})