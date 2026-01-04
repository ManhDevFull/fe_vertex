import { useRouter } from "next/navigation";
import { GrPrevious } from "react-icons/gr";

export default function Back() {
      const router = useRouter();
    return (
        <div className="flex items-center " onClick={() => router.back()}>
            <div
                className=" flex items-center justify-center w-[50px] h-[50px]
                         border-2 border-[#C1C1C1] rounded-3xl"
            >
                <GrPrevious size={20} />
            </div>
        </div>
    )
}