import { memo } from "react";
import { motion } from "framer-motion";

interface StadiumView3DProps {
  arenaImage?: string;
  weatherFilter?: string;
}

function StadiumView3D({ arenaImage, weatherFilter }: StadiumView3DProps) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Layer 1: Sky gradient */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, #020408 0%, #050810 20%, #0A1025 40%, #0D1229 60%)",
        zIndex: 0,
      }} />

      {/* Layer 2: Stadium background image */}
      <img
        src={arenaImage || "/assets/stadium-gameplay-bg.jpg"}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: 0.85,
          objectPosition: "center 40%",
          filter: weatherFilter,
          zIndex: 1,
        }}
      />

      {/* Layer 3: Floodlight atmosphere */}
      <div className="absolute inset-0" style={{
        zIndex: 2,
        background: [
          "radial-gradient(ellipse at 15% 5%, rgba(255,230,150,0.12) 0%, transparent 40%)",
          "radial-gradient(ellipse at 85% 5%, rgba(255,230,150,0.10) 0%, transparent 40%)",
          "radial-gradient(ellipse at 50% 65%, rgba(100,200,100,0.05) 0%, transparent 30%)",
        ].join(", "),
      }} />

      {/* Layer 4: Vignette */}
      <div className="absolute inset-0" style={{
        zIndex: 3,
        background: "radial-gradient(ellipse at 50% 60%, transparent 30%, rgba(0,0,0,0.45) 100%)",
      }} />

      {/* Layer 5: Pitch surface with perspective */}
      <div className="absolute" style={{
        bottom: "20%",
        left: "35%",
        width: "30%",
        height: "45%",
        zIndex: 4,
        background: [
          "repeating-linear-gradient(90deg, rgba(34,139,34,0.10) 0 20px, rgba(46,160,46,0.10) 20px 40px)",
          "linear-gradient(180deg, #1B5E20, #2E7D32, #1B5E20)",
        ].join(", "),
        transform: "perspective(800px) rotateX(35deg)",
        transformOrigin: "bottom center",
        borderRadius: "4px",
        opacity: 0.4,
      }}>
        {/* Batsman's crease */}
        <div className="absolute" style={{
          bottom: "15%", left: "20%", right: "20%", height: "2px",
          background: "rgba(255,255,255,0.5)",
          boxShadow: "0 0 4px rgba(0,255,136,0.3)",
        }} />
        {/* Bowler's crease */}
        <div className="absolute" style={{
          top: "15%", left: "25%", right: "25%", height: "1.5px",
          background: "rgba(255,255,255,0.35)",
        }} />
      </div>
    </div>
  );
}

export default memo(StadiumView3D);
