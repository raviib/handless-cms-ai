import { NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";

// ─── Best free model via HF Inference Providers ───────────────────────────────
// Qwen2.5-72B-Instruct: top-tier free model, excellent instruction following
const MODEL = "Qwen/Qwen2.5-72B-Instruct";

// ─── Utility: safely extract JSON from AI text ───────────────────────────────
export function cleanAIResponse(text) {
    try {
        // Strip markdown code fences if present
        const stripped = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
        const start = stripped.indexOf("{");
        const end = stripped.lastIndexOf("}");
        if (start === -1 || end === -1) throw new Error("No JSON object found");
        return JSON.parse(stripped.slice(start, end + 1));
    } catch {
        return null;
    }
}

// ─── Fetch & parse sitemap XML → array of URLs ───────────────────────────────
async function fetchSitemapUrls(siteUrl) {
    try {
        const base = siteUrl.replace(/\/$/, "");
        const res = await fetch(`${base}/sitemap.xml`, {
            signal: AbortSignal.timeout(8000),
            headers: { "User-Agent": "SEO-Bot/1.0" },
        });
        if (!res.ok) return [];
        const xml = await res.text();
        const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/gi)];
        return matches.map((m) => m[1].trim()).filter(Boolean).slice(0, 30); // cap at 30 URLs
    } catch {
        return [];
    }
}

// ─── Fetch page HTML → extract readable text (title + meta + headings + text) ─
async function fetchPageContext(url) {
    try {
        const res = await fetch(url, {
            signal: AbortSignal.timeout(6000),
            headers: { "User-Agent": "SEO-Bot/1.0" },
        });
        if (!res.ok) return null;
        const html = await res.text();

        const title = html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1]?.trim() || "";
        const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["'](.*?)["']/i)?.[1]?.trim() || "";
        const h1s = [...html.matchAll(/<h1[^>]*>(.*?)<\/h1>/gi)].map((m) => m[1].replace(/<[^>]+>/g, "").trim());
        const h2s = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)].map((m) => m[1].replace(/<[^>]+>/g, "").trim()).slice(0, 5);

        // Extract visible text from body (strip tags, collapse whitespace)
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || "";
        const bodyText = bodyMatch
            .replace(/<script[\s\S]*?<\/script>/gi, "")
            .replace(/<style[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 600); // keep first 600 chars of body text

        return { url, title, metaDesc, h1s, h2s, bodyText };
    } catch {
        return null;
    }
}

// ─── Build site context string from sitemap ──────────────────────────────────
async function buildSiteContext(siteUrl) {
    if (!siteUrl) return "";

    const urls = await fetchSitemapUrls(siteUrl);
    if (!urls.length) {
        // Fallback: try to fetch homepage only
        const home = await fetchPageContext(siteUrl);
        if (!home) return "";
        return `WEBSITE CONTEXT (homepage):
Title: ${home.title}
Description: ${home.metaDesc}
H1: ${home.h1s.join(" | ")}
H2: ${home.h2s.join(" | ")}
Content: ${home.bodyText}`;
    }

    // Fetch homepage + up to 4 key pages concurrently
    const toFetch = [siteUrl, ...urls.filter((u) => u !== siteUrl).slice(0, 4)];
    const pages = await Promise.all(toFetch.map(fetchPageContext));
    const valid = pages.filter(Boolean);

    if (!valid.length) return "";

    const summary = valid
        .map(
            (p) =>
                `URL: ${p.url}\nTitle: ${p.title}\nH1: ${p.h1s.join(" | ")}\nH2: ${p.h2s.join(" | ")}\nContent: ${p.bodyText}`
        )
        .join("\n\n---\n\n");

    return `WEBSITE CONTEXT (${valid.length} pages analyzed from sitemap):\n\n${summary}`;
}

// ─── Default fallback SEO ─────────────────────────────────────────────────────
const DEFAULT_SEO = {
    title: "Untitled Page",
    metaTitle: "Untitled Page",
    metaDescription: "No description available.",
    keywords: [],
    canonicalUrl: "",
    openGraph: { ogTitle: "", ogDescription: "", ogImage: "" },
};

