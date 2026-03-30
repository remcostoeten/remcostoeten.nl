import { z } from 'zod'

export const contactSubmissionSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.string().email('Invalid email address'),
	subject: z.string().optional(),
	message: z.string().min(10, 'Message must be at least 10 characters'),
	_gotcha: z.string().optional()
})

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>

export function parseContactFormData(formData: FormData) {
	return {
		name: formData.get('name'),
		email: formData.get('email'),
		subject: formData.get('subject'),
		message: formData.get('message'),
		_gotcha: formData.get('_gotcha')
	} as ContactSubmissionInput
}
