"use client";
import React from "react";

interface HamsterWheelProps {
  /** Hệ số phóng to/thu nhỏ toàn bộ animation (1 = mặc định) */
  scale?: number;
  /** Điều chỉnh tốc độ chạy của hamster (số giây / vòng quay, mặc định 1) */
  speed?: number;
}

const HamsterWheel: React.FC<HamsterWheelProps> = ({ scale = 1, speed = 1 }) => {
  return (
    <div
      className="hamster-wrapper"
      style={
        {
          "--scale": scale,
          "--dur": `${speed}s`,
        } as React.CSSProperties
      }
    >
      <div
        aria-label="Orange and tan hamster running in a metal wheel"
        role="img"
        className="wheel-and-hamster"
      >
        <div className="wheel"></div>
        <div className="hamster">
          <div className="hamster__body">
            <div className="hamster__head">
              <div className="hamster__ear"></div>
              <div className="hamster__eye"></div>
              <div className="hamster__nose"></div>
            </div>
            <div className="hamster__limb hamster__limb--fr"></div>
            <div className="hamster__limb hamster__limb--fl"></div>
            <div className="hamster__limb hamster__limb--br"></div>
            <div className="hamster__limb hamster__limb--bl"></div>
            <div className="hamster__tail"></div>
          </div>
        </div>
        <div className="spoke"></div>
      </div>
    </div>
  );
};

export default HamsterWheel;
