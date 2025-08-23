import { cx } from "class-variance-authority";

type TProps = {
    children: React.ReactNode;
    className: string
}

export function Center({children, className}:TProps){
    return (
        <div className={cx(className, 'grid place-items-center w-screen h-screen')}>
            {children}
        </div>
    )
}