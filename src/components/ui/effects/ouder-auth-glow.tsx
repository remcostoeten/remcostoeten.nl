import { ReactNode } from 'react';

type TProps = {
    children?: ReactNode;
    glowColor?: string;
    glowSize?: string;
};

export function OuterAuthGlow({
    children,
    glowColor = 'rgba(78, 201, 176, .31)',
    glowSize = '15px'
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
