import { writeFileSync, mkdirSync } from "fs";

// George - Warm, Captivating Storyteller
const VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";
const MODEL_ID = "eleven_multilingual_v2";
const OUT_DIR = "public/voiceover";

const SCENES = [
  {
    id: "scene1-problem",
    text: "Every day, you open dozens of tabs. Most of them don't align with your actual goals.",
  },
  {
    id: "scene2-intro",
    text: "FocusOnly is a Chrome extension that instantly tells you whether a page is worth your attention — Leave, Read, or Save.",
  },
  {
    id: "scene3-leave",
    text: "This enterprise ERP article? Not relevant to your goals as a SaaS builder. Score: eighteen. FocusOnly says — leave it.",
  },
  {
    id: "scene4-read",
    text: "But this piece on B2B SaaS pricing? Directly aligned with your goal to grow MRR. Score: eighty-four. Read it now.",
  },
  {
    id: "scene5-save",
    text: "And this article on developer tools? Good content, but not urgent. Score: forty-seven. Save it for later.",
  },
  {
    id: "scene6-features",
    text: "Your API key, your data. Results cached locally. Every verdict tuned to your personal profile.",
  },
  {
    id: "scene7-outro",
    text: "FocusOnly. Download it now at focusonly dot com.",
  },
];

async function generateScene(id: string, text: string): Promise<void> {
  console.log(`Generating: ${id}`);

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.2,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs error for ${id}: ${response.status} — ${err}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(`${OUT_DIR}/${id}.mp3`, audioBuffer);
  console.log(`  ✓ Saved ${OUT_DIR}/${id}.mp3 (${audioBuffer.length} bytes)`);
}

async function main() {
  if (!process.env.ELEVENLABS_API_KEY) {
    console.error("Missing ELEVENLABS_API_KEY");
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  for (const scene of SCENES) {
    await generateScene(scene.id, scene.text);
  }

  console.log("\nAll voiceover files generated.");
}

main();
