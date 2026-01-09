/**
 * @name ViewTransitionsConfig
 * 
 * @description view transitions configuration with toggleable options.
 * Modify these flags to customize transition behavior.
 */

export const viewTransitionsConfig = {
    /**
     * Enable or disable view transitions globally.
     */
    enabled: true,

    /**
     * Transition type options
     * Choose which transition effect to use
     */
    type: 'fade' as 'fade' | 'slide' | 'scale' | 'none',

    /**
     * Animation duration in milliseconds
     */
    duration: {
        fade: 300,
        slide: 400,
        scale: 300,
    },

    /**
     * Animation easing functions
     */
    easing: {
        fade: 'cubic-bezier(0, 0, 0.2, 1)',
        slide: 'cubic-bezier(0.4, 0, 0.2, 1)',
        scale: 'cubic-bezier(0.4, 0, 1, 1)',
    },

    /**
     * Enable fade-out animation for old view
     */
    fadeOut: true,

    /**
     * Enable fade-in animation for new view
     */
    fadeIn: true,

    /**
     * Delay before fade-in starts (in milliseconds)
     */
    fadeInDelay: 90,

    /**
     * Enable shared element transitions
     * When enabled, elements with viewTransitionName will animate
     */
    sharedElements: true,
} as const

export type ViewTransitionsConfig = typeof viewTransitionsConfig

