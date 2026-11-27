"use client";

import React, { useEffect, useRef } from "react";

export interface Twin3DCanvasProps {
  riskScore: number;
  quarantinedCount: number;
}

export default function Twin3DCanvas({ riskScore, quarantinedCount }: Twin3DCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId = 0;
    let angle = 0;

    const nodes = Array.from({ length: 18 }, (_, i) => {
      const layer = Math.floor(i / 6);
      const idx = i % 6;
      const theta = (idx / 6) * Math.PI * 2;
      return {
        id: i,
        x: Math.cos(theta) * (92 + layer * 20),
        y: (layer - 1) * 64,
        z: Math.sin(theta) * (92 + layer * 20),
        quarantined: i < quarantinedCount,
      };
    });

    const render = () => {
      angle += 0.012;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, w, h);

      const projected = nodes.map((n) => {
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        const rx = n.x * cosA - n.z * sinA;
        const rz = n.x * sinA + n.z * cosA;
        const fov = 320 / (320 + rz);
        return {
          ...n,
          sx: w / 2 + rx * fov * 1.35,
          sy: h / 2 + n.y * fov * 1.15,
          scale: fov,
        };
      });

      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dist = Math.hypot(
            projected[i].x - projected[j].x,
            projected[i].y - projected[j].y,
            projected[i].z - projected[j].z
          );
          if (dist < 135) {
            ctx.strokeStyle =
              projected[i].quarantined || projected[j].quarantined
                ? "rgba(244, 63, 94, 0.45)"
                : "rgba(56, 189, 248, 0.3)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(projected[i].sx, projected[i].sy);
            ctx.lineTo(projected[j].sx, projected[j].sy);
            ctx.stroke();
          }
        }
      }

      for (const p of projected) {
        const r = Math.max(4, 7 * p.scale);
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
        if (p.quarantined || riskScore >= 0.6) {
          ctx.fillStyle = "#f43f5e";
        } else if (riskScore >= 0.3) {
          ctx.fillStyle = "#f59e0b";
        } else {
          ctx.fillStyle = "#10b981";
        }
        ctx.fill();
        ctx.strokeStyle = "#f8fafc";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameId);
  }, [riskScore, quarantinedCount]);

  return (
    <canvas
      ref={canvasRef}
      width={620}
      height={290}
      style={{ width: "100%", height: "290px", borderRadius: "0.5rem", border: "1px solid var(--border-hairline)" }}
    />
  );
}
