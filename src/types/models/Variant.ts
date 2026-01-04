import { Product } from "./Product"

export interface Variant {
    createdate: string
    id: number
    inputprice: number
    isdeleted: boolean
    price: number
    product: Product
    product_id: number
    stock: number
    updatedate: string
    valuevariant: any
}
