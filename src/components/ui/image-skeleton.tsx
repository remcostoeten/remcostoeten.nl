import { Skeleton } from "./skeleton";

type TProps = {
	height: string;
	width: string;
	className?: string;
};

export function ImageSkeleton({
	height,
	width,
	className,
	...props
}: TProps & React.HTMLAttributes<HTMLDivElement>) {
	return (
		<Skeleton
			className={className}
			style={{
				height,
				width,
				...props.style,
			}}
			{...props}
		/>
	);
}
