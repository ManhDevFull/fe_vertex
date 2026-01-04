
import { transform } from "next/dist/build/swc/generated-native";
import { useEffect, useState } from "react"
import { IoChevronBack } from "react-icons/io5"
import { MdNavigateNext } from "react-icons/md";

export function Slider() {
    const slides = [
        {
            title: 'Best Deal Online on smart watches',
            product: 'LASTEST NIKE SHOES',
            discount: 'UP to 80% OFF',
            img: 'https://res.cloudinary.com/do0im8hgv/image/upload/v1756557088/f06848ef-d2c7-4037-8d6d-ba13478ba8f5.png'
        },
        {
            title: 'Best Deal Online on smart watches',
            product: 'LASTEST ADDIDAS SHOES',
            discount: 'UP to 90% OFF',
            img: 'https://res.cloudinary.com/do0im8hgv/image/upload/v1755592188/93c1a905-070e-430b-825a-2d0fae8b9e6c.png'
        },
        {
            title: 'Best Deal Online on smart watches',
            product: 'LASTEST LV SHOES',
            discount: 'UP to 50% OFF',
            img: 'https://res.cloudinary.com/do0im8hgv/image/upload/v1755761340/370e0dbb-f34c-4ba7-8e5c-797f036749ee.png'
        }
    ]
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         setCurrentIndex((pre) => (pre + 1) % slides.length);
    //     }, 2000);
    //     return () => clearInterval(interval);
    // }, [slides.length])
    const [currentIndex, setCurrentIndex] = useState(0);
    useEffect(() => {
        let timer = setTimeout(() => {
            setCurrentIndex(prev => (prev + 1) % slides.length);
        }, 3000);

        return () => clearTimeout(timer);
    }, [currentIndex]);
    const nextSlide = () => {
        setCurrentIndex(preCurrent => (preCurrent + 1) % slides.length);
    }
    const prevSlide = () => {
        setCurrentIndex(preCurrent => (preCurrent - 1 + slides.length) % slides.length)
    }
    return (
        <div className=" w-full py-6 px-4 sm:px-16">
            <div className="w-full border-none h-[200px] sm:h-[250px] lg:h-[350px] rounded-2xl bg-[#0C59B6] z-0 relative">
                <div className="w-full relative h-full overflow-hidden">
                    <div className="absolute z-0 bottom-[120px] w-[180px] h-[180px] md:w-[200px] md:h-[200px] right-4 sm:bottom-[150px] lg:right-8 lg:bottom-34 flex justify-center items-center lg:w-120 lg:h-120 rounded-full border-[1px] border-white ">
                        <div className="w-[170px] h-[170px] md:w-[190px] md:h-[190px] lg:w-110 lg:h-110 rounded-full bg-[#F5A914]">
                        </div>
                    </div>
                    <div className="w-[140px] h-[140px] right-[60px] top-[130px] sm:top-[160px] absolute lg:right-56 lg:top-60 flex items-center justify-center lg:w-44 lg:h-44 rounded-full border-[1px] border-white">
                        <div className="w-[130px] h-[130px] lg:w-36 lg:h-36 rounded-full bg-[#F5A914]">
                        </div>
                    </div>
                </div>
                <div className="w-full absolute inset-0 z-30 overflow-hidden">
                    <div style={{ transform: `translateX(-${currentIndex * 100}%)` }} className="flex flex-nowrap transition-transform duration-500 ease-in-out">
                        {
                            slides.map((slide, index) => (
                                <div key={index} className="flex items-center w-full shrink-0">
                                    <div className="w-full flex justify-between items-center">
                                        <div className="px-10 md:pt-10 lg:pt-0 lg:px-20 pt-2">
                                            <h5 className="sm:text-xl lg:text-2xl text-white">{slide.title}</h5>
                                            <h1 className="sm:text-2xl lg:text-[28px] xl:text-[30px] py-2 sm:py-8 font-medium text-white">{slide.product}</h1>
                                            <h4 className="sm:text-2xl lg:text-3xl text-white">{slide.discount}</h4>
                                        </div>
                                        <div>
                                            <img className="w-[140px] h-[130px] sm:w-[150px] lg:w-[400px] lg:h-[300px] xl:w-[500px] xl:h-[350px]" src={slide.img} alt="" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div className="absolute bottom-10 left-30 w-60">
                    <div className="flex gap-3">
                        {
                            slides.map((slide, index) => (
                                // <div className="w-8 h-3 bg-white rounded-full"></div>
                                <div key={index} className={`${index === currentIndex ? 'w-8' : 'w-3'} h-3 bg-white rounded-full transition-all duration-300`}>
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div className="w-full absolute z-40 top-[30%]">
                    <div className="flex justify-between">
                        <div onClick={prevSlide} className="flex justify-center items-center p-4 hover:cursor-pointer rounded-full -translate-x-1/2 bg-white">
                            <div className="lg:w-[50px] lg:h-[50px] xl:w-[80px] xl:h-[80px] rounded-full bg-[#F3F9FB] flex justify-center items-center">
                                <IoChevronBack size={30} className="text-shadow-black " />
                            </div>
                        </div>
                        <div onClick={nextSlide} className="flex justify-center items-center p-4 hover:cursor-pointer rounded-full translate-x-1/2 bg-white">
                            <div className="lg:w-[50px] lg:h-[50px] xl:w-[80px] xl:h-[80px] rounded-full bg-[#F3F9FB] flex justify-center items-center">
                                <MdNavigateNext size={30} className="text-shadow-black " />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}