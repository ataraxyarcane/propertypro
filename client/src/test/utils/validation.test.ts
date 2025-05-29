import { describe, it, expect } from 'vitest'
import { insertUserSchema, insertPropertySchema, insertLeaseApplicationSchema } from '@shared/schema'

describe('Schema Validation', () => {
  describe('User Schema', () => {
    it('validates valid user data', () => {
      const validUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'tenant'
      }

      const result = insertUserSchema.safeParse(validUser)
      expect(result.success).toBe(true)
    })

    it('rejects invalid email format', () => {
      const invalidUser = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
        role: 'tenant'
      }

      const result = insertUserSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email')
      }
    })

    it('requires username and email', () => {
      const incompleteUser = {
        password: 'password123',
        role: 'tenant'
      }

      const result = insertUserSchema.safeParse(incompleteUser)
      expect(result.success).toBe(false)
      if (!result.success) {
        const paths = result.error.issues.map(issue => issue.path[0])
        expect(paths).toContain('username')
        expect(paths).toContain('email')
      }
    })
  })

  describe('Property Schema', () => {
    it('validates valid property data', () => {
      const validProperty = {
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

      const result = insertPropertySchema.safeParse(validProperty)
      expect(result.success).toBe(true)
    })

    it('validates property type enum', () => {
      const validTypes = ['apartment', 'house', 'condo', 'townhouse', 'detached', 'semi-detached']
      
      validTypes.forEach(type => {
        const property = {
          ownerId: 1,
          name: 'Test Property',
          address: '123 Test Street',
          city: 'Dublin',
          state: 'Leinster',
          zipCode: 'D01 ABC1',
          propertyType: type,
          price: 2000
        }

        const result = insertPropertySchema.safeParse(property)
        expect(result.success).toBe(true)
      })
    })

    it('rejects invalid property type', () => {
      const invalidProperty = {
        ownerId: 1,
        name: 'Test Property',
        address: '123 Test Street',
        city: 'Dublin',
        state: 'Leinster',
        zipCode: 'D01 ABC1',
        propertyType: 'invalid-type',
        price: 2000
      }

      const result = insertPropertySchema.safeParse(invalidProperty)
      expect(result.success).toBe(false)
    })

    it('requires essential fields', () => {
      const incompleteProperty = {
        ownerId: 1,
        name: 'Test Property'
      }

      const result = insertPropertySchema.safeParse(incompleteProperty)
      expect(result.success).toBe(false)
      if (!result.success) {
        const paths = result.error.issues.map(issue => issue.path[0])
        expect(paths).toContain('address')
        expect(paths).toContain('city')
        expect(paths).toContain('propertyType')
        expect(paths).toContain('price')
      }
    })
  })

  describe('Lease Application Schema', () => {
    it('validates complete lease application', () => {
      const validApplication = {
        propertyId: 1,
        applicantId: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+353 1 234 5678',
        dateOfBirth: '1990-01-01',
        employmentStatus: 'employed',
        monthlyIncome: 5000,
        emergencyContact: 'Jane Doe',
        emergencyContactPhone: '+353 1 987 6543',
        desiredMoveInDate: '2024-02-01',
        leaseDuration: 12
      }

      const result = insertLeaseApplicationSchema.safeParse(validApplication)
      expect(result.success).toBe(true)
    })

    it('validates email format in application', () => {
      const invalidApplication = {
        propertyId: 1,
        applicantId: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        phone: '+353 1 234 5678',
        dateOfBirth: '1990-01-01',
        employmentStatus: 'employed',
        monthlyIncome: 5000,
        emergencyContact: 'Jane Doe',
        emergencyContactPhone: '+353 1 987 6543',
        desiredMoveInDate: '2024-02-01',
        leaseDuration: 12
      }

      const result = insertLeaseApplicationSchema.safeParse(invalidApplication)
      expect(result.success).toBe(false)
    })

    it('requires all essential application fields', () => {
      const incompleteApplication = {
        propertyId: 1,
        applicantId: 1,
        firstName: 'John'
      }

      const result = insertLeaseApplicationSchema.safeParse(incompleteApplication)
      expect(result.success).toBe(false)
      if (!result.success) {
        const paths = result.error.issues.map(issue => issue.path[0])
        expect(paths).toContain('lastName')
        expect(paths).toContain('email')
        expect(paths).toContain('monthlyIncome')
        expect(paths).toContain('emergencyContact')
      }
    })

    it('validates numeric fields correctly', () => {
      const applicationWithInvalidNumbers = {
        propertyId: 1,
        applicantId: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+353 1 234 5678',
        dateOfBirth: '1990-01-01',
        employmentStatus: 'employed',
        monthlyIncome: -1000, // Invalid negative income
        emergencyContact: 'Jane Doe',
        emergencyContactPhone: '+353 1 987 6543',
        desiredMoveInDate: '2024-02-01',
        leaseDuration: 0 // Invalid zero duration
      }

      const result = insertLeaseApplicationSchema.safeParse(applicationWithInvalidNumbers)
      expect(result.success).toBe(false)
    })
  })
})