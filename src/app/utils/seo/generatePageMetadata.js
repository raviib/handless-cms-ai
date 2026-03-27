/**
 * generatePageMetadata
 *
 * Fetches a document by slug from any CMS API endpoint and returns
 * a Next.js-compatible metadata object.
 *
 * Usage in a page.js:
 *   export async function generateMetadata({ params }) {
 *     return generatePageMetadata(`/api/v1/category`, params.slug);
 *   }
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "";

const FALLBACK_METADATA = {
    title: "Virgo",
    description: "Welcome to Virgo",
    openGraph: { title: "Virgo", description: "Welcome to Virgo", images: [] },
};

export async function generatePageMetadata(apiEndpoint, slug) {
    try {
        const url = `${SITE_URL}${apiEndpoint}?slug=${encodeURIComponent(slug)}&limit=1`;
        const res = await fetch(url, { cache: "no-store" });

        if (!res.ok) return FALLBACK_METADATA;

        const json = await res.json();
        const doc = Array.isArray(json.data) ? json.data[0] : json.data;

        if (!doc) return FALLBACK_METADATA;

        const seo = doc.seo || {};
        const ogList = Array.isArray(seo.openGraph) ? seo.openGraph : [];
        const og = ogList[0] || {};

        const title = seo.title || doc.name || doc.title || FALLBACK_METADATA.title;
        const description = seo.description || FALLBACK_METADATA.description;
        const canonicalUrl = seo.canonicalUrl ? `${SITE_URL}${seo.canonicalUrl}` : undefined;

        return {
            title,
            description,
            keywords: seo.keywords || "",
            ...(canonicalUrl && { alternates: { canonical: canonicalUrl } }),
            openGraph: {
                title: og.ogTitle || title,
                description: og.ogDescription || description,
                url: og.ogUrl || canonicalUrl || SITE_URL,
                type: og.ogType || "website",
                images: og.ogImage
                    ? [{ url: og.ogImage }]
                    : seo.metaImage
                    ? [{ url: seo.metaImage }]
                    : [],
            },
        };
    } catch (err) {
        console.error("[generatePageMetadata] Error:", err);
        return FALLBACK_METADATA;
    }
}
