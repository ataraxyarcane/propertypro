import { describe, it, expect, beforeEach } from 'vitest'
import { MemStorage } from '../storage'
import { InsertUser, InsertProperty, InsertTenant, InsertLease, InsertMaintenanceRequest } from '@shared/schema'

describe('Memory Storage', () => {
  let storage: MemStorage

  beforeEach(() => {
    storage = new MemStorage()
  })

  describe('User Operations', () => {
    it('creates and retrieves a user', async () => {
      const userData: InsertUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        role: 'tenant'
      }

      const createdUser = await storage.createUser(userData)
      
      expect(createdUser.id).toBeDefined()
      expect(createdUser.username).toBe('testuser')
      expect(createdUser.email).toBe('test@example.com')
      expect(createdUser.role).toBe('tenant')

      const retrievedUser = await storage.getUser(createdUser.id)
      expect(retrievedUser).toEqual(createdUser)
    })

    it('finds user by username', async () => {
      const userData: InsertUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'tenant'
      }

      await storage.createUser(userData)
      const foundUser = await storage.getUserByUsername('testuser')
      
      expect(foundUser).toBeDefined()
      expect(foundUser?.username).toBe('testuser')
    })

    it('finds user by email', async () => {
      const userData: InsertUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'tenant'
      }

      await storage.createUser(userData)
      const foundUser = await storage.getUserByEmail('test@example.com')
      
      expect(foundUser).toBeDefined()
      expect(foundUser?.email).toBe('test@example.com')
    })

    it('updates user information', async () => {
      const userData: InsertUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'tenant'
      }

      const user = await storage.createUser(userData)
      const updatedUser = await storage.updateUser(user.id, {
        firstName: 'Updated',
        lastName: 'Name'
      })

      expect(updatedUser?.firstName).toBe('Updated')
      expect(updatedUser?.lastName).toBe('Name')
    })

    it('deletes a user', async () => {
      const userData: InsertUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'tenant'
      }

      const user = await storage.createUser(userData)
      const deleted = await storage.deleteUser(user.id)
      
      expect(deleted).toBe(true)
      
      const retrievedUser = await storage.getUser(user.id)
      expect(retrievedUser).toBeUndefined()
    })
  })

  describe('Property Operations', () => {
    it('creates and retrieves a property', async () => {
      const propertyData: InsertProperty = {
        ownerId: 1,
        name: 'Test Property',
        address: '123 Test Street',
        city: 'Dublin',
        state: 'Leinster',
        zipCode: 'D01 ABC1',
        propertyType: 'apartment',
        price: 2000,
        bedrooms: 2,
        bathrooms: 1,
        squareMeters: 85
      }

      const property = await storage.createProperty(propertyData)
      
      expect(property.id).toBeDefined()
      expect(property.name).toBe('Test Property')
      expect(property.price).toBe(2000)

      const retrievedProperty = await storage.getProperty(property.id)
      expect(retrievedProperty).toEqual(property)
    })

    it('lists all properties', async () => {
      const property1: InsertProperty = {
        ownerId: 1,
        name: 'Property 1',
        address: '123 Test St',
        city: 'Dublin',
        state: 'Leinster',
        zipCode: 'D01 ABC1',
        propertyType: 'apartment',
        price: 2000
      }

      const property2: InsertProperty = {
        ownerId: 1,
        name: 'Property 2',
        address: '456 Test Ave',
        city: 'Cork',
        state: 'Munster',
        zipCode: 'T12 XYZ2',
        propertyType: 'house',
        price: 1500
      }

      await storage.createProperty(property1)
      await storage.createProperty(property2)

      const properties = await storage.getProperties()
      expect(properties).toHaveLength(2)
      expect(properties[0].name).toBe('Property 1')
      expect(properties[1].name).toBe('Property 2')
    })

    it('updates property information', async () => {
      const propertyData: InsertProperty = {
        ownerId: 1,
        name: 'Test Property',
        address: '123 Test Street',
        city: 'Dublin',
        state: 'Leinster',
        zipCode: 'D01 ABC1',
        propertyType: 'apartment',
        price: 2000
      }

      const property = await storage.createProperty(propertyData)
      const updatedProperty = await storage.updateProperty(property.id, {
        price: 2200,
        description: 'Updated description'
      })

      expect(updatedProperty?.price).toBe(2200)
      expect(updatedProperty?.description).toBe('Updated description')
    })
  })

  describe('Tenant Operations', () => {
    it('creates and retrieves a tenant', async () => {
      const tenantData: InsertTenant = {
        userId: 1,
        phone: '+353 1 234 5678',
        emergencyContact: 'Emergency Contact',
        emergencyPhone: '+353 1 987 6543',
        occupation: 'Software Developer',
        monthlyIncome: 5000
      }

      const tenant = await storage.createTenant(tenantData)
      
      expect(tenant.id).toBeDefined()
      expect(tenant.userId).toBe(1)
      expect(tenant.phone).toBe('+353 1 234 5678')

      const retrievedTenant = await storage.getTenant(tenant.id)
      expect(retrievedTenant).toEqual(tenant)
    })

    it('finds tenant by user ID', async () => {
      const tenantData: InsertTenant = {
        userId: 1,
        phone: '+353 1 234 5678'
      }

      await storage.createTenant(tenantData)
      const foundTenant = await storage.getTenantByUserId(1)
      
      expect(foundTenant).toBeDefined()
      expect(foundTenant?.userId).toBe(1)
    })
  })

  describe('Maintenance Request Operations', () => {
    it('creates and retrieves maintenance requests', async () => {
      const requestData: InsertMaintenanceRequest = {
        propertyId: 1,
        tenantId: 1,
        title: 'Leaking Faucet',
        description: 'Kitchen faucet is leaking',
        priority: 'medium'
      }

      const request = await storage.createMaintenanceRequest(requestData)
      
      expect(request.id).toBeDefined()
      expect(request.title).toBe('Leaking Faucet')
      expect(request.priority).toBe('medium')

      const retrievedRequest = await storage.getMaintenanceRequest(request.id)
      expect(retrievedRequest).toEqual(request)
    })

    it('gets maintenance requests for property', async () => {
      const request1: InsertMaintenanceRequest = {
        propertyId: 1,
        tenantId: 1,
        title: 'Request 1',
        description: 'Description 1',
        priority: 'low'
      }

      const request2: InsertMaintenanceRequest = {
        propertyId: 1,
        tenantId: 2,
        title: 'Request 2',
        description: 'Description 2',
        priority: 'high'
      }

      const request3: InsertMaintenanceRequest = {
        propertyId: 2,
        tenantId: 1,
        title: 'Request 3',
        description: 'Description 3',
        priority: 'medium'
      }

      await storage.createMaintenanceRequest(request1)
      await storage.createMaintenanceRequest(request2)
      await storage.createMaintenanceRequest(request3)

      const propertyRequests = await storage.getMaintenanceRequestsForProperty(1)
      expect(propertyRequests).toHaveLength(2)
      expect(propertyRequests[0].title).toBe('Request 1')
      expect(propertyRequests[1].title).toBe('Request 2')
    })
  })

  describe('Dashboard Operations', () => {
    it('returns correct counts for dashboard', async () => {
      // Create test data
      await storage.createUser({
        username: 'user1',
        email: 'user1@example.com',
        password: 'pass',
        role: 'tenant'
      })

      await storage.createProperty({
        ownerId: 1,
        name: 'Property 1',
        address: '123 Test St',
        city: 'Dublin',
        state: 'Leinster',
        zipCode: 'D01 ABC1',
        propertyType: 'apartment',
        price: 2000
      })

      await storage.createTenant({
        userId: 1,
        phone: '+353 1 234 5678'
      })

      await storage.createMaintenanceRequest({
        propertyId: 1,
        tenantId: 1,
        title: 'Test Request',
        description: 'Test Description',
        priority: 'medium'
      })

      const propertyCount = await storage.getPropertyCount()
      const tenantCount = await storage.getTenantCount()
      const maintenanceCount = await storage.getMaintenanceRequestCount()

      expect(propertyCount).toBe(1)
      expect(tenantCount).toBe(1)
      expect(maintenanceCount).toBe(1)
    })
  })
})