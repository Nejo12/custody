import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(_request: NextRequest) {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "30px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            Custody Clarity
          </div>
          <div
            style={{
              fontSize: 36,
              color: "#e5e5e5",
              maxWidth: "900px",
              lineHeight: "1.4",
            }}
          >
            Know your custody and contact rights in Germany
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#a3a3a3",
              marginTop: "40px",
            }}
          >
            Free 6-minute guided interview • Available in 7 languages
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
