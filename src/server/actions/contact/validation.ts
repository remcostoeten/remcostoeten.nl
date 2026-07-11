import { z } from 'zod'

export const contactSubmissionSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.string().email('Invalid email address'),
	subject: z.string().optional(),
	message: z.string().min(10, 'Message must be at least 10 characters'),
	_gotcha: z.string().optional()
})

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>

function readField(formData: FormData, field: string) {
	const value = formData.get(field)
	return typeof value === 'string' ? value : undefined
}

export function parseContactFormData(formData: FormData) {
	return {
		name: readField(formData, 'name'),
		email: readField(formData, 'email'),
		subject: readField(formData, 'subject'),
		message: readField(formData, 'message'),
		_gotcha: readField(formData, '_gotcha')
	}
}
