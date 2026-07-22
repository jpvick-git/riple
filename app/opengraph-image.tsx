import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Riple — Explore What Happens Next";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(145deg, #07090f 0%, #10141f 55%, #151a28 100%)",
          color: "#f5f7fb",
          fontFamily: "ui-sans-serif, system-ui, sans-serif"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#8fb3ff",
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: "-0.03em"
          }}
        >
          Riple
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.04em"
            }}
          >
            Change one thing. Follow every riple.
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.35,
              color: "#9aa4b8",
              maxWidth: 820
            }}
          >
            Explore the timeline of consequences that spreads from a single what-if.
          </div>
        </div>

        <div style={{ display: "flex", color: "#d5e2ff", fontSize: 24 }}>riple.me</div>
      </div>
    ),
    {
      ...size
    }
  );
}
