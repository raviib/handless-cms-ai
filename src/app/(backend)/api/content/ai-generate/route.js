import { NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";

const MODEL = "Qwen/Qwen2.5-72B-Instruct";

function cleanJsonResponse(text) {
    try {
        const stripped = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
        const start = stripped.indexOf("{");
        const end = stripped.lastIndexOf("}");
        if (start === -1 || end === -1) throw new Error("No JSON object found");
        return JSON.parse(stripped.slice(start, end + 1));
    } catch {
        return null;
    }
}

// ─── Types that AI can generate text for ─────────────────────────────────────
const GENERATABLE_TYPES = new Set([
    "text", "rich-text-blocks", "rich-text-markdown",
    "number", "date", "enumeration", "uid",
]);

// ─── Build the JSON schema skeleton that mirrors DEFAULT_OBJECT ───────────────
// Returns { schema, fieldDescriptions }
// schema        → the exact JSON shape the AI must fill
// fieldDescriptions → human-readable instructions per field for the prompt
function buildSchemaFromSections(sections) {
    const schema = {};
    const fieldDescriptions = [];

    function getDefaultForType(field) {
        const type = field.type;
        if (type === "boolean") return false;
        if (type === "number") return 0;
        if (type === "date") return "";
        if (type === "relation") return field.isMultiple ? [] : null;
        if (type === "media") return field.isMulti ? [] : "";
        if (type === "enumeration" && field.enumeration_type === "multiple") return [];
        return "";
    }

    function describeField(path, field, indent = "") {
        const type = field.type;
        const label = field.Printvalue || (field.field?.value ?? field.field);
        const aiHint = field.aiPrompt ? ` — ${field.aiPrompt.replace(/\n/g, " ").trim()}` : "";

        if (type === "text" || type === "uid") {
            return `${indent}"${path}": string (short text)${aiHint}`;
        }
        if (type === "rich-text-blocks") {
            return `${indent}"${path}": string (plain text, paragraphs ok)${aiHint}`;
        }
        if (type === "rich-text-markdown") {
            return `${indent}"${path}": string (HTML formatted)${aiHint}`;
        }
        if (type === "number") {
            return `${indent}"${path}": number${aiHint}`;
        }
        if (type === "date") {
            return `${indent}"${path}": string (ISO date, e.g. "2024-01-15")${aiHint}`;
        }
        if (type === "enumeration") {
            const opts = field.option_value ? field.option_value.split(",").map(s => s.trim()) : [];
            return `${indent}"${path}": one of [${opts.map(o => `"${o}"`).join(", ")}]${aiHint}`;
        }
        return null;
    }

    function walkFields(fields, schemaTarget, pathPrefix = "", indent = "") {
        for (const field of fields) {
            const key = field.field?.value ?? field.field;
            if (!key) continue;
            const path = pathPrefix ? `${pathPrefix}.${key}` : key;

            if (field.type === "component") {
                if (field.component_type === "repeatable") {
                    // Repeatable → array with one example object
                    const itemSchema = {};
                    const itemDescs = [];
                    fieldDescriptions.push(`${indent}"${path}": array of objects, generate 2–3 items:`);
                    walkFields(field.fields || [], itemSchema, "", indent + "  ");
                    schemaTarget[key] = [itemSchema];
                } else {
                    // Single component → nested object
                    schemaTarget[key] = {};
                    fieldDescriptions.push(`${indent}"${path}": object:`);
                    walkFields(field.fields || [], schemaTarget[key], path, indent + "  ");
                }
                continue;
            }

            // Skip non-generatable types (media, relation, boolean)
            if (!GENERATABLE_TYPES.has(field.type)) {
                schemaTarget[key] = getDefaultForType(field);
                continue;
            }

            // Set placeholder in schema
            if (field.type === "number") schemaTarget[key] = 0;
            else if (field.type === "date") schemaTarget[key] = "";
            else schemaTarget[key] = "";

            const desc = describeField(path, field, indent);
            if (desc) fieldDescriptions.push(desc);
        }
    }

    for (const section of sections) {
        if (Array.isArray(section.fields)) {
            walkFields(section.fields, schema);
        }
    }

    return { schema, fieldDescriptions };
}

// ─── Collect only aiEnabled fields for user-input context ────────────────────
function collectAiEnabledFields(sections) {
    const fields = [];
    function walk(fieldList) {
        for (const field of fieldList) {
            const key = field.field?.value ?? field.field;
            if (!key) continue;
            if (field.type === "component" && Array.isArray(field.fields)) {
                walk(field.fields);
            } else if (field.aiEnabled === true) {
                fields.push({ key, label: field.Printvalue || key, aiPrompt: field.aiPrompt || "" });
            }
        }
    }
    for (const section of sections) {
        if (Array.isArray(section.fields)) walk(section.fields);
    }
    return fields;
}

/**
 * POST /api/content/ai-generate
 * Body: { userInputs, sections, moduleAiPrompt, locale }
 * Returns: { success: true, data: object }  ← data matches DEFAULT_OBJECT shape
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { userInputs = {}, sections = [], moduleAiPrompt = "", locale = "en" } = body;



        if (!process.env.HF_API_KEY) {
            return NextResponse.json({ success: false, message: "HF_API_KEY is not configured" }, { status: 500 });
        }

        // Build the exact JSON skeleton the AI must populate
        const { schema, fieldDescriptions } = buildSchemaFromSections(sections);

        // User-provided context (only aiEnabled fields)
        const userContext = Object.entries(userInputs)
            .filter(([, v]) => v && String(v).trim())
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n") || "No specific inputs — use module context.";
        console.log(userContext, "userContext")
        const localeNote = locale && locale !== "en"
            ? `\nIMPORTANT: Write all content in locale "${locale}".`
            : "";

        const systemPrompt = `You are a professional CMS content writer. Generate a complete CMS document as a JSON object.${localeNote}

                    MODULE CONTEXT:
                    ${moduleAiPrompt || "Generate relevant, professional content."}

                    USER PROVIDED INPUTS (use these as the basis for all content):
                    ${userContext}

                    OUTPUT SCHEMA — you must return a JSON object with EXACTLY these keys and value types:
                    ${fieldDescriptions.join("\n")}

                    RULES:
                    - Return ONLY a raw JSON object. No markdown, no explanation, no code fences.
                    - For repeatable component arrays, generate 2–3 realistic items.
                    - For date fields use ISO format: "YYYY-MM-DD".
                    - For number fields return a number, not a string.
                    - For enumeration fields pick one of the listed options.
                    - Leave media/relation fields as empty string, null, or empty array (as shown in schema).
                    - Make all text content professional, engaging, and SEO-friendly.
                    - Base all content on the user inputs above.`;

        const userPrompt = `Generate the CMS document now based on the user inputs. Return ONLY valid JSON matching the schema.

                    Expected JSON structure (fill all string/number/date fields with real content):
                    ${JSON.stringify(schema, null, 2)}`;

        const hf = new HfInference(process.env.HF_API_KEY);

        const response = await hf.chatCompletion({
            model: MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            max_tokens: 3000,
            temperature: 0.7,
        });

        const rawText = response?.choices?.[0]?.message?.content || "";

        if (!rawText.trim()) {
            return NextResponse.json({ success: false, message: "Empty AI response" }, { status: 500 });
        }

        const parsed = cleanJsonResponse(rawText);

        if (!parsed || typeof parsed !== "object") {
            return NextResponse.json({ success: false, message: "Could not parse AI response as JSON" }, { status: 500 });
        }

        // Merge parsed into the schema skeleton so missing keys fall back to defaults
        const result = deepMerge(schema, parsed);

        return NextResponse.json({
            success: true, data: result


            // result
        });
    } catch (error) {
        console.error("[AI Generate] Error:", error.message);
        return NextResponse.json({ success: false, message: error.message || "AI generation failed" }, { status: 500 });
    }
}

// ─── Deep merge: base provides structure/defaults, override fills values ──────
function deepMerge(base, override) {
    if (Array.isArray(base)) {
        // If AI returned an array use it, otherwise keep base
        return Array.isArray(override) && override.length > 0 ? override : base;
    }
    if (base && typeof base === "object" && override && typeof override === "object") {
        const result = { ...base };
        for (const key of Object.keys(override)) {
            if (key in result) {
                result[key] = deepMerge(result[key], override[key]);
            } else {
                result[key] = override[key];
            }
        }
        return result;
    }
    // Primitive: use override if it's a meaningful value
    if (override !== undefined && override !== null && override !== "") return override;
    return base;
}
