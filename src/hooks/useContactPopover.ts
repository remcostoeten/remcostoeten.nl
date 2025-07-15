import { useState, useRef, useEffect, useCallback } from "react";

type TPopoverState = {
	isVisible: boolean;
	isPinned: boolean;
	shouldOpenAbove: boolean;
};

type TPopoverHandlers = {
	handleMouseEnter: (event: React.MouseEvent) => void;
	handleMouseLeave: () => void;
	handleClick: () => void;
	closePopover: () => void;
};

type TUseContactPopoverReturn = {
	isVisible: boolean;
	shouldOpenAbove: boolean;
	handleMouseEnter: (event: React.MouseEvent) => void;
	handleMouseLeave: () => void;
	handleClick: () => void;
	handlePopoverMouseEnter: () => void;
	handlePopoverMouseLeave: () => void;
	popoverRootRef: React.RefObject<HTMLElement>;
};

export function useContactPopover(): TUseContactPopoverReturn {
	const [state, setState] = useState<TPopoverState>({
		isVisible: false,
		isPinned: false,
		shouldOpenAbove: false,
	});

	const popoverRootRef = useRef<HTMLElement>(null);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	const handleMouseEnter = useCallback((event: React.MouseEvent) => {
		const rect = event.currentTarget.getBoundingClientRect();
		const viewportHeight = window.innerHeight;
		const shouldOpenAbove = rect.bottom + 200 > viewportHeight;

		timerRef.current = setTimeout(() => {
			setState((prevState) => ({
				...prevState,
				isVisible: true,
				shouldOpenAbove,
			}));
		}, 1000);
	}, []);

	const handleMouseLeave = useCallback(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}

		// Add a small delay before hiding to allow moving to the popover
		timerRef.current = setTimeout(() => {
			setState((prevState) => {
				if (!prevState.isPinned) {
					return {
						...prevState,
						isVisible: false,
					};
				}
				return prevState;
			});
		}, 100);
	}, []);

	const handleClick = useCallback(() => {
		setState((prevState) => ({
			...prevState,
			isPinned: !prevState.isPinned,
			isVisible: true,
		}));
	}, []);

	const closePopover = useCallback(() => {
		setState((prevState) => ({
			...prevState,
			isVisible: false,
			isPinned: false,
		}));
	}, []);

	const handlePopoverMouseEnter = useCallback(() => {
		// Cancel any pending hide timer when hovering over the popover
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	const handlePopoverMouseLeave = useCallback(() => {
		// Hide the popover when leaving the popover area (if not pinned)
		setState((prevState) => {
			if (!prevState.isPinned) {
				return {
					...prevState,
					isVisible: false,
				};
			}
			return prevState;
		});
	}, []);

	useEffect(() => {
		function handleMouseDown(event: MouseEvent) {
			if (
				popoverRootRef.current &&
				!popoverRootRef.current.contains(event.target as Node)
			) {
				closePopover();
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				closePopover();
			}
		}

		if (state.isPinned || state.isVisible) {
			document.addEventListener("mousedown", handleMouseDown);
			document.addEventListener("keydown", handleKeyDown);
		}

		return () => {
			document.removeEventListener("mousedown", handleMouseDown);
			document.removeEventListener("keydown", handleKeyDown);
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
		};
	}, [state.isPinned, state.isVisible, closePopover]);

	return {
		isVisible: state.isVisible,
		shouldOpenAbove: state.shouldOpenAbove,
		handleMouseEnter,
		handleMouseLeave,
		handleClick,
		handlePopoverMouseEnter,
		handlePopoverMouseLeave,
		popoverRootRef,
	};
}
