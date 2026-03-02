import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";

type VerdictType = "Read" | "Save" | "Leave";

const VERDICT_CONFIG = {
  Read: {
    color: "#22c55e",
    bgLight: "#f0fdf4",
    textColor: "#15803d",
    label: "Read",
    dot: "#22c55e",
  },
  Save: {
    color: "#facc15",
    bgLight: "#fefce8",
    textColor: "#a16207",
    label: "Save",
    dot: "#eab308",
  },
  Leave: {
    color: "#ef4444",
    bgLight: "#fef2f2",
    textColor: "#b91c1c",
    label: "Leave",
    dot: "#ef4444",
  },
};

type Props = {
  verdict: VerdictType;
  score: number;
  reasons: string[];
  delay?: number;
};

export const ExtensionPopup: React.FC<Props> = ({
  verdict,
  score,
  reasons,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cfg = VERDICT_CONFIG[verdict];

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [16, 0]);

  const scoreWidth = interpolate(
    frame - delay - 10,
    [0, 25],
    [0, score],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        width: 280,
        backgroundColor: "#ffffff",
        borderRadius: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderBottom: "1px solid #f3f4f6",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16 }}>🚥</span>
          <span
            style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}
          >
            FocusOnly
          </span>
        </div>
        <div
          style={{
            width: 34,
            height: 18,
            borderRadius: 9,
            backgroundColor: "#22c55e",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 2,
              left: "auto",
              right: 2,
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: "#fff",
              boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
            }}
          />
        </div>
      </div>

      {/* Verdict body */}
      <div style={{ padding: "12px 14px" }}>
        {/* Verdict badge */}
        <div
          style={{
            backgroundColor: cfg.bgLight,
            borderRadius: 8,
            padding: "10px 12px",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: cfg.dot,
              }}
            />
            <span
              style={{
                fontWeight: 700,
                fontSize: 17,
                color: cfg.textColor,
              }}
            >
              {cfg.label}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 60,
                height: 6,
                backgroundColor: "#e5e7eb",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${scoreWidth}%`,
                  backgroundColor: cfg.color,
                  borderRadius: 3,
                }}
              />
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: cfg.textColor,
              }}
            >
              {score}
            </span>
          </div>
        </div>

        {/* Reasons */}
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {reasons.map((reason, i) => {
            const reasonOpacity = interpolate(
              frame - delay - 15 - i * 8,
              [0, 12],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 6,
                  marginBottom: 5,
                  opacity: reasonOpacity,
                }}
              >
                <span style={{ color: "#d1d5db", marginTop: 1, fontSize: 11 }}>
                  •
                </span>
                <span style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.4 }}>
                  {reason}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
