import { useEffect, useState } from "react";

type EndTimeProps = {
    endTime: string |Date;
}
export default function FlashDealBar({ endTime }: EndTimeProps) {
    console.log(endTime);
    const end = new Date(endTime); //convert về date vì be trả về có thể là string chứ không phải date
    const toltalTime = Math.floor((end.getTime() - Date.now()) / 1000);
    const [timeLeft, setTimeLeft] = useState(toltalTime);
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((pre) => pre > 0 ? pre - 1000 : 0)
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    const progress = ((timeLeft) / toltalTime) * 100;
    const h = Math.floor(timeLeft / 3600);
    return (
        timeLeft > 0 ?
            (<div className="w-full py-2">
                <div className="flex gap-1 items-center">
                    <span className={`${progress > 40 ? "text-blue-500" : "text-red-500"} text-sm`}>{`Flash Deal Ends in ${h} Hours `}</span>
                    <span className={`${progress > 40 ? "text-blue-500" : "text-red-500"} font-bold hidden md:block`}>!</span>
                </div>
                <div className={`${progress > 40 ? "bg-blue-300" : "bg-red-300"} rounded-2xl w-full h-2`}>
                    <div className={`${progress > 40 ? "bg-blue-500" : "bg-red-500"}  rounded-2xl h-full`}
                        style={{ width: `${progress}%` }}
                    >
                    </div>
                </div>
            </div>) :
             <div></div>
    )
}



