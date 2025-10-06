'use client';

import { useEffect, useRef } from 'react';
import { useAnalytics } from '@/hooks/use-analytics';

type TProps = {
    pageTitle?: string;
    trackBlogView?: {
        blogSlug: string;
        blogTitle: string;
    };
};

export function AnalyticsTracker({ pageTitle, trackBlogView }: TProps) {
    const { autoTrackPageview, trackBlogView: trackBlog, trackVisitor } = useAnalytics();
    const hasTrackedRef = useRef(false);

    useEffect(() => {
        if (hasTrackedRef.current) return;

        // Skip analytics for localhost/development
        if (typeof window !== 'undefined' &&
            (window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1' ||
                window.location.hostname.includes('localhost'))) {
            return;
        }

        const trackPage = async () => {
            // Always track visitor first (for country, device, etc.)
            await trackVisitor();

            if (trackBlogView) {
                await trackBlog(trackBlogView.blogSlug, trackBlogView.blogTitle);
            } else {
                await autoTrackPageview();
            }
            hasTrackedRef.current = true;
        };

        trackPage();
    }, [trackBlog, trackBlogView, autoTrackPageview, trackVisitor]);

    return null;
}
