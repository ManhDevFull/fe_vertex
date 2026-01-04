import { Suspense } from "react";

import AllProductsClient from "./AllProductsClient";

export default function AllProduct() {
  return (
    <Suspense fallback={<div className="py-10 text-center text-gray-500">Loading products...</div>}>
      <AllProductsClient />
    </Suspense>
  );
}