// ─── POST /api/seo/generate ───────────────────────────────────────────────────
export async function POST(request) {
    try {
        const body = await request.json();
        const { pageData, siteUrl } = body;

        if (!pageData || typeof pageData !== "object") {
            return NextResponse.json(
                { success: false, message: "pageData is required and must be an object" },
                { status: 400 }
            );
        }

        if (!process.env.HF_API_KEY) {
            return NextResponse.json(
                { success: false, message: "HF_API_KEY is not configured", seo: DEFAULT_SEO },
                { status: 500 }
            );
        }

        // Build site context from sitemap (if siteUrl provided)
        const resolvedSiteUrl = siteUrl || process.env.SEO_SITE_URL || "";
        const siteContext = resolvedSiteUrl ? await buildSiteContext(resolvedSiteUrl) : "";

        const systemPrompt = `You are a world-class SEO strategist specializing in CMS-driven websites.
Your task is to generate highly optimized, production-ready SEO metadata for a webpage.

SEO RULES YOU MUST FOLLOW:
- title: Page display title, natural and descriptive (max 60 chars)
- metaTitle: SEO title tag, include primary keyword near the start (50-60 chars)
- metaDescription: Compelling summary with CTA, include keywords naturally (150-160 chars)
- keywords: Array of 6-10 highly relevant, specific long-tail keywords
- canonicalUrl: Clean URL path (e.g. /category/laminates) — derive from slug or name in pageData
- openGraph.ogTitle: Social share title, engaging and click-worthy (max 60 chars)
- openGraph.ogDescription: Social share description, benefit-focused (max 200 chars)
- openGraph.ogImage: Leave empty string "" — image will be set manually

${siteContext ? siteContext : ""}

CRITICAL: Return ONLY a raw JSON object. No markdown. No explanation. No code fences.`;

        const userPrompt = `Generate complete SEO metadata for this CMS page:

${JSON.stringify(pageData, null, 2)}

Return ONLY this exact JSON structure with all fields filled:
{
  "title": "",
  "metaTitle": "",
  "metaDescription": "",
  "keywords": [],
  "canonicalUrl": "",
  "openGraph": {
    "ogTitle": "",
    "ogDescription": "",
    "ogImage": ""
  }
}`;

        const hf = new HfInference(process.env.HF_API_KEY);

        const response = await hf.chatCompletion({
            model: MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            max_tokens: 600,
            temperature: 0.2, // low temp = consistent, structured output
        });

        const rawText = response?.choices?.[0]?.message?.content || "";

        if (!rawText.trim()) {
            return NextResponse.json(
                { success: true, message: "Empty AI response, using defaults", seo: DEFAULT_SEO },
                { status: 200 }
            );
        }

        const parsed = cleanAIResponse(rawText);

        if (!parsed) {
            return NextResponse.json(
                { success: true, message: "Could not parse AI response, using defaults", seo: DEFAULT_SEO },
                { status: 200 }
            );
        }

        const seo = {
            title: (parsed.title || DEFAULT_SEO.title),
            metaTitle: (parsed.metaTitle || parsed.title || DEFAULT_SEO.metaTitle),
            metaDescription: (parsed.metaDescription || DEFAULT_SEO.metaDescription),
            keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
            canonicalUrl: parsed.canonicalUrl || "",
            openGraph: {
                ogTitle: (parsed.openGraph?.ogTitle || ""),
                ogDescription: (parsed.openGraph?.ogDescription || ""),
                ogImage: parsed.openGraph?.ogImage || "",
            },
        };

        return NextResponse.json({ success: true, seo }, { status: 200 });
    } catch (error) {
        console.error("[SEO Generate] Error:", error.message);
        return NextResponse.json(
            { success: false, message: error.message || "AI generation failed", seo: DEFAULT_SEO },
            { status: 500 }
        );
    }
}
