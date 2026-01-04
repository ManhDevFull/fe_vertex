import { useRouter } from "next/navigation"
type classProps = {
    className: string
}
export function BtnViewAll({ className }: classProps) {
    const router = useRouter();
    return (
        <div onClick={() => router.push('')} className={`flex px-2 py-1 sm:p-2 items-center justify-center bg-yellow-400 whitespace-nowrap rounded-[10px] cursor-pointer hover:bg-gray-900 transition-colors duration-200 ease-in-out ${className}`}>
            <p className="font-medium text-center">View All</p>
        </div>
    )
}