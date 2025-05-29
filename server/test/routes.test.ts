import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import { registerRoutes } from '../routes'
import { storage } from '../storage'

// Mock the storage
vi.mock('../storage', () => ({
  storage: {
    getUserByUsername: vi.fn(),
    createUser: vi.fn(),
    getUser: vi.fn(),
    getProperties: vi.fn(),
    createProperty: vi.fn(),
    getProperty: vi.fn(),
    updateProperty: vi.fn(),
    deleteProperty: vi.fn(),
    createMaintenanceRequest: vi.fn(),
    getMaintenanceRequests: vi.fn(),
    createLeaseApplication: vi.fn(),
    getLeaseApplications: vi.fn(),
  }
}))

// Mock bcrypt
vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  }
}))

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  }
}))

describe('API Routes', () => {
  let app: express.Application
  let server: any

  beforeEach(async () => {
    app = express()
    app.use(express.json())
    server = await registerRoutes(app)
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (server) {
      server.close()
    }
  })

  describe('Authentication Routes', () => {
    it('POST /api/auth/register creates new user successfully', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'tenant',
        firstName: 'Test',
        lastName: 'User'
      }

      vi.mocked(storage.getUserByUsername).mockResolvedValue(undefined)
      vi.mocked(storage.createUser).mockResolvedValue(mockUser as any)
      
      const bcrypt = await import('bcrypt')
      vi.mocked(bcrypt.default.hash).mockResolvedValue('hashedpassword' as any)

      const jwt = await import('jsonwebtoken')
      vi.mocked(jwt.default.sign).mockReturnValue('mock-token' as any)

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          role: 'tenant'
        })

      expect(response.status).toBe(201)
      expect(response.body.user).toEqual(expect.objectContaining({
        username: 'testuser',
        email: 'test@example.com'
      }))
      expect(response.body.token).toBe('mock-token')
    })

    it('POST /api/auth/register returns error for duplicate username', async () => {
      const existingUser = { id: 1, username: 'testuser' }
      vi.mocked(storage.getUserByUsername).mockResolvedValue(existingUser as any)

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          role: 'tenant'
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toBe('Username already exists')
    })

    it('POST /api/auth/login authenticates user successfully', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        role: 'tenant'
      }

      vi.mocked(storage.getUserByUsername).mockResolvedValue(mockUser as any)
      
      const bcrypt = await import('bcrypt')
      vi.mocked(bcrypt.default.compare).mockResolvedValue(true as any)

      const jwt = await import('jsonwebtoken')
      vi.mocked(jwt.default.sign).mockReturnValue('mock-token' as any)

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        })

      expect(response.status).toBe(200)
      expect(response.body.token).toBe('mock-token')
    })

    it('POST /api/auth/login returns error for invalid credentials', async () => {
      vi.mocked(storage.getUserByUsername).mockResolvedValue(undefined)

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123'
        })

      expect(response.status).toBe(401)
      expect(response.body.message).toBe('Invalid credentials')
    })
  })

  describe('Property Routes', () => {
    it('GET /api/properties returns all properties', async () => {
      const mockProperties = [
        {
          id: 1,
          name: 'Test Property 1',
          address: '123 Test St',
          city: 'Dublin',
          price: 2000,
          bedrooms: 2,
          bathrooms: 1
        },
        {
          id: 2,
          name: 'Test Property 2',
          address: '456 Test Ave',
          city: 'Cork',
          price: 1500,
          bedrooms: 1,
          bathrooms: 1
        }
      ]

      vi.mocked(storage.getProperties).mockResolvedValue(mockProperties as any)

      const response = await request(app)
        .get('/api/properties')

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockProperties)
    })

    it('GET /api/properties/:id returns specific property', async () => {
      const mockProperty = {
        id: 1,
        name: 'Test Property',
        address: '123 Test St',
        city: 'Dublin',
        price: 2000
      }

      vi.mocked(storage.getProperty).mockResolvedValue(mockProperty as any)

      const response = await request(app)
        .get('/api/properties/1')

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockProperty)
    })

    it('GET /api/properties/:id returns 404 for non-existent property', async () => {
      vi.mocked(storage.getProperty).mockResolvedValue(undefined)

      const response = await request(app)
        .get('/api/properties/999')

      expect(response.status).toBe(404)
      expect(response.body.message).toBe('Property not found')
    })
  })

  describe('Maintenance Request Routes', () => {
    it('GET /api/maintenance returns all maintenance requests', async () => {
      const mockRequests = [
        {
          id: 1,
          title: 'Leaking Faucet',
          description: 'Kitchen faucet is leaking',
          status: 'pending',
          priority: 'medium'
        }
      ]

      vi.mocked(storage.getMaintenanceRequests).mockResolvedValue(mockRequests as any)

      const response = await request(app)
        .get('/api/maintenance')

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockRequests)
    })
  })

  describe('Lease Application Routes', () => {
    it('GET /api/lease-applications returns all applications', async () => {
      const mockApplications = [
        {
          id: 1,
          propertyId: 1,
          applicantId: 1,
          firstName: 'John',
          lastName: 'Doe',
          status: 'pending'
        }
      ]

      vi.mocked(storage.getLeaseApplications).mockResolvedValue(mockApplications as any)

      const response = await request(app)
        .get('/api/lease-applications')

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockApplications)
    })
  })
})