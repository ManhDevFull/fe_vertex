import { Variant } from "./Variant"

export interface OrderDetail {
    id: number
    order_id: number
    quantity: number
    reviews: number |null
    variant: Variant
    variant_id: number
}