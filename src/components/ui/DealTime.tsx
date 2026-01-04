import { useEffect, useState } from "react";
import { timeUnit } from "@/types/type";
export default function DealTime({ endtime, unit }: timeUnit) {

    const totalTime = endtime instanceof Date
        ? Math.floor((endtime.getTime() - Date.now()) / 1000)
        : 0;
    const [timeLeft, setTimeLeft] = useState(totalTime);
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000)
        return () => clearInterval(timer);
    })
    const day = unit.day ? Math.floor(timeLeft / 86400) : 0;
    const hour = unit.day ? Math.floor(((timeLeft % 86400) / 3600)) : Math.floor((timeLeft / 3600));
    const min = unit.day ? Math.floor((((timeLeft % 86400) % 3600) / 60)) : Math.floor((timeLeft % 3600) / 60);
    const sec = unit.day ? Math.floor((((timeLeft % 86400) % 3600) % 60)) : Math.floor(timeLeft % 60);
    return (
        <div className="p-2 flex items-center justify-center bg-yellow-400 rounded-[10px]">
            <p className=" font-bold">
                {`${unit.day ? `${day}${unit.day} : ` : ''}${hour}${unit.hour}: ${min}${unit.min} : ${sec}${unit.sec}`}
            </p>
        </div>
    )
}

