'use client'

import type { TTrimRange } from '../types/media'

const DB_NAME = 'media-tools'
const STORE_NAME = 'sessions'
const DB_VERSION = 1

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

async function writeKey(key: string, value: unknown): Promise<void> {
	const db = await openDatabase()
	try {
		await new Promise<void>((resolve, reject) => {
			const transaction = db.transaction(STORE_NAME, 'readwrite')
			transaction.objectStore(STORE_NAME).put(value, key)
			transaction.oncomplete = () => resolve()
			transaction.onerror = () => reject(transaction.error)
			transaction.onabort = () => reject(transaction.error)
		})
	} finally {
		db.close()
	}
}

async function deleteKeys(keys: string[]): Promise<void> {
	const db = await openDatabase()
	try {
		await new Promise<void>((resolve, reject) => {
			const transaction = db.transaction(STORE_NAME, 'readwrite')
			const store = transaction.objectStore(STORE_NAME)
			for (const key of keys) store.delete(key)
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
 * whole session.
 */
export async function saveMediaFile(
	toolKey: string,
	file: File | null
): Promise<void> {
	if (!file) {
		await clearMediaSession(toolKey)
		return
	}
	await deleteKeys([trimKey(toolKey), outputKey(toolKey)])
	await writeKey(inputKey(toolKey), file)
}

/** Persists the current trim range, or clears it when null. */
export async function saveMediaTrim(
	toolKey: string,
	trim: TTrimRange | null
): Promise<void> {
	if (!trim) {
		await deleteKeys([trimKey(toolKey)])
		return
	}
	await writeKey(trimKey(toolKey), trim)
}

/** Persists the latest converted output, or clears it when null. */
export async function saveMediaOutput(
	toolKey: string,
	output: TPersistedOutput | null
): Promise<void> {
	if (!output) {
		await deleteKeys([outputKey(toolKey)])
		return
	}
	await writeKey(outputKey(toolKey), output)
}

/** Removes every persisted piece of a tool's media session. */
export async function clearMediaSession(toolKey: string): Promise<void> {
	await deleteKeys([inputKey(toolKey), trimKey(toolKey), outputKey(toolKey)])
}
