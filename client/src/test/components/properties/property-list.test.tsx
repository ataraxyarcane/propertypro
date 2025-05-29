import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { render } from '../../test-utils'
import Properties from '@/pages/properties/index'

// Mock the query hook
const mockUseQuery = vi.fn()
vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: any) => mockUseQuery(options),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock wouter
vi.mock('wouter', () => ({
  useLocation: () => ['/properties', vi.fn()],
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock auth hook
vi.mock('@/hooks/use-simple-auth', () => ({
  useAuth: () => ({
    user: { id: 1, role: 'tenant', username: 'testuser' },
    isAuthenticated: true,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

describe('Properties Component', () => {
  const mockProperties = [
    {
      id: 1,
      name: 'Modern Dublin Apartment',
      address: '123 Temple Bar',
      city: 'Dublin',
      price: 2500,
      bedrooms: 2,
      bathrooms: 1,
      squareMeters: 85,
      propertyType: 'apartment',
      status: 'available',
      images: ['image1.jpg']
    },
    {
      id: 2,
      name: 'Cork City House',
      address: '456 Patrick Street',
      city: 'Cork',
      price: 1800,
      bedrooms: 3,
      bathrooms: 2,
      squareMeters: 120,
      propertyType: 'house',
      status: 'available',
      images: ['image2.jpg']
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders properties list when data is loaded', async () => {
    mockUseQuery.mockReturnValue({
      data: mockProperties,
      isLoading: false,
      error: null
    })

    render(<Properties />)

    await waitFor(() => {
      expect(screen.getByText('Modern Dublin Apartment')).toBeInTheDocument()
      expect(screen.getByText('Cork City House')).toBeInTheDocument()
      expect(screen.getByText('€2,500')).toBeInTheDocument()
      expect(screen.getByText('€1,800')).toBeInTheDocument()
    })
  })

  it('shows loading state while fetching properties', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: true,
      error: null
    })

    render(<Properties />)

    expect(screen.getByText('Loading properties...')).toBeInTheDocument()
  })

  it('displays error message when fetch fails', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to fetch properties')
    })

    render(<Properties />)

    expect(screen.getByText('Failed to load properties')).toBeInTheDocument()
  })

  it('shows empty state when no properties available', () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    })

    render(<Properties />)

    expect(screen.getByText('No properties found')).toBeInTheDocument()
  })

  it('displays property details correctly', async () => {
    mockUseQuery.mockReturnValue({
      data: mockProperties,
      isLoading: false,
      error: null
    })

    render(<Properties />)

    await waitFor(() => {
      // Check for property details
      expect(screen.getByText('2 bedrooms')).toBeInTheDocument()
      expect(screen.getByText('1 bathroom')).toBeInTheDocument()
      expect(screen.getByText('85 m²')).toBeInTheDocument()
      expect(screen.getByText('3 bedrooms')).toBeInTheDocument()
      expect(screen.getByText('2 bathrooms')).toBeInTheDocument()
      expect(screen.getByText('120 m²')).toBeInTheDocument()
    })
  })
})