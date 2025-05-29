import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { render } from '../../test-utils'
import AdminDashboard from '@/pages/admin/dashboard'

// Mock react query
const mockUseQuery = vi.fn()
vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: any) => mockUseQuery(options),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock auth
vi.mock('@/hooks/use-simple-auth', () => ({
  useAuth: () => ({
    user: { id: 1, role: 'admin', username: 'admin' },
    isAuthenticated: true,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

describe('Admin Dashboard Component', () => {
  const mockDashboardData = {
    propertyCount: 25,
    tenantCount: 18,
    activeLeaseCount: 15,
    maintenanceRequestCount: 7,
    recentUsers: [
      { id: 1, username: 'user1', email: 'user1@example.com', role: 'tenant', createdAt: '2024-01-15' },
      { id: 2, username: 'user2', email: 'user2@example.com', role: 'owner', createdAt: '2024-01-14' }
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders dashboard with statistics cards', async () => {
    mockUseQuery.mockImplementation(({ queryKey }: any) => {
      if (queryKey[0] === '/api/admin/dashboard') {
        return {
          data: mockDashboardData,
          isLoading: false,
          error: null
        }
      }
      return { data: null, isLoading: false, error: null }
    })

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
      expect(screen.getByText('25')).toBeInTheDocument() // Property count
      expect(screen.getByText('18')).toBeInTheDocument() // Tenant count
      expect(screen.getByText('15')).toBeInTheDocument() // Active lease count
      expect(screen.getByText('7')).toBeInTheDocument() // Maintenance request count
    })
  })

  it('displays recent users section', async () => {
    mockUseQuery.mockImplementation(({ queryKey }: any) => {
      if (queryKey[0] === '/api/admin/dashboard') {
        return {
          data: mockDashboardData,
          isLoading: false,
          error: null
        }
      }
      return { data: null, isLoading: false, error: null }
    })

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Recent Users')).toBeInTheDocument()
      expect(screen.getByText('user1')).toBeInTheDocument()
      expect(screen.getByText('user2')).toBeInTheDocument()
      expect(screen.getByText('tenant')).toBeInTheDocument()
      expect(screen.getByText('owner')).toBeInTheDocument()
    })
  })

  it('shows loading state while fetching data', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: true,
      error: null
    })

    render(<AdminDashboard />)

    expect(screen.getByText('Loading dashboard data...')).toBeInTheDocument()
  })

  it('displays error message when fetch fails', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to fetch dashboard data')
    })

    render(<AdminDashboard />)

    expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument()
  })

  it('renders navigation links to admin sections', async () => {
    mockUseQuery.mockImplementation(({ queryKey }: any) => {
      if (queryKey[0] === '/api/admin/dashboard') {
        return {
          data: mockDashboardData,
          isLoading: false,
          error: null
        }
      }
      return { data: null, isLoading: false, error: null }
    })

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Manage Users')).toBeInTheDocument()
      expect(screen.getByText('View Analytics')).toBeInTheDocument()
      expect(screen.getByText('System Settings')).toBeInTheDocument()
    })
  })
})