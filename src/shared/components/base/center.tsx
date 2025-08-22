type TProps = {
    children: React.ReactNode;
}

export function Center({children}:TProps){
    return (
        <div className='grid place-items-center w-screen h-screen'>
            {children}
        </div>
    )
}