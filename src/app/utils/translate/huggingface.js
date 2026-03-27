/**
 * HuggingFace Translation Utility
 * Uses @huggingface/inference with router.huggingface.co (new endpoint).
 */
import { HfInference } from "@huggingface/inference";

const LANG_MAP = {
  hi: "hi", fr: "fr", de: "de", es: "es", ar: "ar", zh: "zh",
  ja: "jap", ko: "ko", pt: "pt", ru: "ru", it: "it", nl: "nl",
  tr: "tr", pl: "pl", vi: "vi", th: "th", id: "id", uk: "uk",
  af: "af", bn: "bn", cs: "cs", da: "da", el: "el", fi: "fi",
  he: "he", hu: "hu", ms: "ms", ro: "ro", sk: "sk", sv: "sv",
};

const NLLB_LANG_MAP = {
  hi: "hin_Deva", fr: "fra_Latn", de: "deu_Latn", es: "spa_Latn",
  ar: "arb_Arab", zh: "zho_Hans", ja: "jpn_Jpan", ko: "kor_Hang",
  pt: "por_Latn", ru: "rus_Cyrl", it: "ita_Latn", nl: "nld_Latn",
  tr: "tur_Latn", pl: "pol_Latn", vi: "vie_Latn", th: "tha_Thai",
  id: "ind_Latn", uk: "ukr_Cyrl", af: "afr_Latn", bn: "ben_Beng",
  cs: "ces_Latn", da: "dan_Latn", el: "ell_Grek", fi: "fin_Latn",
  he: "heb_Hebr", hu: "hun_Latn", ms: "zsm_Latn", ro: "ron_Latn",
  sk: "slk_Latn", sv: "swe_Latn",
};

function getModel(targetLang) {
  const suffix = LANG_MAP[targetLang];
  if (suffix) return { model: `Helsinki-NLP/opus-mt-en-${suffix}`, isNLLB: false };
  return { model: "facebook/nllb-200-distilled-600M", isNLLB: true };
}

export async function translateText(text, targetLang) {
  if (!text || typeof text !== "string" || !text.trim()) return text;
  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) throw new Error("HF_API_KEY is not set in environment");

  const hf = new HfInference(apiKey);
  const { model, isNLLB } = getModel(targetLang);

  const params = isNLLB
    ? { model, inputs: text, parameters: { src_lang: "eng_Latn", tgt_lang: NLLB_LANG_MAP[targetLang] ?? targetLang } }
    : { model, inputs: text };

  const result = await hf.translation(params);
  if (result?.translation_text) return result.translation_text;
  if (Array.isArray(result) && result[0]?.translation_text) return result[0].translation_text;
  throw new Error("Unexpected HuggingFace response: " + JSON.stringify(result));
}

export function isTranslatableType(type) {
  return ["text", "rich-text-blocks", "rich-text-markdown"].includes(type);
}

/**
 * Deeply collect ALL translatable fields from sections + formData.
 * Handles:
 *  - top-level text/rich-text fields
 *  - single component (nested, any depth)
 *  - repeatable component (iterates actual array items in formData)
 *  - repeatable inside single (e.g. visionMission.tab[])
 *  - dynamic-zone items (uses __componentFields)
 *
 * Returns array of:
 *  { path: string, type: string, label: string, value: string }
 */
export function collectAllTranslatableFields(sections, formData) {
  const result = [];

  function walkFields(fields, dataScope, pathPrefix, labelPrefix) {
    for (const field of fields) {
      const key = field.field?.value || field.field;
      if (!key) continue;
      const path = pathPrefix ? `${pathPrefix}.${key}` : key;
      const label = labelPrefix ? `${labelPrefix} › ${field.Printvalue || key}` : (field.Printvalue || key);

      if (isTranslatableType(field.type)) {
        const value = dataScope?.[key];
        result.push({ path, type: field.type, label, value: value ?? "" });

      } else if (field.type === "component") {
        const componentData = dataScope?.[key];

        if (field.component_type === "single") {
          // Recurse into single component object
          walkFields(field.fields || [], componentData || {}, path, label);

        } else if (field.component_type === "repeatable") {
          // Iterate actual array items
          const items = Array.isArray(componentData) ? componentData : [];
          items.forEach((item, idx) => {
            walkFields(field.fields || [], item, `${path}.${idx}`, `${label} [${idx + 1}]`);
          });
        }

      } else if (field.type === "dynamic-zone") {
        const items = Array.isArray(dataScope?.[key]) ? dataScope[key] : [];
        items.forEach((item, idx) => {
          const componentFields = item.__componentFields || [];
          const compName = item.__componentName || `Item ${idx + 1}`;
          walkFields(componentFields, item, `${path}.${idx}`, `${label} › ${compName} [${idx + 1}]`);
        });
      }
    }
  }

  for (const section of sections) {
    walkFields(section.fields || [], formData, "", section.Heading || "");
  }

  return result;
}

/**
 * Apply translated values back into formData.
 * Paths can be: "key", "key.subKey", "key.0.subKey", "key.subKey.0.deepKey", etc.
 */
export function applyTranslations(formData, translations) {
  // Deep clone to avoid mutation
  let updated = JSON.parse(JSON.stringify(formData));

  for (const { path, translated } of translations) {
    const parts = path.split(".");
    let cur = updated;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (cur[part] === undefined || cur[part] === null) break;
      cur = cur[part];
    }
    const lastKey = parts[parts.length - 1];
    if (cur && lastKey in cur) {
      cur[lastKey] = translated;
    }
  }

  return updated;
}

/** Get nested value from object using dot-notation path */
export function getByPath(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

/** Set nested value in object using dot-notation path (immutable) */
export function setByPath(obj, path, value) {
  const keys = path.split(".");
  const result = { ...obj };
  let cur = result;
  for (let i = 0; i < keys.length - 1; i++) {
    cur[keys[i]] = Array.isArray(cur[keys[i]]) ? [...cur[keys[i]]] : { ...cur[keys[i]] };
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
  return result;
}
