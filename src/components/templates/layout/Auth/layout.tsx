"use client";
import Image from "next/image";
import type { ReactNode } from "react";

export interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  illustrationSrc: string;
  children: ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  illustrationSrc,
  children,
}: AuthLayoutProps) {
  return (
    <section className="relative w-full overflow-hidden bg-white">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/5 -top-1/6 h-full scale-[2.6] origin-top -translate-x-1/2"
      >
        <svg
          viewBox="0 0 2402 2434"
          fill="none"
          className="h-full w-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M809.119 1857.25C684.78 1775.74 707.233 1589.47 648.864 1452.73C591.834 1319.13 436.894 1207.44 471.512 1066.36C506.217 924.929 701.307 903.888 807.889 804.65C917.385 702.701 959.086 525.74 1101.47 479.817C1251.81 431.328 1435.87 460.933 1556.18 563.311C1672.14 661.998 1635.93 846.582 1696.58 986.255C1756.33 1123.86 1921.6 1222.2 1907.12 1371.51C1892.53 1522.02 1749.24 1625.61 1626.09 1713.36C1513.98 1793.23 1380.36 1819.52 1244.79 1843.4C1098.11 1869.24 933.681 1938.91 809.119 1857.25Z"
            stroke="black"
            strokeWidth="3"
          />
          <path
            d="M849.365 1791.42C737.812 1718.29 757.957 1551.17 705.589 1428.49C654.424 1308.63 515.416 1208.42 546.474 1081.85C577.61 954.963 752.639 936.085 848.262 847.052C946.498 755.586 983.911 596.822 1111.66 555.621C1246.54 512.119 1411.67 538.679 1519.6 630.53C1623.64 719.069 1591.15 884.672 1645.57 1009.98C1699.17 1133.44 1847.45 1221.66 1834.46 1355.62C1821.37 1490.65 1692.82 1583.6 1582.33 1662.32C1481.74 1733.98 1361.87 1757.57 1240.24 1778.99C1108.64 1802.17 961.118 1864.68 849.365 1791.42Z"
            stroke="black"
            strokeWidth="3"
          />
          <path
            d="M769.503 1922.06C632.579 1832.29 657.305 1627.17 593.027 1476.59C530.225 1329.46 359.602 1206.47 397.724 1051.12C435.942 895.367 650.778 872.195 768.149 762.913C888.728 650.645 934.65 455.772 1091.45 405.201C1257.01 351.804 1459.7 384.406 1592.18 497.146C1719.88 605.822 1680 809.089 1746.79 962.9C1812.59 1114.43 1994.58 1222.72 1978.64 1387.15C1962.58 1552.89 1804.79 1666.97 1669.17 1763.6C1545.71 1851.56 1398.57 1880.51 1249.27 1906.8C1087.74 1935.26 906.673 2011.98 769.503 1922.06Z"
            stroke="black"
            strokeWidth="3"
          />
          <path
            d="M727.315 1991.07C576.987 1892.52 604.134 1667.32 533.564 1502C464.614 1340.47 277.29 1205.44 319.143 1034.88C361.102 863.883 596.968 838.443 725.828 718.464C858.21 595.205 908.627 381.257 1080.77 325.736C1262.54 267.113 1485.07 302.905 1630.52 426.681C1770.72 545.995 1726.94 769.16 1800.26 938.026C1872.5 1104.39 2072.32 1223.28 2054.81 1403.81C2037.18 1585.77 1863.94 1711.02 1715.05 1817.1C1579.5 1913.67 1417.96 1945.46 1254.05 1974.33C1076.71 2005.56 877.911 2089.8 727.315 1991.07Z"
            stroke="black"
            strokeWidth="3"
          />
        </svg>
      </div>

      <div className="mx-auto mt-2 grid grid-cols-1 gap-10 px-6 py-1 sm:px-10 lg:grid-cols-12 lg:gap-16 lg:px-16 xl:px-40">
        <div className="order-2 flex flex-col gap-8 lg:order-1 lg:col-span-7">
          <div className="text-left">
            <h2 className="text-4xl font-bold tracking-tight text-black xl:text-5xl">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-3 text-lg text-black/60">{subtitle}</p>
            ) : null}
          </div>

          <div className="flex -mt-6 justify-center lg:justify-start">
            <div className="relative w-full max-w-[760px] sm:max-w-[880px] xl:max-w-[960px]">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={illustrationSrc}
                  alt="Auth illustration"
                  fill
                  priority
                  className="object-contain"
                  sizes="(max-width: 1024px) 85vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 mt-4 w-full lg:order-2 lg:col-span-5">
          <div className="mx-auto w-full max-w-[580px]">{children}</div>
        </div>
      </div>
    </section>
  );
}
