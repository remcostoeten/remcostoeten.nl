import { Skeleton } from "./skeleton";

type TProps = {
	height?: string;
	width?: string;
	className?: string;
};

export function TextSkeleton({
	height = "1rem",
	width = "100%",
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
