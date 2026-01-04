import { useEffect, useState } from "react";

export default function TimeLeft() {
    const getSecondLeftToday = () => {
        const timeNow = new Date();
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        return Math.floor((endOfDay.getTime() - timeNow.getTime()) / 1000); // quy đổi ra giây
    }
    const [timeLeft, setTimeLeft] = useState(getSecondLeftToday());
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(getSecondLeftToday());
        }, 1000); // sau 1s thì lại set lại thời gian cho timeLeft
        return () => clearInterval(timer);
    }, []);
    const hour = Math.floor(timeLeft / 3600);
    const min = Math.floor((timeLeft % 3600) / 60);
    const sec = Math.floor(timeLeft % 60);
    return (
        <div className="p-2 flex items-center justify-center bg-yellow-400 rounded-[10px]">
            <p className="font-bold">
                {`${hour}h : ${min}m : ${sec}s`}
            </p>
        </div>
    )
    
}