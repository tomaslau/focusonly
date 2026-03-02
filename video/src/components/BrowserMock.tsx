import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";

type Tab = { title: string; active: boolean };

type Props = {
  url: string;
  tabs: Tab[];
  articleTitle: string;
  articleBody: string;
  delay?: number;
};

export const BrowserMock: React.FC<Props> = ({
  url,
  tabs,
  articleTitle,
  articleBody,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
    durationInFrames: 22,
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const scale = interpolate(entrance, [0, 1], [0.97, 1]);

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        width: 680,
        backgroundColor: "#ffffff",
        borderRadius: 10,
        boxShadow: "0 4px 24px rgba(0,0,0,0.22)",
        overflow: "hidden",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Window chrome */}
      <div
        style={{
          backgroundColor: "#f3f4f6",
          padding: "8px 12px 0",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          {["#ff5f57", "#ffbd2e", "#28ca41"].map((c, i) => (
            <div
              key={i}
              style={{
                width: 11,
                height: 11,
                borderRadius: "50%",
                backgroundColor: c,
              }}
            />
          ))}
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 2 }}>
          {tabs.map((tab, i) => (
            <div
              key={i}
              style={{
                padding: "5px 14px",
                borderRadius: "6px 6px 0 0",
                backgroundColor: tab.active ? "#ffffff" : "#e9eaec",
                fontSize: 11,
                color: tab.active ? "#111827" : "#9ca3af",
                fontWeight: tab.active ? 500 : 400,
                maxWidth: 140,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {tab.title}
            </div>
          ))}
        </div>
      </div>

      {/* Address bar */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "8px 12px",
          borderBottom: "1px solid #f3f4f6",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {/* Nav arrows */}
        {["‹", "›"].map((a, i) => (
          <span
            key={i}
            style={{ fontSize: 16, color: "#9ca3af", fontWeight: 300 }}
          >
            {a}
          </span>
        ))}
        <div
          style={{
            flex: 1,
            backgroundColor: "#f3f4f6",
            borderRadius: 6,
            padding: "4px 10px",
            fontSize: 11,
            color: "#6b7280",
          }}
        >
          🔒 {url}
        </div>
      </div>

      {/* Page content */}
      <div style={{ padding: "20px 24px", minHeight: 200 }}>
        <div
          style={{
            fontSize: 10,
            color: "#9ca3af",
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          ARTICLE
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#111827",
            marginBottom: 10,
            lineHeight: 1.3,
          }}
        >
          {articleTitle}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#6b7280",
            lineHeight: 1.6,
          }}
        >
          {articleBody}
        </div>

        {/* Fake content lines */}
        {[0.9, 1.0, 0.75, 0.85, 0.6].map((w, i) => (
          <div
            key={i}
            style={{
              height: 8,
              borderRadius: 4,
              backgroundColor: "#f3f4f6",
              marginTop: 8,
              width: `${w * 100}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
