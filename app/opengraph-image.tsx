import { ImageResponse } from "next/og";
import { BLOCKS, VB_W, VB_H } from "@/components/logoBlocks";

export const alt = "RVYK logo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LOGO_W = 640; // logo width in the 1200x630 card

export default function Image() {
  const scale = LOGO_W / VB_W;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        <div style={{ position: "relative", display: "flex", width: LOGO_W, height: VB_H * scale }}>
          {BLOCKS.map((b, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: b.x * scale,
                top: b.y * scale,
                width: b.w * scale,
                height: b.h * scale,
                background: b.color,
              }}
            />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
