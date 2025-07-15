export const ANIMATION_CONFIG = {
	DURATION: {
		SHORT: 0.2,
		MEDIUM: 0.3,
		LONG: 1.0,
	},
	EASING: {
		EASE_OUT: "easeOut",
		LINEAR: "linear",
	},
};

export const popoverTransition = {
	duration: ANIMATION_CONFIG.DURATION.SHORT,
	ease: ANIMATION_CONFIG.EASING.EASE_OUT,
};
