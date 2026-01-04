'use client'
import { Suspense, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";

import Filter from "@/components/templates/filter/filter";
import ShowItems from "@/components/templates/showItems/showItems";

export default function AllProduct(){
    const searchParams = useSearchParams();
    const query = searchParams.get("query") || "";
    const [state, setState] = useState<{
        total?: number;
        type: boolean;
        filterCount?: number;
    }>({
        type : true
    })
    const handleSetTotal = useCallback((newtotal: number) => {
        setState((prev) => ({ ...prev, total: newtotal }))
    }, []);
    const handleSetFilterCount = useCallback((count: number) => {
        setState((prev) => ({ ...prev, filterCount: count }))
    }, []);

    return (
        <div className="pb-10">
            <ShowItems
                type={state.type}
                total={state.total ?? 0}
                query={query}
                filterCount={state.filterCount ?? 0}
                onSetType={(newType: boolean) =>
                    setState((ps) => ({ ...ps, type: newType }))
                }
            />
            <Suspense fallback={<div className="py-10 text-center text-gray-500">Loading filters...</div>}>
                <Filter
                    type={state.type}
                    onSetTotal={handleSetTotal}
                    onSetFilterCount={handleSetFilterCount}
                />
            </Suspense>
        </div>
    )
}
