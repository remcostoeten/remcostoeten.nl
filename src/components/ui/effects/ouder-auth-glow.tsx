import { ReactNode } from 'react';

type TProps = {
    children?: ReactNode;
    glowColor?: string;
    glowSize?: string;
};

export function OuterAuthGlow({
    children,
    glowColor = '#22c55e',
    glowSize = '80px'
}: TProps) {
    return (
        <div
            className="fixed inset-0 overflow-hidden pointer-events-none z-[9998]"
            style={{
                boxShadow: `inset 0 0 ${glowSize} ${glowColor}`
            }}
        >
            {children}
        </div>
    );
}