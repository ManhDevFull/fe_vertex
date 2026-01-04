"use client";
import { useEffect, useState } from "react";

// 1. Giữ nguyên 'type' (props)
type timeUnit = {
  endTime: Date;
  unit: {
    day?: string;
    hour: string;
    min: string;
    sec: string;
  };
};

// 2. Giữ nguyên tên component (chỉ đổi tên file)
export default function DealTime({ endTime, unit }: timeUnit) {
  // 3. Khởi tạo state là 'null'
  // (Server và Client sẽ render 'null' ở lần đầu -> Khớp nhau)
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    // 4. Chỉ tính toán thời gian bên trong useEffect (Chỉ chạy ở Client)
    const calculateInitialTime = () => {
      if (!endTime) return;
      const totalSeconds = Math.floor((endTime.getTime() - Date.now()) / 1000);
      setTimeLeft(totalSeconds > 0 ? totalSeconds : 0);
    };

    calculateInitialTime(); // Tính lần đầu khi mount

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);

  }, [endTime]); // Thêm dependency array

  // 5. Tính toán an toàn
  const safeTimeLeft = timeLeft ?? 0; // Dùng 0 nếu state là null

  const day = unit.day ? Math.floor(safeTimeLeft / 86400) : 0;
  const hour = unit.day
    ? Math.floor((safeTimeLeft % 86400) / 3600)
    : Math.floor(safeTimeLeft / 3600);
  const min = unit.day
    ? Math.floor(((safeTimeLeft % 86400) % 3600) / 60)
    : Math.floor((safeTimeLeft % 3600) / 60);
  const sec = unit.day
    ? Math.floor(((safeTimeLeft % 86400) % 3600) % 60)
    : Math.floor(safeTimeLeft % 60);

  return (
    <div className="p-2 flex items-center justify-center bg-yellow-400 rounded-[10px]">
      <p className=" font-bold">
        {/* 6. Hiển thị placeholder khi 'timeLeft' là null */}
        {timeLeft === null
          ? "--:--:--:--" // Placeholder khớp server/client
          : `${unit.day ? `${day}${unit.day} : ` : ""}${hour}${
              unit.hour
            }: ${min}${unit.min} : ${sec}${unit.sec}`}
      </p>
    </div>
  );
}