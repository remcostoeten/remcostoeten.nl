type ZipEntry = {
	name: Uint8Array
	data: Uint8Array
	crc: number
	offset: number
}

const encoder = new TextEncoder()

function crc32(data: Uint8Array): number {
	let crc = 0xffffffff
	for (const byte of data) {
		crc ^= byte
		for (let bit = 0; bit < 8; bit += 1)
			crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
	}
	return (crc ^ 0xffffffff) >>> 0
}

function u16(value: number): Uint8Array {
	return new Uint8Array([value & 255, (value >>> 8) & 255])
}

function u32(value: number): Uint8Array {
	return new Uint8Array([
		value & 255,
		(value >>> 8) & 255,
		(value >>> 16) & 255,
		(value >>> 24) & 255
	])
}

function join(parts: Uint8Array[]): Uint8Array {
	const result = new Uint8Array(
		parts.reduce((size, part) => size + part.length, 0)
	)
	let offset = 0
	for (const part of parts) {
		result.set(part, offset)
		offset += part.length
	}
	return result
}

export function createZip(files: Record<string, string>): Blob {
	const entries: ZipEntry[] = []
	const local: Uint8Array[] = []
	let offset = 0
	for (const filename of Object.keys(files).sort()) {
		const name = encoder.encode(filename)
		const data = encoder.encode(files[filename])
		const crc = crc32(data)
		const header = join([
			u32(0x04034b50),
			u16(20),
			u16(0x0800),
			u16(0),
			u16(0),
			u16(0),
			u32(crc),
			u32(data.length),
			u32(data.length),
			u16(name.length),
			u16(0),
			name
		])
		local.push(header, data)
		entries.push({ name, data, crc, offset })
		offset += header.length + data.length
	}
	const central = entries.map(entry =>
		join([
			u32(0x02014b50),
			u16(20),
			u16(20),
			u16(0x0800),
			u16(0),
			u16(0),
			u16(0),
			u32(entry.crc),
			u32(entry.data.length),
			u32(entry.data.length),
			u16(entry.name.length),
			u16(0),
			u16(0),
			u16(0),
			u16(0),
			u32(0),
			u32(entry.offset),
			entry.name
		])
	)
	const centralSize = central.reduce((size, entry) => size + entry.length, 0)
	const end = join([
		u32(0x06054b50),
		u16(0),
		u16(0),
		u16(entries.length),
		u16(entries.length),
		u32(centralSize),
		u32(offset),
		u16(0)
	])
	const zip = join([...local, ...central, end])
	return new Blob([zip.buffer as ArrayBuffer], { type: 'application/zip' })
}
