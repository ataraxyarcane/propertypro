import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../test-utils'
import ApplyForProperty from '@/pages/applications/apply'

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
  useParams: () => ({ id: '1' }),
  useLocation: () => ['/applications/apply/1', vi.fn()],
}))

// Mock auth
vi.mock('@/hooks/use-simple-auth', () => ({
  useAuth: () => ({
    user: { id: 1, role: 'tenant', username: 'testuser' },
    isAuthenticated: true,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

describe('Lease Application Component', () => {
  const user = userEvent.setup()
  const mockProperty = {
    id: 1,
    name: 'Test Property',
    address: '123 Test Street',
    city: 'Dublin',
    price: 2000,
    bedrooms: 2,
    bathrooms: 1
  }

  const mockMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseQuery.mockReturnValue({
      data: mockProperty,
      isLoading: false,
      error: null
    })
    mockUseMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null
    })
  })

  it('renders application form with all required fields', async () => {
    render(<ApplyForProperty />)

    await waitFor(() => {
      expect(screen.getByText('Apply for Test Property')).toBeInTheDocument()
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/monthly income/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/employment status/i)).toBeInTheDocument()
    })
  })

  it('validates required fields before submission', async () => {
    render(<ApplyForProperty />)

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /submit application/i })
      expect(submitButton).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: /submit application/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })
  })

  it('submits application with valid data', async () => {
    render(<ApplyForProperty />)

    await waitFor(() => {
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    })

    // Fill out the form
    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/email/i), 'john.doe@example.com')
    await user.type(screen.getByLabelText(/phone/i), '+353 1 234 5678')
    await user.type(screen.getByLabelText(/date of birth/i), '1990-01-01')
    await user.type(screen.getByLabelText(/monthly income/i), '5000')
    await user.type(screen.getByLabelText(/emergency contact/i), 'Jane Doe')
    await user.type(screen.getByLabelText(/emergency contact phone/i), '+353 1 987 6543')
    await user.type(screen.getByLabelText(/desired move-in date/i), '2024-02-01')
    await user.type(screen.getByLabelText(/lease duration/i), '12')

    const submitButton = screen.getByRole('button', { name: /submit application/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          propertyId: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+353 1 234 5678',
          monthlyIncome: 5000
        })
      )
    })
  })

  it('displays property information correctly', async () => {
    render(<ApplyForProperty />)

    await waitFor(() => {
      expect(screen.getByText('Test Property')).toBeInTheDocument()
      expect(screen.getByText('123 Test Street, Dublin')).toBeInTheDocument()
      expect(screen.getByText('€2,000/month')).toBeInTheDocument()
      expect(screen.getByText('2 bed, 1 bath')).toBeInTheDocument()
    })
  })
})