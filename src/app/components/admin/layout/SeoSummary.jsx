"use client";
import { useState } from "react";

const strip = (str) => (str || "").replace(/<[^>]*>/g, "").trim();
const truncate = (str, max) => str.length > max ? str.slice(0, max) + "…" : str;

// ── tiny helpers ──────────────────────────────────────────────────────────────
const Dot = ({ ok }) => (
    <span style={{
        display: "inline-block", width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
        background: ok ? "#22c55e" : "#ef4444",
    }} />
);

const Bar = ({ value, max, warn }) => {
    const pct = Math.min((value / max) * 100, 100);
    const color = value === 0 ? "#e5e7eb" : value > max ? "#ef4444" : value < warn ? "#f59e0b" : "#22c55e";
    return (
        <div style={{ height: 4, background: "#e5e7eb", borderRadius: 4, overflow: "hidden", marginTop: 4 }}>
            <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width .3s" }} />
        </div>
    );
};

const SectionHead = ({ label }) => (
    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#9ca3af", textTransform: "uppercase", margin: "14px 0 8px" }}>
        {label}
    </p>
);

// ── Google SERP preview ───────────────────────────────────────────────────────
const GooglePreview = ({ title, description, url }) => {
    const displayUrl = url || process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
    const cleanUrl = displayUrl.replace(/^https?:\/\//, "");
    return (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "12px 14px", fontSize: 13 }}>
            {/* browser chrome bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 4 }}>
                    {["#ef4444", "#f59e0b", "#22c55e"].map(c => (
                        <span key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" }} />
                    ))}
                </div>
                <div style={{ flex: 1, background: "#f3f4f6", borderRadius: 20, padding: "3px 10px", fontSize: 10, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    🔒 {cleanUrl}
                </div>
            </div>
            {/* SERP result */}
            <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 10 }}>
                <p style={{ fontSize: 11, color: "#202124", margin: "0 0 2px", opacity: 0.6 }}>
                    {cleanUrl}
                </p>
                <p style={{ fontSize: 16, color: title ? "#1a0dab" : "#9ca3af", margin: "0 0 4px", fontWeight: 400, lineHeight: 1.3, cursor: "pointer" }}>
                    {title ? truncate(title, 60) : "Page title will appear here"}
                </p>
                <p style={{ fontSize: 12, color: description ? "#4d5156" : "#9ca3af", margin: 0, lineHeight: 1.5 }}>
                    {description ? truncate(description, 155) : "Meta description will appear here…"}
                </p>
            </div>
        </div>
    );
};

// ── Social / OG card preview ──────────────────────────────────────────────────
const SocialCard = ({ title, description, image, url }) => {
    const domain = (url || process.env.NEXT_PUBLIC_SITE_URL || "example.com").replace(/^https?:\/\//, "").split("/")[0];
    const imgSrc = image
        ? (typeof image === "string" && !image.startsWith("blob:") && !image.startsWith("data:") && !image.startsWith("http")
            ? `${process.env.NEXT_PUBLIC_SITE_IMAGE_URL}${image}`
            : typeof image === "object" ? URL.createObjectURL(image) : image)
        : null;

    return (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", fontSize: 13 }}>
            {/* image area */}
            <div style={{ background: "#f3f4f6", height: 100, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {imgSrc
                    ? <img src={imgSrc} alt="og" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: 11, color: "#9ca3af" }}>No OG image set</span>
                }
            </div>
            {/* text area */}
            <div style={{ background: "#fff", padding: "8px 10px", borderTop: "1px solid #e5e7eb" }}>
                <p style={{ fontSize: 10, color: "#9ca3af", margin: "0 0 2px", textTransform: "uppercase" }}>{domain}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: title ? "#111" : "#9ca3af", margin: "0 0 2px", lineHeight: 1.3 }}>
                    {title ? truncate(title, 55) : "Title not set"}
                </p>
                <p style={{ fontSize: 11, color: description ? "#555" : "#9ca3af", margin: 0, lineHeight: 1.4 }}>
                    {description ? truncate(description, 100) : "Description not set"}
                </p>
            </div>
        </div>
    );
};

// ── Checklist row ─────────────────────────────────────────────────────────────
const CheckRow = ({ ok, label, hint }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 7, marginBottom: 7 }}>
        <Dot ok={ok} />
        <div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>{label}</span>
            {hint && <p style={{ fontSize: 11, color: ok ? "#6b7280" : "#ef4444", margin: "1px 0 0" }}>{hint}</p>}
        </div>
    </div>
);

// ── Tab button ────────────────────────────────────────────────────────────────
const Tab = ({ active, onClick, children }) => (
    <button onClick={onClick} style={{
        flex: 1, padding: "5px 0", fontSize: 11, fontWeight: active ? 700 : 500,
        background: active ? "#111" : "transparent", color: active ? "#fff" : "#6b7280",
        border: "none", borderRadius: 5, cursor: "pointer", transition: "all .2s",
    }}>
        {children}
    </button>
);

