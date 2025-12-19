'use server'

import { db } from 'db'
import { blogPosts } from 'schema'

export async function countPosts() {
    const result = await db.select().from(blogPosts)
    return result.length
}
