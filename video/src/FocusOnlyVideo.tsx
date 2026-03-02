import React from "react";
import {
  AbsoluteFill,
  Series,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
  staticFile,
} from "remotion";
import { Audio } from "@remotion/media";
import { ExtensionPopup } from "./components/ExtensionPopup";
import { BrowserMock } from "./components/BrowserMock";

// ─── Shared constants ────────────────────────────────────────────────────────
const BG = "#0a0a0a";
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function FadeText({
  children,
  delay = 0,
  style = {},
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
    durationInFrames: 18,
  });
  const opacity = interpolate(s, [0, 1], [0, 1]);
  const translateY = interpolate(s, [0, 1], [14, 0]);
  return (
    <div style={{ opacity, transform: `translateY(${translateY}px)`, ...style }}>
      {children}
    </div>
  );
}

// ─── Scene 1: Problem ────────────────────────────────────────────────────────
// 0–8s = 240 frames
function Scene1Problem() {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
        fontFamily: FONT,
      }}
    >
      <Audio src={staticFile("voiceover/scene1-problem.mp3")} />
      <FadeText delay={0}>
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "#ffffff",
            textAlign: "center",
            letterSpacing: -1,
          }}
        >
          You open 47 tabs a day.
        </div>
      </FadeText>
      <FadeText delay={18}>
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            color: "#6b7280",
            textAlign: "center",
          }}
        >
          Most of them waste your time.
        </div>
      </FadeText>
    </AbsoluteFill>
  );
}

// ─── Scene 2: Intro ──────────────────────────────────────────────────────────
// 8–18s = 300 frames
function Scene2Intro() {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 14,
        fontFamily: FONT,
      }}
    >
      <Audio src={staticFile("voiceover/scene2-intro.mp3")} />
      <FadeText delay={0}>
        <div style={{ fontSize: 64, textAlign: "center" }}>🚥</div>
      </FadeText>
      <FadeText delay={10}>
        <div
          style={{
            fontSize: 68,
            fontWeight: 800,
            color: "#ffffff",
            textAlign: "center",
            letterSpacing: -2,
          }}
        >
          FocusOnly
        </div>
      </FadeText>
      <FadeText delay={22}>
        <div
          style={{
            fontSize: 24,
            color: "#9ca3af",
            textAlign: "center",
            fontWeight: 400,
          }}
        >
          Know instantly. Leave. Read. Save.
        </div>
      </FadeText>
      <FadeText delay={36}>
        <div
          style={{
            marginTop: 8,
            display: "flex",
            gap: 10,
          }}
        >
          {[
            { label: "Leave", color: "#ef4444", bg: "#1f0a0a" },
            { label: "Read", color: "#22c55e", bg: "#0a1f0a" },
            { label: "Save", color: "#facc15", bg: "#1a1a0a" },
          ].map(({ label, color, bg }) => (
            <div
              key={label}
              style={{
                padding: "8px 20px",
                borderRadius: 999,
                backgroundColor: bg,
                border: `1px solid ${color}40`,
                color,
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </FadeText>
    </AbsoluteFill>
  );
}

// ─── Scene 3: Leave verdict ──────────────────────────────────────────────────
// 18–30s = 360 frames
function Scene3Leave() {
  return (
    <VerdictScene
      audioFile="voiceover/scene3-leave.mp3"
      verdict="Leave"
      score={18}
      reasons={[
        "Not related to your SaaS growth goals",
        "Enterprise-focused, irrelevant to indie builders",
      ]}
      url="techcrunch.com/enterprise/best-erp-systems-2026"
      tabs={[
        { title: "Best ERP Systems 2026 - TechCrunch", active: true },
        { title: "Your Dashboard", active: false },
      ]}
      articleTitle="Best Enterprise ERP Systems of 2026"
      articleBody="A comprehensive guide to the top enterprise resource planning solutions for Fortune 500 companies, including SAP, Oracle, and Microsoft Dynamics..."
      label="Not aligned with your goals."
    />
  );
}

// ─── Scene 4: Read verdict ───────────────────────────────────────────────────
// 30–43s = 390 frames
function Scene4Read() {
  return (
    <VerdictScene
      audioFile="voiceover/scene4-read.mp3"
      verdict="Read"
      score={84}
      reasons={[
        "Directly relevant to your product strategy",
        "Actionable pricing insights for B2B SaaS",
        "Matches your goal: grow MRR",
      ]}
      url="lenny.substack.com/p/saas-pricing-strategy-2026"
      tabs={[
        { title: "SaaS Pricing Strategy - Lenny's Newsletter", active: true },
        { title: "Your Dashboard", active: false },
      ]}
      articleTitle="How to Price Your B2B SaaS in 2026"
      articleBody="Pricing is one of the highest-leverage growth levers for SaaS founders. This guide covers value-based pricing, packaging strategies, and how top companies have grown MRR..."
      label="Worth your attention."
    />
  );
}

// ─── Scene 5: Save verdict ───────────────────────────────────────────────────
// 43–54s = 330 frames
function Scene5Save() {
  return (
    <VerdictScene
      audioFile="voiceover/scene5-save.mp3"
      verdict="Save"
      score={47}
      reasons={[
        "Good content but not urgent right now",
        "Useful reference for Q3 planning",
      ]}
      url="a16z.com/the-future-of-developer-tools"
      tabs={[
        { title: "The Future of Dev Tools - a16z", active: true },
        { title: "Your Dashboard", active: false },
      ]}
      articleTitle="The Future of Developer Tools"
      articleBody="Developer tooling is undergoing a fundamental transformation. AI-assisted development, cloud-native workflows, and the rise of the solo developer are reshaping how software gets built..."
      label="Good, but not right now."
    />
  );
}

// ─── Shared verdict scene layout ────────────────────────────────────────────
function VerdictScene({
  verdict,
  score,
  reasons,
  url,
  tabs,
  articleTitle,
  articleBody,
  label,
  audioFile,
}: {
  verdict: "Read" | "Save" | "Leave";
  score: number;
  reasons: string[];
  url: string;
  tabs: { title: string; active: boolean }[];
  articleTitle: string;
  articleBody: string;
  label: string;
  audioFile: string;
}) {
  const verdictColors = {
    Read: "#22c55e",
    Save: "#facc15",
    Leave: "#ef4444",
  };
  const color = verdictColors[verdict];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 20,
        fontFamily: FONT,
      }}
    >
      <Audio src={staticFile(audioFile)} />
      {/* Label above */}
      <FadeText delay={0}>
        <div
          style={{
            fontSize: 15,
            color: "#4b5563",
            letterSpacing: 0.5,
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          {label}
        </div>
      </FadeText>

      {/* Browser + popup side by side */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 16,
        }}
      >
        <BrowserMock
          url={url}
          tabs={tabs}
          articleTitle={articleTitle}
          articleBody={articleBody}
          delay={6}
        />
        <ExtensionPopup
          verdict={verdict}
          score={score}
          reasons={reasons}
          delay={18}
        />
      </div>

      {/* Verdict color accent line */}
      <Sequence from={20} layout="none">
        <VerdictAccent color={color} verdict={verdict} />
      </Sequence>
    </AbsoluteFill>
  );
}

function VerdictAccent({
  color,
  verdict,
}: {
  color: string;
  verdict: string;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 16 });
  const width = interpolate(s, [0, 1], [0, 200]);
  return (
    <div
      style={{
        height: 3,
        width,
        backgroundColor: color,
        borderRadius: 2,
        opacity: 0.6,
      }}
    />
  );
}

