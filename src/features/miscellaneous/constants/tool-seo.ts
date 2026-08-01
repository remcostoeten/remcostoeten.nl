import type { TToolSlug } from './tools'

export type TToolFaq = {
	question: string
	answer: string
}

export type TToolSeoContent = {
	metaTitle: string
	metaDescription: string
	intro: string
	highlights: readonly string[]
	steps: readonly string[]
	formats: string
	faqs: readonly TToolFaq[]
}

const TOOL_SEO_CONTENT = {
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
			'Input: SVG markup and .svg files. Output: React TSX components, combined registries and downloadable ZIP packages.',
		faqs: [
			{
				question: 'Are my SVG files uploaded?',
				answer: 'No. Parsing, sanitizing and component generation happen locally in your browser.'
			},
			{
				question: 'Can I convert multiple SVG icons at once?',
				answer: 'Yes. You can process a collection, rename components and export individual files or one combined package.'
			},
			{
				question: 'Does it prevent duplicate SVG IDs?',
				answer: 'Yes. Internal IDs and their references are rewritten so multiple generated icons can render safely on the same page.'
			}
		]
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
			'Input: MP4, MOV, MKV, WebM and AVI. Output: chat-friendly H.264 MP4 or an optimized animated GIF.',
		faqs: [
			{
				question:
					'Why does a video work locally but not in WhatsApp Web?',
				answer: 'The container may be supported while its video or audio codec is not. Re-encoding to a conventional H.264 MP4 resolves many compatibility problems.'
			},
			{
				question: 'Is my video uploaded anywhere?',
				answer: 'No. The file is decoded and encoded locally in your browser and remains on your device.'
			},
			{
				question: 'Can I trim the video before converting it?',
				answer: 'Yes. Set the clip range in the preview before exporting to avoid encoding footage you do not need.'
			}
		]
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
			'Input: animated GIF files. Output: H.264 MP4 for compatibility or WebM for efficient web delivery.',
		faqs: [
			{
				question: 'Why convert a GIF to MP4 or WebM?',
				answer: 'Video compression is substantially more efficient than animated GIF compression, so the result is often smaller at similar visual quality.'
			},
			{
				question: 'Will the animation still loop?',
				answer: 'The complete animation is preserved in the exported video. Whether it loops during playback depends on the website or video player.'
			},
			{
				question: 'Does the GIF get uploaded?',
				answer: 'No. Conversion runs locally in the browser, and the input and output stay on your device.'
			}
		]
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
			'Input: MP4, MOV, MKV, WebM and AVI video. Output: optimized animated GIF with a generated color palette.',
		faqs: [
			{
				question: 'How can I make the GIF file smaller?',
				answer: 'Trim the clip, reduce its width or lower the frame rate. Shorter dimensions and fewer frames usually have the largest effect.'
			},
			{
				question:
					'Can I preview the result before the full conversion?',
				answer: 'Yes. The preview renders a short sample and estimates the complete file size using the selected settings.'
			},
			{
				question: 'Is the source video uploaded?',
				answer: 'No. FFmpeg runs inside your browser, so the source video and generated GIF remain local.'
			}
		]
	}
} as const satisfies Partial<Record<TToolSlug, TToolSeoContent>>

export function getToolSeoContent(slug: string): TToolSeoContent | undefined {
	return TOOL_SEO_CONTENT[slug as keyof typeof TOOL_SEO_CONTENT]
}
