import type { TToolSlug } from './tools'

export type TToolSeoContent = {
	metaTitle: string
	metaDescription: string
	intro: string
	highlights: readonly string[]
	steps: readonly string[]
	formats: string
}

const TOOL_SEO_CONTENT = {
	'heic-converter': {
		metaTitle: 'HEIC to JPG & PNG Converter — Private & Browser-Based',
		metaDescription:
			'Convert HEIC and HEIF photos to JPG or PNG privately in your browser. Batch convert iPhone images with quality control and no uploads.',
		intro: 'Open iPhone photos in apps and websites that do not support HEIC. The decoder runs locally in your browser, lets you convert several photos in one pass and creates standard JPG or PNG files without an upload queue.',
		highlights: [
			'Batch convert up to 12 HEIC or HEIF photos at a time.',
			'Choose compact JPG with quality control or lossless PNG output.',
			'Keep photos on your device—the converter does not upload them.'
		],
		steps: [
			'Drop HEIC or HEIF photos into the converter or choose them from your device.',
			'Select JPG or PNG and adjust JPG quality if needed.',
			'Convert, inspect the previews and download one image or the whole batch.'
		],
		formats:
			'Input: HEIC and HEIF photos. Output: broadly compatible JPG or lossless PNG images. EXIF metadata is not copied to the converted files.'
	},
	'svg-converter': {
		metaTitle: 'SVG to React Converter — Generate TSX Components',
		metaDescription:
			'Convert SVG markup into clean React TSX components. Sanitize icons, rewrite IDs, preview changes and export individual files or a ZIP locally.',
		intro: 'Turn raw SVG markup or complete icon sets into reusable React components without sending source files to a server. The converter normalizes attributes, protects colliding IDs and keeps the output deterministic.',
		highlights: [
			'Convert one SVG or an entire icon set into typed React TSX components.',
			'Rewrite IDs, inspect colors and sanitize unsafe or unnecessary markup.',
			'Copy code directly or download individual files, a registry or a ZIP package.'
		],
		steps: [
			'Paste SVG markup or add multiple SVG files to the local workbench.',
			'Review component names, colors and conversion settings in the live preview.',
			'Copy the generated TSX or export the complete collection as files or a ZIP.'
		],
		formats:
			'Input: SVG markup and .svg files. Output: React TSX components, combined registries and downloadable ZIP packages.'
	},
	'sendable-video': {
		metaTitle: 'WhatsApp Video Converter — MOV/MKV to MP4',
		metaDescription:
			'Convert MOV, MKV, WebM or AVI video to a WhatsApp-friendly MP4. Trim and optimize clips privately in your browser with no uploads.',
		intro: 'Create a broadly compatible MP4 for WhatsApp Web and other chat apps when the original video will not send or preview correctly. Conversion and trimming run on your device using browser-based FFmpeg.',
		highlights: [
			'Convert common video formats to H.264 MP4 for wider chat-app compatibility.',
			'Trim unwanted footage before encoding to reduce processing time and file size.',
			'Keep private videos on your device—the source never needs to be uploaded.'
		],
		steps: [
			'Drop an MP4, MOV, MKV, WebM or AVI file into the converter.',
			'Preview the clip and set a start or end point if it needs trimming.',
			'Export a compatible MP4 or an optimized GIF and download it locally.'
		],
		formats:
			'Input: MP4, MOV, MKV, WebM and AVI. Output: chat-friendly H.264 MP4 or an optimized animated GIF.'
	},
	'gif-to-video': {
		metaTitle: 'GIF to MP4 & WebM Converter',
		metaDescription:
			'Convert animated GIFs to smaller MP4 or WebM videos with quality presets and instant previews. Free, private and entirely browser-based.',
		intro: 'Convert an animated GIF into a modern video file that is usually much smaller and easier to share. The source is processed locally with browser-based FFmpeg, so it never needs to leave your device.',
		highlights: [
			'Export broadly compatible MP4 or efficient WebM video.',
			'Choose a quality preset and preview the result before downloading.',
			'Process private or work-related GIFs locally without an upload queue.'
		],
		steps: [
			'Drop an animated GIF into the converter or choose one from your device.',
			'Select MP4 or WebM and choose the balance between quality and file size.',
			'Convert, inspect the preview and download the finished video.'
		],
		formats:
			'Input: animated GIF files. Output: H.264 MP4 for compatibility or WebM for efficient web delivery.'
	},
	'video-to-gif': {
		metaTitle: 'Video to GIF Converter — MP4, MOV & WebM',
		metaDescription:
			'Convert MP4, MOV, MKV, WebM or AVI clips to optimized looping GIFs. Trim, resize and control frame rate privately in your browser.',
		intro: 'Make an optimized looping GIF from a short video clip without uploading it. Trim the source, choose its width, frame rate and quality, then preview an estimate before rendering the complete animation.',
		highlights: [
			'Trim the exact moment you want before starting the full conversion.',
			'Control width, frame rate and palette quality to manage the output size.',
			'Preview a short sample and size estimate before committing to a long render.'
		],
		steps: [
			'Choose an MP4, MOV, MKV, WebM or AVI video from your device.',
			'Set the clip range, output width, frame rate and quality.',
			'Render the looping GIF, review it and download the result.'
		],
		formats:
			'Input: MP4, MOV, MKV, WebM and AVI video. Output: optimized animated GIF with a generated color palette.'
	}
} as const satisfies Partial<Record<TToolSlug, TToolSeoContent>>

export function getToolSeoContent(slug: string): TToolSeoContent | undefined {
	return TOOL_SEO_CONTENT[slug as keyof typeof TOOL_SEO_CONTENT]
}
