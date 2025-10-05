import { LatestActivity } from '@/components/latest-activity';

export function LatestActivitySection() {
    return (
        <section
            aria-label="Recent Activity"
            itemScope
            itemType="https://schema.org/CreativeWork"
        >
            <LatestActivity />
        </section>
    );
}

