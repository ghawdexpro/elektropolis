/**
 * Generate category banner images for ElektroPolis using NanoBanana Pro (Gemini 3 Pro Image)
 * Uses Google Cloud credentials from whitebox project
 *
 * Usage: npx tsx scripts/generate-category-images.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { GoogleAuth } from "google-auth-library";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// ── Google Cloud config ──────────────────────────────────────
const GOOGLE_CLOUD_PROJECT = "primal-turbine-478412-k9";
const GOOGLE_APPLICATION_CREDENTIALS_JSON = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

// If credentials aren't in env, load from whitebox
const CREDS_PATH = "/Users/maciejpopiel/white-box/apps/whitebox/.env.local";

function getGoogleCreds(): string {
  if (GOOGLE_APPLICATION_CREDENTIALS_JSON) return GOOGLE_APPLICATION_CREDENTIALS_JSON;

  // Read from whitebox .env.local
  const envContent = fs.readFileSync(CREDS_PATH, "utf-8");
  const match = envContent.match(/GOOGLE_APPLICATION_CREDENTIALS_JSON=(.*)/);
  if (!match) throw new Error("Could not find GOOGLE_APPLICATION_CREDENTIALS_JSON");
  return match[1];
}

// ── Auth ─────────────────────────────────────────────────────
let authClient: GoogleAuth | null = null;

async function getAuthClient(): Promise<GoogleAuth> {
  if (authClient) return authClient;
  const creds = JSON.parse(getGoogleCreds());
  authClient = new GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  return authClient;
}

async function getAccessToken(): Promise<string> {
  const auth = await getAuthClient();
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  if (!token) throw new Error("Failed to get access token");
  return token;
}

// ── Image Generation ─────────────────────────────────────────
interface ImageResult {
  imageBase64: string;
  mimeType: string;
}

async function generateImage(
  prompt: string,
  aspectRatio: string = "4:3",
  retries = 3
): Promise<ImageResult> {
  const accessToken = await getAccessToken();
  const model = "gemini-2.0-flash-exp"; // Flash for speed + reliability
  const location = "us-central1";

  const baseUrl = `https://${location}-aiplatform.googleapis.com/v1`;
  const endpoint = `${baseUrl}/projects/${GOOGLE_CLOUD_PROJECT}/locations/${location}/publishers/google/models/${model}:generateContent`;

  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: { aspectRatio },
    },
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    console.log(`  Attempt ${attempt}/${retries}...`);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120_000),
      });

      if (response.status === 429) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`  Rate limited, waiting ${delay / 1000}s...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API error ${response.status}: ${error}`);
      }

      const result = (await response.json()) as any;
      const candidate = result.candidates?.[0];

      if (!candidate?.content?.parts) {
        throw new Error("No content in response");
      }

      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return {
            imageBase64: part.inlineData.data,
            mimeType: part.inlineData.mimeType || "image/png",
          };
        }
      }

      throw new Error("No image in response parts");
    } catch (err: any) {
      if (attempt === retries) throw err;
      console.log(`  Error: ${err.message}, retrying...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  throw new Error("All retries exhausted");
}

// ── Supabase Upload ──────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function uploadToStorage(
  imageBase64: string,
  mimeType: string,
  filename: string
): Promise<string> {
  const buffer = Buffer.from(imageBase64, "base64");
  const ext = mimeType.includes("png") ? "png" : mimeType.includes("webp") ? "webp" : "jpg";
  const storagePath = `category-banners/${filename}.${ext}`;

  const { error } = await supabase.storage
    .from("site-assets")
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from("site-assets").getPublicUrl(storagePath);
  return data.publicUrl;
}

// ── ElektroPolis Brand Prompts ───────────────────────────────
// Brand identity: Mediterranean warmth meets modern minimalism
// Colors: Vibrant orange (#FF580D), warm charcoal (#2A2B2A), warm whites
// Feeling: Premium but accessible, warm sunlight, Maltese/Mediterranean

const CATEGORIES = [
  {
    slug: "kitchen-sinks",
    title: "Kitchen Sinks",
    prompt: `A stunning premium kitchen sink in a beautiful modern Mediterranean kitchen.
The sink is a large stainless steel or granite composite sink, freshly installed.
Setting: Bright modern kitchen with natural warm sunlight streaming through a window,
limestone countertop, olive branch in a ceramic vase nearby, clean and minimal.
Style: Professional interior photography, shallow depth of field on the sink,
warm golden-hour lighting, aspirational lifestyle feel.
Mood: Clean, fresh, premium quality. No people, no text overlays.
Quality: 4K photorealistic, commercial grade, magazine quality.`,
  },
  {
    slug: "sink-mixers",
    title: "Sink Mixers",
    prompt: `An elegant designer kitchen mixer tap in brushed chrome or matte black finish.
Close-up hero shot showing the beautiful curves and finish of a modern pull-out spray mixer.
Setting: Mounted on a marble or quartz countertop next to a premium sink,
with soft warm backlighting, a small herb plant nearby.
Style: Product hero photography with lifestyle context, shallow depth of field,
warm Mediterranean light, premium brand aesthetic.
Mood: Sophisticated, designer, precise craftsmanship. No people, no text.
Quality: 4K photorealistic, commercial advertising quality.`,
  },
  {
    slug: "cooker-hoods",
    title: "Cooker Hoods",
    prompt: `A sleek modern chimney cooker hood in stainless steel mounted above a professional range cooker.
Setting: Beautiful modern kitchen with warm ambient lighting, the hood's LED strip illuminated,
creating a warm glow over the cooking area. Clean worktops, a few premium cooking ingredients.
Style: Architectural interior photography, dramatic lighting highlighting the hood's design,
warm tones, professional composition.
Mood: Powerful, modern, the heart of a chef's kitchen. No people, no text overlays.
Quality: 4K photorealistic, interior design magazine quality.`,
  },
  {
    slug: "washing-machines",
    title: "Washing Machines",
    prompt: `A premium white freestanding washing machine in a bright, modern laundry room.
The machine is a front-loader with a sleek digital display panel.
Setting: Clean, airy utility room with natural daylight, white walls,
a neat stack of fresh towels on a shelf above, a small succulent plant.
Style: Lifestyle product photography, clean composition, bright and airy feel,
warm daylight casting soft shadows.
Mood: Fresh, efficient, modern living. No people, no text overlays.
Quality: 4K photorealistic, commercial appliance photography.`,
  },
  {
    slug: "air-treatment",
    title: "Air Treatment",
    prompt: `A modern split air conditioner indoor unit mounted on a warm-toned wall
in a beautiful Mediterranean living room.
Setting: Bright sunny living room with arched doorway, natural stone elements,
sheer curtains gently moving, view of blue sky through the window.
The AC unit is sleek and minimal, blending with the decor.
Style: Lifestyle interior photography, warm Mediterranean light,
showing comfort and coolness in contrast to the sunny exterior.
Mood: Cool comfort, Mediterranean living, serene. No people, no text.
Quality: 4K photorealistic, premium home magazine quality.`,
  },
  {
    slug: "refrigeration",
    title: "Refrigeration",
    prompt: `A premium stainless steel fridge freezer in a modern kitchen setting.
The fridge is large, side-by-side or French door style, gleaming and impressive.
Setting: Spacious modern kitchen with warm wood accents, marble island,
soft warm lighting, fresh fruits on the counter nearby.
Style: Lifestyle product photography, the fridge as the centerpiece,
warm inviting kitchen atmosphere, professional composition.
Mood: Premium, spacious, the heart of a modern home. No people, no text.
Quality: 4K photorealistic, appliance brand campaign quality.`,
  },
];

// ── Main ─────────────────────────────────────────────────────
async function main() {
  console.log("═══════════════════════════════════════════════");
  console.log("  ElektroPolis: Category Image Generation");
  console.log("  Using NanoBanana (Gemini Image) via Vertex AI");
  console.log("═══════════════════════════════════════════════\n");

  // Ensure output directory for local backups
  const outDir = path.join(__dirname, "category-images");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const results: { slug: string; title: string; url: string }[] = [];

  for (const cat of CATEGORIES) {
    console.log(`\n[${cat.title}] Generating image...`);

    try {
      const result = await generateImage(cat.prompt, "4:3");

      // Save local backup
      const ext = result.mimeType.includes("png") ? "png" : "jpg";
      const localPath = path.join(outDir, `${cat.slug}.${ext}`);
      fs.writeFileSync(localPath, Buffer.from(result.imageBase64, "base64"));
      console.log(`  Saved locally: ${localPath}`);

      // Upload to Supabase
      const publicUrl = await uploadToStorage(result.imageBase64, result.mimeType, cat.slug);
      console.log(`  Uploaded: ${publicUrl}`);

      results.push({ slug: cat.slug, title: cat.title, url: publicUrl });

      // Small delay between generations
      await new Promise((r) => setTimeout(r, 3000));
    } catch (err: any) {
      console.error(`  FAILED: ${err.message}`);
    }
  }

  console.log("\n═══════════════════════════════════════════════");
  console.log("  Generation Complete!");
  console.log("═══════════════════════════════════════════════\n");

  for (const r of results) {
    console.log(`  ${r.title}: ${r.url}`);
  }

  // Write URLs to JSON for easy reference
  const urlsPath = path.join(outDir, "urls.json");
  fs.writeFileSync(urlsPath, JSON.stringify(results, null, 2));
  console.log(`\n  URLs saved to: ${urlsPath}`);
  console.log(`  ${results.length}/${CATEGORIES.length} images generated successfully`);
}

main().catch(console.error);
