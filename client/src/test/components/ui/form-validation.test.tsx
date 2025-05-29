import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../test-utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Test schema
const testSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  income: z.number().min(1000, 'Income must be at least €1,000'),
})

// Test component
function TestForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const form = useForm({
    resolver: zodResolver(testSchema),
    defaultValues: {
      email: '',
      phone: '',
      income: 0,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="income"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Income</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}

describe('Form Validation', () => {
  const user = userEvent.setup()

  it('validates email format correctly', async () => {
    const mockSubmit = vi.fn()
    render(<TestForm onSubmit={mockSubmit} />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /submit/i })

    // Enter invalid email
    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument()
    })

    expect(mockSubmit).not.toHaveBeenCalled()
  })

  it('validates phone number length', async () => {
    const mockSubmit = vi.fn()
    render(<TestForm onSubmit={mockSubmit} />)

    const phoneInput = screen.getByLabelText(/phone/i)
    const submitButton = screen.getByRole('button', { name: /submit/i })

    // Enter short phone number
    await user.type(phoneInput, '123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Phone number must be at least 10 characters')).toBeInTheDocument()
    })

    expect(mockSubmit).not.toHaveBeenCalled()
  })

  it('submits form with valid data', async () => {
    const mockSubmit = vi.fn()
    render(<TestForm onSubmit={mockSubmit} />)

    const emailInput = screen.getByLabelText(/email/i)
    const phoneInput = screen.getByLabelText(/phone/i)
    const incomeInput = screen.getByLabelText(/monthly income/i)
    const submitButton = screen.getByRole('button', { name: /submit/i })

    // Enter valid data
    await user.type(emailInput, 'test@example.com')
    await user.type(phoneInput, '+353 1 234 5678')
    await user.type(incomeInput, '3000')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        phone: '+353 1 234 5678',
        income: 3000
      })
    })
  })
})