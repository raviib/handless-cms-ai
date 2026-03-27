"use client";
import { useState } from "react";

const strip = (str) => (str || "").replace(/<[^>]*>/g, "").trim();
const truncate = (str, max) => str.length > max ? str.slice(0, max) + "…" : str;

// ── Progress bar ──────────────────────────────────────────────────────────────
const Bar = ({ value, max, warn }) => {
    const pct = Math.min((value / max) * 100, 100);
    const color = value === 0 ? "#e5e7eb" : value > max ? "#ef4444" : value < warn ? "#f59e0b" : "#22c55e";
    return (
        <div style={{ height: 5, background: "#f0f0f0", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width .35s ease" }} />
        </div>
    );
};

// ── Score ring ────────────────────────────────────────────────────────────────
const ScoreRing = ({ score, color }) => {
    const r = 18, circ = 2 * Math.PI * r;
    const dash = (score / 5) * circ;
    return (
        <svg width={44} height={44} viewBox="0 0 44 44" style={{ flexShrink: 0 }}>
            <circle cx={22} cy={22} r={r} fill="none" stroke="#f0f0f0" strokeWidth={4} />
            <circle cx={22} cy={22} r={r} fill="none" stroke={color} strokeWidth={4}
                strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                transform="rotate(-90 22 22)" style={{ transition: "stroke-dasharray .4s ease" }} />
            <text x={22} y={22} textAnchor="middle" dominantBaseline="central"
                style={{ fontSize: 11, fontWeight: 700, fill: color, fontFamily: "inherit" }}>
                {score}/5
            </text>
        </svg>
    );
};

// ── Tab button ────────────────────────────────────────────────────────────────
const Tab = ({ active, onClick, children }) => (
    <button onClick={onClick} style={{
        flex: 1, padding: "5px 0", fontSize: 11, fontWeight: active ? 700 : 500,
        background: active ? "#fff" : "transparent",
        color: active ? "#111827" : "#9ca3af",
        border: "none", borderRadius: 5, cursor: "pointer",
        transition: "all .18s",
        boxShadow: active ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
    }}>
        {children}
    </button>
);

// ── Section label ─────────────────────────────────────────────────────────────
const SectionHead = ({ label }) => (
    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: "#9ca3af", textTransform: "uppercase", margin: "14px 0 6px" }}>
        {label}
    </p>
);

// ── Char count row ────────────────────────────────────────────────────────────
const CharRow = ({ label, value, max, warn }) => {
    const ok = value >= warn && value <= max;
    const over = value > max;
    const color = value === 0 ? "#9ca3af" : over ? "#ef4444" : ok ? "#22c55e" : "#f59e0b";
    return (
        <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color }}>{value}/{max}</span>
            </div>
            <Bar value={value} max={max} warn={warn} />
        </div>
    );
};

