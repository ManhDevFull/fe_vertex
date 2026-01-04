type Type = {
    className: string
}
export default function NewLabel({ className }: Type) {
    return (
        <div className={`flex w-16 justify-center bg-yellow-400 items-center rounded-tl-3xl rounded-br-3xl ${className}`}>
            <p className="w-full h-full p-2 text-white text-center ">New</p>
        </div>
    )
}