// ── Main component ────────────────────────────────────────────────────────────
const SeoSummary = ({ seoData = {} }) => {
    const [tab, setTab] = useState("google"); // google | social | check

    const {
        title = "", description = "", keywords = "",
        canonicalUrl = "", metaImage = "",
        openGraph = [],
    } = seoData || {};

    const t = strip(title);
    const d = strip(description);
    const k = strip(keywords);

    const tLen = t.length;
    const dLen = d.length;

    const ogEntry = Array.isArray(openGraph) ? openGraph[0] : openGraph;
    const ogTitle = strip(ogEntry?.ogTitle || t);
    const ogDesc = strip(ogEntry?.ogDescription || d);
    const ogImage = ogEntry?.ogImage || metaImage || null;

    const titleOk = tLen >= 30 && tLen <= 60;
    const descOk = dLen >= 120 && dLen <= 160;
    const keywordsOk = !!k;
    const canonicalOk = !!canonicalUrl;
    const ogImageOk = !!ogImage;

    const score = [titleOk, descOk, keywordsOk, canonicalOk, ogImageOk].filter(Boolean).length;
    const scoreColor = score <= 2 ? "#ef4444" : score <= 3 ? "#f59e0b" : "#22c55e";

    return (
        <div>
            {/* header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <h3 style={{ color: "#9ca3af", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
                    SEO Preview
                </h3>
                <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor, background: scoreColor + "18", padding: "2px 8px", borderRadius: 20 }}>
                    {score}/5
                </span>
            </div>

            {/* tabs */}
            <div style={{ display: "flex", gap: 4, background: "#f3f4f6", borderRadius: 6, padding: 3, marginBottom: 12 }}>
                <Tab active={tab === "google"} onClick={() => setTab("google")}>Google</Tab>
                <Tab active={tab === "social"} onClick={() => setTab("social")}>Social</Tab>
                <Tab active={tab === "check"} onClick={() => setTab("check")}>Checks</Tab>
            </div>

            {/* google tab */}
            {tab === "google" && (
                <>
                    <GooglePreview title={t} description={d} url={canonicalUrl} />
                    <div style={{ marginTop: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6b7280", marginBottom: 2 }}>
                            <span>Title</span>
                            <span style={{ color: titleOk ? "#22c55e" : tLen > 60 ? "#ef4444" : "#f59e0b" }}>{tLen}/60</span>
                        </div>
                        <Bar value={tLen} max={60} warn={30} />
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6b7280", margin: "8px 0 2px" }}>
                            <span>Description</span>
                            <span style={{ color: descOk ? "#22c55e" : dLen > 160 ? "#ef4444" : "#f59e0b" }}>{dLen}/160</span>
                        </div>
                        <Bar value={dLen} max={160} warn={120} />
                    </div>
                </>
            )}

            {/* social tab */}
            {tab === "social" && (
                <>
                    <SectionHead label="Facebook / LinkedIn" />
                    <SocialCard title={ogTitle} description={ogDesc} image={ogImage} url={canonicalUrl} />
                    <SectionHead label="Twitter / X" />
                    <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                        <div style={{ background: "#f3f4f6", height: 80, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                            {ogImage
                                ? <img src={
                                    typeof ogImage === "string" && !ogImage.startsWith("blob:") && !ogImage.startsWith("data:") && !ogImage.startsWith("http")
                                        ? `${process.env.NEXT_PUBLIC_SITE_IMAGE_URL}${ogImage}`
                                        : ogImage
                                } alt="twitter" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : <span style={{ fontSize: 11, color: "#9ca3af" }}>No image set</span>
                            }
                        </div>
                        <div style={{ background: "#fff", padding: "8px 10px", borderTop: "1px solid #e5e7eb" }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: ogTitle ? "#111" : "#9ca3af", margin: "0 0 2px" }}>
                                {ogTitle ? truncate(ogTitle, 55) : "Title not set"}
                            </p>
                            <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>
                                {(canonicalUrl || "").replace(/^https?:\/\//, "").split("/")[0] || "example.com"}
                            </p>
                        </div>
                    </div>
                </>
            )}

            {/* checks tab */}
            {tab === "check" && (
                <div style={{ marginTop: 4 }}>
                    <CheckRow ok={titleOk} label={`Title (${tLen} chars)`}
                        hint={tLen === 0 ? "Missing — add a title" : tLen < 30 ? "Too short, aim for 30–60 chars" : tLen > 60 ? "Too long, keep under 60 chars" : "Good length"} />
                    <CheckRow ok={descOk} label={`Description (${dLen} chars)`}
                        hint={dLen === 0 ? "Missing — add a description" : dLen < 120 ? "Too short, aim for 120–160 chars" : dLen > 160 ? "Too long, keep under 160 chars" : "Good length"} />
                    <CheckRow ok={keywordsOk} label="Keywords"
                        hint={keywordsOk ? "Set" : "Missing — add relevant keywords"} />
                    <CheckRow ok={canonicalOk} label="Canonical URL"
                        hint={canonicalOk ? canonicalUrl : "Not defined — set a canonical URL"} />
                    <CheckRow ok={ogImageOk} label="OG Image"
                        hint={ogImageOk ? "Set" : "Missing — add an Open Graph image"} />
                </div>
            )}
        </div>
    );
};

export default SeoSummary;
