import { ImageResponse } from "next/og";

export const alt = "RVYK — Afrel Zharif Muflih, web developer and cybersecurity enthusiast";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "#000000",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", fontSize: 180, fontWeight: 800, letterSpacing: -6 }}>
          RVYK<span style={{ color: "#6A00FF" }}>.</span>
        </div>
        <div style={{ fontSize: 40, opacity: 0.7, marginTop: 8 }}>
          Afrel Zharif Muflih · Web developer & cybersecurity enthusiast
        </div>
      </div>
    ),
    size,
  );
}
