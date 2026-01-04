import { BtnViewAll } from "@/components/ui/BtnViewAll"
import SwiperLibrary from "@/components/ui/SwiperLibrary"
import { Key } from "iconsax-react"
export default function ShopByCategory() {
    const products = [
        {
            id: 1,
            name: 'Mobile',
            img: 'https://res.cloudinary.com/do0im8hgv/image/upload/v1757319896/b23a5654-4485-467a-9930-6a6827df40ee.png'
        },
        {
            id: 2,
            name: 'Cosmectics',
            img: 'https://res.cloudinary.com/do0im8hgv/image/upload/v1757319971/4933f2ff-74d9-4746-8972-043a6cd849f4.png'
        },
        {
            id: 3,
            name: 'Electronics',
            img: 'https://res.cloudinary.com/do0im8hgv/image/upload/v1757319994/aecfc3d0-fa88-4431-909b-8731fc2f5525.png'
        },
        {
            id: 4,
            name: 'Furniture',
            img: 'https://res.cloudinary.com/do0im8hgv/image/upload/v1757320068/84f78cca-e3bd-4bf8-a292-abac4c53aac5.png'
        },
        {
            id: 5,
            name: 'Watches',
            img: 'https://res.cloudinary.com/do0im8hgv/image/upload/v1757320356/a44d1434-3d72-4c08-9815-d176485761ac.png'
        },
        {
            id: 6,
            name: 'Decor',
            img: 'https://res.cloudinary.com/do0im8hgv/image/upload/v1757320091/49f507e4-a1c7-4a08-aaf7-394af8228e10.png'
        },
        {
            id: 7,
            name: 'Accessories',
            img: 'https://res.cloudinary.com/do0im8hgv/image/upload/v1757320455/b40fd136-100d-4d5c-bac0-2319b7128228.png'
        }
    ]
    return (
        <div className="pt-8 px-4 sm:px-16">
            <div className=" pt-8 border-t-1 border-gray-300 flex justify-between items-center">
                <div className="flex gap-1">
                    <p className="font-bold sm:text-[18px] md:text-[24px]  text-black">SHOP FROM </p>
                    <p className="font-bold sm:text-[18px] md:text-[24px] text-[#FCBD01]">TOP CATEGORIES</p>
                </div>
                <BtnViewAll className="sm:px-6" />
            </div>
            <SwiperLibrary items={products} quantity={{smQuantity:4, lgQuantity: 7}} renderItem={
                ((product, index) => (
                    <div className="flex flex-col justify-center items-center">
                        <div className="bg-[#F5F5F5] flex justify-center items-center h-[100px] w-[100px] md:h-[130px] md:w-[130px] xl:h-[150px] xl:w-[150px] rounded-full">
                            <img className="w-[60px] h-[60px] lg:w-[80px] lg:h-[100px] " src={product.img} alt="" />
                        </div>
                        <p className="text-center font-bold text-[#222222]">{product.name}</p>
                    </div>
                ))
            }
            />
        </div>
    )
}