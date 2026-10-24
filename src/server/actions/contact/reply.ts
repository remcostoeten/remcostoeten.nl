'use server'

import { revalidatePath } from 'next/cache'
import { env } from '@/server/env'
import { sendGmailMessage } from '@/server/gmail/api'
import { resolveGmailConnection } from '@/server/gmail/connection'
import {
	resolveUncertainReply,
	sendContactReply,
	type ReplyDeps
} from '@/server/gmail/reply-service'
import { replyStore } from '@/server/gmail/reply-store'
import { getAdminSessionUser } from '@/utils/is-admin'

function buildDeps(): ReplyDeps {
	return {
		store: replyStore,
		getAdminId: async () => (await getAdminSessionUser())?.id ?? null,
		getConnection: resolveGmailConnection,
		send: sendGmailMessage,
		now: () => new Date(),
		newId: () => crypto.randomUUID(),
		messageIdDomain: new URL(env.BETTER_AUTH_URL).hostname
	}
}

/**
 * @name sendReply
 * @description Sends an admin reply to a contact submission from the linked
 * Gmail account. The recipient is read from the database, the sender is the
 * linked Gmail address, and a real admin session is required.
 *
 * @example
 * const result = await sendReply(message.id, key, 'Thanks for reaching out.')
 */
export async function sendReply(
	submissionId: string,
	idempotencyKey: string,
	body: string
) {
	const result = await sendContactReply(buildDeps(), {
		submissionId,
		idempotencyKey,
		body
	})

	if (result.status === 'sent' || result.status === 'uncertain') {
		revalidatePath('/admin', 'layout')
	}

	return result
}

/**
 * @name resolveReply
 * @description Settles a reply whose delivery was unconfirmed, after the admin
 * has checked the Gmail Sent folder.
 *
 * @example
 * await resolveReply(reply.id, 'sent')
 */
export async function resolveReply(
	replyId: string,
	outcome: 'sent' | 'failed'
) {
	const result = await resolveUncertainReply(
		buildDeps(),
		replyId,
		outcome === 'sent' ? 'sent' : 'failed'
	)

	if (result.status === 'resolved') revalidatePath('/admin', 'layout')
	return result
}
