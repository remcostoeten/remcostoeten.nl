import { readFile, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const source = await readFile(new URL('../public/favicon.svg', import.meta.url))
const background = '#111111'
const sizes = [16, 32, 48, 64, 256]
const frames = await Promise.all(
	sizes.map(size => sharp(source).resize(size, size).png().toBuffer())
)
const directory = Buffer.alloc(6 + frames.length * 16)
directory.writeUInt16LE(1, 2)
directory.writeUInt16LE(frames.length, 4)

let offset = directory.length
frames.forEach((frame, index) => {
	const entry = 6 + index * 16
	const size = sizes[index]
	directory.writeUInt8(size === 256 ? 0 : size, entry)
	directory.writeUInt8(size === 256 ? 0 : size, entry + 1)
	directory.writeUInt16LE(1, entry + 4)
	directory.writeUInt16LE(32, entry + 6)
	directory.writeUInt32LE(frame.length, entry + 8)
	directory.writeUInt32LE(offset, entry + 12)
	offset += frame.length
})

const ico = Buffer.concat([directory, ...frames])
await Promise.all([
	writeFile(new URL('../public/favicon.ico', import.meta.url), ico),
	writeFile(new URL('../src/app/favicon.ico', import.meta.url), ico),
	sharp(source)
		.resize(192, 192)
		.png()
		.toFile(new URL('../public/icon-192.png', import.meta.url).pathname),
	sharp(source)
		.resize(512, 512)
		.png()
		.toFile(new URL('../public/icon-512.png', import.meta.url).pathname),
	sharp(source)
		.resize(180, 180)
		.flatten({ background })
		.png()
		.toFile(new URL('../public/apple-icon.png', import.meta.url).pathname),
	sharp(source)
		.resize(410, 410)
		.flatten({ background })
		.extend({ top: 51, bottom: 51, left: 51, right: 51, background })
		.png()
		.toFile(
			new URL('../public/icon-512-maskable.png', import.meta.url).pathname
		)
])
