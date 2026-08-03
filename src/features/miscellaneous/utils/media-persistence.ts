'use client'

import type { TTrimRange } from '../types/media'

const DB_NAME = 'media-tools'
const STORE_NAME = 'sessions'
const DB_VERSION = 1
const MAX_PERSISTED_INPUT_BYTES = 150 * 1024 * 1024

export type TPersistedOutput = {
	blob: Blob
	name: string
	mime: string
}

export type TPersistedSession = {
	file: File | null
	trim: TTrimRange | null
	output: TPersistedOutput | null
}

function inputKey(toolKey: string): string {
	return `${toolKey}:input`
}

function trimKey(toolKey: string): string {
	return `${toolKey}:trim`
}

function outputKey(toolKey: string): string {
	return `${toolKey}:output`
}

function supportsIndexedDB(): boolean {
	return typeof window !== 'undefined' && 'indexedDB' in window
}

function openDatabase(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = window.indexedDB.open(DB_NAME, DB_VERSION)
		request.onupgradeneeded = () => {
			if (!request.result.objectStoreNames.contains(STORE_NAME)) {
				request.result.createObjectStore(STORE_NAME)
			}
		}
		request.onsuccess = () => resolve(request.result)
		request.onerror = () => reject(request.error)
	})
}

async function readKey<T>(key: string): Promise<T | undefined> {
	const db = await openDatabase()
	try {
		return await new Promise<T | undefined>((resolve, reject) => {
			const request = db
				.transaction(STORE_NAME)
				.objectStore(STORE_NAME)
				.get(key)
			request.onsuccess = () => resolve(request.result as T | undefined)
			request.onerror = () => reject(request.error)
		})
	} finally {
		db.close()
	}
}

async function mutateKeys(
	deletes: string[],
	writes: Array<[string, unknown]>
): Promise<void> {
	const db = await openDatabase()
	try {
		await new Promise<void>((resolve, reject) => {
			const transaction = db.transaction(STORE_NAME, 'readwrite')
			const store = transaction.objectStore(STORE_NAME)
			for (const key of deletes) store.delete(key)
			for (const [key, value] of writes) store.put(value, key)
			transaction.oncomplete = () => resolve()
			transaction.onerror = () => reject(transaction.error)
			transaction.onabort = () => reject(transaction.error)
		})
	} finally {
		db.close()
	}
}

/**
 * Loads a tool's persisted media session (input file, trim range, output)
 * from IndexedDB. Missing pieces come back as null.
 */
export async function loadMediaSession(
	toolKey: string
): Promise<TPersistedSession> {
	if (!supportsIndexedDB()) return { file: null, trim: null, output: null }
	const [file, trim, output] = await Promise.all([
		readKey<File>(inputKey(toolKey)),
		readKey<TTrimRange>(trimKey(toolKey)),
		readKey<TPersistedOutput>(outputKey(toolKey))
	])
	return { file: file ?? null, trim: trim ?? null, output: output ?? null }
}

/**
 * Persists a newly selected input file. Passing a file resets the stored trim
 * and output (they belong to the previous file); passing null clears the
 * whole session. Files above the persistence size cap clear the session
 * instead of being stored, so a stale trim/output never outlives its file.
 */
export async function saveMediaFile(
	toolKey: string,
	file: File | null
): Promise<void> {
	if (!supportsIndexedDB()) return
	if (!file || file.size > MAX_PERSISTED_INPUT_BYTES) {
		await clearMediaSession(toolKey)
		return
	}
	await mutateKeys(
		[trimKey(toolKey), outputKey(toolKey)],
		[[inputKey(toolKey), file]]
	)
}

/** Persists the current trim range, or clears it when null. */
export async function saveMediaTrim(
	toolKey: string,
	trim: TTrimRange | null
): Promise<void> {
	if (!supportsIndexedDB()) return
	if (!trim) {
		await mutateKeys([trimKey(toolKey)], [])
		return
	}
	await mutateKeys([], [[trimKey(toolKey), trim]])
}

/** Persists the latest converted output, or clears it when null. */
export async function saveMediaOutput(
	toolKey: string,
	output: TPersistedOutput | null
): Promise<void> {
	if (!supportsIndexedDB()) return
	if (!output) {
		await mutateKeys([outputKey(toolKey)], [])
		return
	}
	await mutateKeys([], [[outputKey(toolKey), output]])
}

/** Removes every persisted piece of a tool's media session. */
export async function clearMediaSession(toolKey: string): Promise<void> {
	if (!supportsIndexedDB()) return
	await mutateKeys(
		[inputKey(toolKey), trimKey(toolKey), outputKey(toolKey)],
		[]
	)
}
