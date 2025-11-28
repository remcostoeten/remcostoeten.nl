import Image from 'next/image'

/**
 * @name RoundedImage
 * @description Custom image component that wraps Next.js Image with rounded corners. Ensures all images in blog posts have consistent styling.
 */
interface RoundedImageProps extends React.ComponentProps<typeof Image> {
    alt: string
}

export function RoundedImage(props: RoundedImageProps) {
    return <Image alt={props.alt} className="rounded-lg" {...props} />
}