// ── Check row ─────────────────────────────────────────────────────────────────
const CheckRow = ({ ok, label, hint }) => (
    <div style={{ display: "flex", gap: 9, padding: "7px 0", borderBottom: "1px solid #f3f4f6" }}>
        <span style={{
            width: 18, height: 18, borderRadius: "50%", flexShrink: 0, display: "flex",
            alignItems: "center", justifyContent: "center", marginTop: 1,
            background: ok ? "#dcfce7" : "#fee2e2",
            color: ok ? "#16a34a" : "#dc2626", fontSize: 10, fontWeight: 700,
        }}>
            {ok ? "✓" : "✕"}
        </span>
        <div style={{ minWidth: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#111827", display: "block" }}>{label}</span>
            {hint && <span style={{ fontSize: 11, color: ok ? "#6b7280" : "#ef4444", display: "block", marginTop: 1, lineHeight: 1.4 }}>{hint}</span>}
        </div>
    </div>
);

// ── Google SERP preview ───────────────────────────────────────────────────────
const GooglePreview = ({ title, description, url }) => {
    const displayUrl = url || process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
    const cleanUrl = displayUrl.replace(/^https?:\/\//, "");
    return (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", fontSize: 13 }}>
            {/* mock browser bar */}
            <div style={{ background: "#f8f9fa", borderBottom: "1px solid #e5e7eb", padding: "7px 10px", display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ display: "flex", gap: 4 }}>
                    {["#ef4444", "#f59e0b", "#22c55e"].map(c => (
                        <span key={c} style={{ width: 7, height: 7, borderRadius: "50%", background: c, display: "inline-block" }} />
                    ))}
                </div>
                <div style={{ flex: 1, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 20, padding: "2px 10px", fontSize: 10, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    🔒 {cleanUrl}
                </div>
            </div>
            {/* SERP result */}
            <div style={{ padding: "10px 12px" }}>
                <p style={{ fontSize: 10, color: "#5f6368", margin: "0 0 1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {cleanUrl}
                </p>
                <p style={{ fontSize: 14, color: title ? "#1a0dab" : "#9ca3af", margin: "0 0 3px", fontWeight: 400, lineHeight: 1.3, cursor: "pointer" }}>
                    {title ? truncate(title, 60) : <em style={{ opacity: 0.5 }}>Page title will appear here</em>}
                </p>
                <p style={{ fontSize: 11, color: description ? "#4d5156" : "#9ca3af", margin: 0, lineHeight: 1.5 }}>
                    {description ? truncate(description, 155) : <em style={{ opacity: 0.5 }}>Meta description will appear here…</em>}
                </p>
            </div>
        </div>
    );
};

// ── Social / OG card ──────────────────────────────────────────────────────────
const SocialCard = ({ title, description, image, url, platform = "facebook" }) => {
    const domain = (url || process.env.NEXT_PUBLIC_SITE_URL || "example.com").replace(/^https?:\/\//, "").split("/")[0];
    const imgSrc = image
        ? (typeof image === "string" && !image.startsWith("blob:") && !image.startsWith("data:") && !image.startsWith("http")
            ? `${process.env.NEXT_PUBLIC_SITE_IMAGE_URL}${image}`
            : typeof image === "object" ? URL.createObjectURL(image) : image)
        : null;

    return (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ background: "#f3f4f6", height: 90, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                {imgSrc
                    ? <img src={imgSrc} alt="og" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: 11, color: "#9ca3af" }}>No OG image set</span>
                }
            </div>
            <div style={{ background: "#fff", padding: "8px 10px", borderTop: "1px solid #e5e7eb" }}>
                <p style={{ fontSize: 9, color: "#9ca3af", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{domain}</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: title ? "#111827" : "#9ca3af", margin: "0 0 2px", lineHeight: 1.3 }}>
                    {title ? truncate(title, 55) : "Title not set"}
                </p>
                <p style={{ fontSize: 11, color: description ? "#6b7280" : "#9ca3af", margin: 0, lineHeight: 1.4 }}>
                    {description ? truncate(description, 90) : "Description not set"}
                </p>
            </div>
        </div>
    );
};

// ── Main component ────────────────────────────────────────────────────────────
const SeoSummary = ({ seoData = {} }) => {
    const [tab, setTab] = useState("google");

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
    const scoreLabel = score <= 2 ? "Needs work" : score <= 3 ? "Fair" : score === 4 ? "Good" : "Excellent";

    return (
        <div>
            {/* ── header ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <ScoreRing score={score} color={scoreColor} />
                <div>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#9ca3af" }}>
                        SEO Score
                    </p>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: scoreColor }}>
                        {scoreLabel}
                    </p>
                </div>
            </div>

            {/* ── tabs ── */}
            <div style={{ display: "flex", gap: 3, background: "#f3f4f6", borderRadius: 8, padding: 3, marginBottom: 12 }}>
                <Tab active={tab === "google"} onClick={() => setTab("google")}>Google</Tab>
                <Tab active={tab === "social"} onClick={() => setTab("social")}>Social</Tab>
                <Tab active={tab === "check"} onClick={() => setTab("check")}>Checks</Tab>
            </div>

            {/* ── google tab ── */}
            {tab === "google" && (
                <>
                    <GooglePreview title={t} description={d} url={canonicalUrl} />
                    <div style={{ marginTop: 12 }}>
                        <CharRow label="Title" value={tLen} max={60} warn={30} />
                        <CharRow label="Description" value={dLen} max={160} warn={120} />
                    </div>
                </>
            )}

            {/* ── social tab ── */}
            {tab === "social" && (
                <>
                    <SectionHead label="Facebook / LinkedIn" />
                    <SocialCard title={ogTitle} description={ogDesc} image={ogImage} url={canonicalUrl} />
                    <SectionHead label="Twitter / X" />
                    <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                        <div style={{ background: "#f3f4f6", height: 75, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
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
                            <p style={{ fontSize: 12, fontWeight: 600, color: ogTitle ? "#111827" : "#9ca3af", margin: "0 0 2px" }}>
                                {ogTitle ? truncate(ogTitle, 55) : "Title not set"}
                            </p>
                            <p style={{ fontSize: 10, color: "#9ca3af", margin: 0 }}>
                                {(canonicalUrl || "").replace(/^https?:\/\//, "").split("/")[0] || "example.com"}
                            </p>
                        </div>
                    </div>
                </>
            )}

            {/* ── checks tab ── */}
            {tab === "check" && (
                <div>
                    <CheckRow ok={titleOk} label={`Title (${tLen} chars)`}
                        hint={tLen === 0 ? "Missing — add a title" : tLen < 30 ? "Too short, aim for 30–60 chars" : tLen > 60 ? "Too long, keep under 60 chars" : "Good length"} />
                    <CheckRow ok={descOk} label={`Description (${dLen} chars)`}
                        hint={dLen === 0 ? "Missing — add a description" : dLen < 120 ? "Too short, aim for 120–160 chars" : dLen > 160 ? "Too long, keep under 160 chars" : "Good length"} />
                    <CheckRow ok={keywordsOk} label="Keywords"
                        hint={keywordsOk ? "Set" : "Missing — add relevant keywords"} />
                    <CheckRow ok={canonicalOk} label="Canonical URL"
                        hint={canonicalOk ? truncate(canonicalUrl, 30) : "Not defined — set a canonical URL"} />
                    <CheckRow ok={ogImageOk} label="OG Image"
                        hint={ogImageOk ? "Set" : "Missing — add an Open Graph image"} />
                </div>
            )}
        </div>
    );
};

export default SeoSummary;
