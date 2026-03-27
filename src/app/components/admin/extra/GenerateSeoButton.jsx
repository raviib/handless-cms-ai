"use client";
import { useState } from "react";
import toast from "react-hot-toast";

/**
 * GenerateSeoButton
 *
 * Props:
 *  - formData   : current form state (used as pageData payload)
 *  - onChange   : (seoObject) => void  — called with the AI-generated SEO object
 *                 so the parent can merge it into formData.seo
 */
export default function GenerateSeoButton({ formData, onChange }) {
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!formData) return toast.error("No page data available.");
        setLoading(true);
        const toastId = toast.loading("Generating SEO with AI…");

        try {
            const res = await fetch("/api/seo/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pageData: formData,
                    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "",
                }),
            });

            const data = await res.json();

            if (!data?.seo) throw new Error(data?.message || "No SEO data returned");

            const { title, metaTitle, metaDescription, keywords, canonicalUrl, openGraph } = data.seo;

            // Map AI response → existing seo schema shape
            const seoPayload = {
                title: metaTitle || title || "",
                description: metaDescription || "",
                keywords: Array.isArray(keywords) ? keywords.join(", ") : keywords || "",
                canonicalUrl: canonicalUrl || "",
                openGraph: openGraph
                    ? [
                          {
                              ogTitle: openGraph.ogTitle || "",
                              ogDescription: openGraph.ogDescription || "",
                              ogImage: openGraph.ogImage || "",
                              ogUrl: canonicalUrl || "",
                              ogType: "website",
                          },
                      ]
                    : [],
            };

            onChange(seoPayload);
            toast.success("SEO fields auto-filled.", { id: toastId });
        } catch (err) {
            console.error("[GenerateSeoButton]", err);
            toast.error(err.message || "SEO generation failed.", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#fff",
                background: loading ? "#7c8db5" : "#4361ee",
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.2s",
                marginBottom: "12px",
            }}
        >
            {loading ? (
                <>
                    <span
                        style={{
                            width: 14,
                            height: 14,
                            border: "2px solid #fff",
                            borderTopColor: "transparent",
                            borderRadius: "50%",
                            display: "inline-block",
                            animation: "spin 0.7s linear infinite",
                        }}
                    />
                    Generating…
                </>
            ) : (
                <>✨ Generate SEO</>
            )}
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </button>
    );
}
