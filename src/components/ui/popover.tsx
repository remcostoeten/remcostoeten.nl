import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";
import { motion, LayoutGroup } from "framer-motion";

import { cn } from "@/lib/utils";
import { popoverTransition } from "@/lib/animations";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
	React.ElementRef<typeof PopoverPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
	<PopoverPrimitive.Portal>
		<PopoverPrimitive.Content
			ref={ref}
			align={align}
			sideOffset={sideOffset}
			className={cn(
				"z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-2xl backdrop-blur-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
				className,
			)}
			{...props}
		/>
	</PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

type TMotionPopoverContentProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
	layout?: boolean;
	initial?: any;
	animate?: any;
	exit?: any;
};

const MotionPopoverContent = React.forwardRef<
	React.ElementRef<typeof PopoverPrimitive.Content>,
	TMotionPopoverContentProps
>(({ className, align = "center", sideOffset = 4, layout = true, initial, animate, exit, ...props }, ref) => (
	<PopoverPrimitive.Portal>
		<motion.div
			layout={layout}
			initial={initial || { opacity: 0, scale: 0.95 }}
			animate={animate || { opacity: 1, scale: 1 }}
			exit={exit || { opacity: 0, scale: 0.95 }}
			transition={popoverTransition}
		>
			<PopoverPrimitive.Content
				ref={ref}
				align={align}
				sideOffset={sideOffset}
				className={cn(
					"z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-2xl backdrop-blur-lg outline-none",
					className,
				)}
				{...props}
			/>
		</motion.div>
	</PopoverPrimitive.Portal>
));
MotionPopoverContent.displayName = "MotionPopoverContent";

export { Popover, PopoverTrigger, PopoverContent, MotionPopoverContent };