// ─── Scene 6: Features ──────────────────────────────────────────────────────
// 54–62s = 240 frames
function Scene6Features() {
  const features = [

    {
      icon: "🔑",
      title: "BYOK",
      body: "Your API key. Your data.\nNothing leaves your browser.",
    },
    {
      icon: "⚡",
      title: "Instant cache",
      body: "Revisit any page for free.\nResults cached locally.",
    },
    {
      icon: "🎯",
      title: "Profile-aware",
      body: "Tuned to your role, goals,\nand what you want to avoid.",
    },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 32,
        fontFamily: FONT,
      }}
    >
      <Audio src={staticFile("voiceover/scene6-features.mp3")} />
      <FadeText delay={0}>
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
          }}
        >
          Built for focus.
        </div>
      </FadeText>
      <div style={{ display: "flex", gap: 20 }}>
        {features.map((f, i) => (
          <FadeText key={f.title} delay={12 + i * 14}>
            <div
              style={{
                width: 220,
                backgroundColor: "#111111",
                border: "1px solid #1f1f1f",
                borderRadius: 12,
                padding: "20px 20px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#ffffff",
                  marginBottom: 6,
                }}
              >
                {f.title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  lineHeight: 1.5,
                  whiteSpace: "pre-line",
                }}
              >
                {f.body}
              </div>
            </div>
          </FadeText>
        ))}
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene 7: Outro ──────────────────────────────────────────────────────────
// 62–65s = 90 frames
function Scene7Outro() {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 12,
        fontFamily: FONT,
      }}
    >
      <Audio src={staticFile("voiceover/scene7-outro.mp3")} />
      <FadeText delay={0}>
        <div style={{ fontSize: 52, textAlign: "center" }}>🚥</div>
      </FadeText>
      <FadeText delay={8}>
        <div
          style={{
            fontSize: 58,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: -2,
          }}
        >
          FocusOnly
        </div>
      </FadeText>
      <FadeText delay={18}>
        <div style={{ fontSize: 20, color: "#9ca3af" }}>
          Focus on what matters.
        </div>
      </FadeText>
      <FadeText delay={28}>
        <div
          style={{
            marginTop: 12,
            padding: "10px 28px",
            borderRadius: 999,
            backgroundColor: "#ffffff",
            color: "#000000",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: 0.2,
          }}
        >
          Download at focusonly.com
        </div>
      </FadeText>
    </AbsoluteFill>
  );
}

// ─── Main composition ────────────────────────────────────────────────────────
export const FocusOnlyDemo: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      {/* Background music — loops at low volume throughout */}
      <Audio
        src={staticFile("music/background.mp3")}
        loop
        volume={0.12}
      />
      <Series>
        <Series.Sequence durationInFrames={6 * fps} premountFor={fps}>
          <Scene1Problem />
        </Series.Sequence>
        <Series.Sequence durationInFrames={8 * fps} premountFor={fps}>
          <Scene2Intro />
        </Series.Sequence>
        <Series.Sequence durationInFrames={10 * fps} premountFor={fps}>
          <Scene3Leave />
        </Series.Sequence>
        <Series.Sequence durationInFrames={9 * fps} premountFor={fps}>
          <Scene4Read />
        </Series.Sequence>
        <Series.Sequence durationInFrames={7 * fps} premountFor={fps}>
          <Scene5Save />
        </Series.Sequence>
        <Series.Sequence durationInFrames={7 * fps} premountFor={fps}>
          <Scene6Features />
        </Series.Sequence>
        <Series.Sequence durationInFrames={5 * fps} premountFor={fps}>
          <Scene7Outro />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
