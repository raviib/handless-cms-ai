"use client";
import { useState } from "react";
import toast from "react-hot-toast";

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

            onChange({
                title: metaTitle || title || "",
                description: metaDescription || "",
                keywords: Array.isArray(keywords) ? keywords.join(", ") : keywords || "",
                canonicalUrl: canonicalUrl || "",
                openGraph: openGraph
                    ? [{ ogTitle: openGraph.ogTitle || "", ogDescription: openGraph.ogDescription || "", ogImage: openGraph.ogImage || "", ogUrl: canonicalUrl || "", ogType: "website" }]
                    : [],
            });

            toast.success("SEO fields auto-filled.", { id: toastId });
        } catch (err) {
            console.error("[GenerateSeoButton]", err);
            toast.error(err.message || "SEO generation failed.", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @keyframes seo-spin { to { transform: rotate(360deg); } }
                @keyframes seo-shimmer {
                    0%   { background-position: -200% center; }
                    100% { background-position:  200% center; }
                }
                .seo-gen-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    padding: 7px 16px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: opacity .2s, transform .15s, box-shadow .2s;
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
                    background-size: 200% auto;
                    box-shadow: 0 2px 10px rgba(99,102,241,0.35);
                    letter-spacing: 0.01em;
                    margin-bottom: 14px;
                    position: relative;
                    overflow: hidden;
                }
                .seo-gen-btn:not(:disabled):hover {
                    opacity: .92;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 16px rgba(99,102,241,0.45);
                    animation: seo-shimmer 1.4s linear infinite;
                }
                .seo-gen-btn:not(:disabled):active {
                    transform: translateY(0);
                    box-shadow: 0 1px 6px rgba(99,102,241,0.3);
                }
                .seo-gen-btn:disabled {
                    background: #c4b5fd;
                    box-shadow: none;
                    cursor: not-allowed;
                }
                .seo-gen-spinner {
                    width: 13px;
                    height: 13px;
                    border: 2px solid rgba(255,255,255,0.4);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: seo-spin 0.65s linear infinite;
                    flex-shrink: 0;
                }
            `}</style>

            <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="seo-gen-btn"
            >
                {loading ? (
                    <>
                        <span className="seo-gen-spinner" />
                        Generating…
                    </>
                ) : (
                    <>
                        <span style={{ fontSize: 15 }}>✨</span>
                        Generate SEO
                    </>
                )}
            </button>
        </>
    );
}
