"use client";
import Breadcrumb from "@/app/components/admin/breadcrumb";
import { AdminCommonHeading, LoadingButton } from "@/app/components/admin/common.jsx";
import { useGetApi, usePutApi } from "@/app/lib/apicallHooks";
import { useEffect, useState } from "react";
import "@/app/styles/admin/admin_common.scss";

export const dynamic = "force-dynamic";

const EMPTY = {
    companyName: "",
    companyDomain: "",
    industry: "",
    tagline: "",
    primaryColor: "#000000",
    secondaryColor: "#ffffff",
    brandStyle: "",
    logoPath: "",
    primaryFont: "",
    secondaryFont: "",
    promptGuidance: "",
    negativePrompt: "",
    targetAudience: "",
    imageUseCases: "",
    suppressRules: ["no text", "no logo", "no watermark", "no brand name", "no letters", "no typography"],
};

const ALL_SUPPRESS_OPTIONS = [
    { key: "no text",       label: "No Text",        desc: "Prevent any text from appearing in the image" },
    { key: "no logo",       label: "No Logo",         desc: "Prevent AI from generating fake logos" },
    { key: "no watermark",  label: "No Watermark",    desc: "Prevent watermark overlays" },
    { key: "no brand name", label: "No Brand Name",   desc: "Prevent company/brand names being rendered" },
    { key: "no letters",    label: "No Letters",      desc: "Prevent individual characters or glyphs" },
    { key: "no typography", label: "No Typography",   desc: "Prevent font/typeface elements" },
];

const breadcrumbs = [
    { Name: "setting", link: "/admin/setting" },
    { Name: "AI Brand Settings", link: "" },
];

export default function AiBrandSettingPage() {
    const { data: res, isLoading } = useGetApi("/setting/ai-brand");
    const { doPut, isLoading: isSaving } = usePutApi("/setting/ai-brand");

    const [form, setForm] = useState(EMPTY);

    useEffect(() => {
        if (res?.data) {
            setForm({ ...EMPTY, ...res.data });
        }
    }, [res]);

    const onChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const onSuppressToggle = (key) => {
        setForm((prev) => {
            const current = prev.suppressRules || [];
            const next = current.includes(key)
                ? current.filter((k) => k !== key)
                : [...current, key];
            return { ...prev, suppressRules: next };
        });
    };

    const handleSave = () => doPut(form);

    if (isLoading) return <div style={{ padding: 32 }}>Loading...</div>;

    return (
        <>
            <Breadcrumb styleClass="dark-bg" links={breadcrumbs} />

            <div className="admin-form">
                {/* ── Company Identity ─────────────────────────────────── */}
                <div className="admin-form-section panel" style={{ width: "100%" }}>
                    <AdminCommonHeading Heading="Company Identity" />

                    <div className="col-6">
                        <label className="form-label starlabel">Company Name</label>
                        <input
                            type="text"
                            className="form-control"
                            name="companyName"
                            placeholder="e.g. Virgo Laminates"
                            value={form.companyName}
                            onChange={onChange}
                        />
                    </div>

                    <div className="col-6">
                        <label className="form-label starlabel">Company Domain URL</label>
                        <input
                            type="url"
                            className="form-control"
                            name="companyDomain"
                            placeholder="e.g. https://www.virgo.com"
                            value={form.companyDomain}
                            onChange={onChange}
                        />
                    </div>

                    <div className="col-6">
                        <label className="form-label">Industry / Business Type</label>
                        <input
                            type="text"
                            className="form-control"
                            name="industry"
                            placeholder="e.g. Laminates & Surface Materials"
                            value={form.industry}
                            onChange={onChange}
                        />
                    </div>

                    <div className="col-6">
                        <label className="form-label">Tagline</label>
                        <input
                            type="text"
                            className="form-control"
                            name="tagline"
                            placeholder="e.g. Crafting Beautiful Spaces"
                            value={form.tagline}
                            onChange={onChange}
                        />
                    </div>

                    <div className="col-12">
                        <label className="form-label">Target Audience</label>
                        <input
                            type="text"
                            className="form-control"
                            name="targetAudience"
                            placeholder="e.g. Interior designers, architects, homeowners in India"
                            value={form.targetAudience}
                            onChange={onChange}
                        />
                    </div>
                </div>

                {/* ── Visual Brand Identity ────────────────────────────── */}
                <div className="admin-form-section panel" style={{ width: "100%" }}>
                    <AdminCommonHeading Heading="Visual Brand Identity" />

                    <div className="col-6">
                        <label className="form-label">Primary Brand Color</label>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <input
                                type="color"
                                name="primaryColor"
                                value={form.primaryColor}
                                onChange={onChange}
                                style={{ width: 44, height: 38, padding: 2, border: "1px solid #ddd", borderRadius: 4, cursor: "pointer" }}
                            />
                            <input
                                type="text"
                                className="form-control"
                                name="primaryColor"
                                placeholder="#0077B6"
                                value={form.primaryColor}
                                onChange={onChange}
                            />
                        </div>
                    </div>

                    <div className="col-6">
                        <label className="form-label">Secondary / Accent Color</label>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <input
                                type="color"
                                name="secondaryColor"
                                value={form.secondaryColor}
                                onChange={onChange}
                                style={{ width: 44, height: 38, padding: 2, border: "1px solid #ddd", borderRadius: 4, cursor: "pointer" }}
                            />
                            <input
                                type="text"
                                className="form-control"
                                name="secondaryColor"
                                placeholder="#F4A261"
                                value={form.secondaryColor}
                                onChange={onChange}
                            />
                        </div>
                    </div>

                    <div className="col-12">
                        <label className="form-label">Brand Visual Style</label>
                        <input
                            type="text"
                            className="form-control"
                            name="brandStyle"
                            placeholder="e.g. modern, minimal, premium, warm, corporate"
                            value={form.brandStyle}
                            onChange={onChange}
                        />
                    </div>
                </div>

                {/* ── Logo & Typography ────────────────────────────────── */}
                <div className="admin-form-section panel" style={{ width: "100%" }}>
                    <AdminCommonHeading Heading="Logo & Typography" />

                    <div className="col-12">
                        <label className="form-label">Logo Public Path</label>
                        <input
                            type="text"
                            className="form-control"
                            name="logoPath"
                            placeholder="e.g. /file/footer/logo-dark.webp"
                            value={form.logoPath}
                            onChange={onChange}
                        />
                        <span style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                            Path relative to /public — this logo will be overlaid on AI-generated images.
                        </span>
                        {form.logoPath && (
                            <img
                                src={form.logoPath}
                                alt="logo preview"
                                style={{ marginTop: 8, maxHeight: 60, objectFit: "contain", border: "1px solid #eee", borderRadius: 4, padding: 4 }}
                            />
                        )}
                    </div>

                    <div className="col-6">
                        <label className="form-label">Primary Font</label>
                        <input
                            type="text"
                            className="form-control"
                            name="primaryFont"
                            placeholder="e.g. Montserrat"
                            value={form.primaryFont}
                            onChange={onChange}
                        />
                    </div>

                    <div className="col-6">
                        <label className="form-label">Secondary Font</label>
                        <input
                            type="text"
                            className="form-control"
                            name="secondaryFont"
                            placeholder="e.g. Open Sans"
                            value={form.secondaryFont}
                            onChange={onChange}
                        />
                    </div>
                </div>

                {/* ── AI Prompt Guidance ───────────────────────────────── */}
                <div className="admin-form-section panel" style={{ width: "100%" }}>
                    <AdminCommonHeading Heading="AI Image Prompt Guidance" />

                    <div className="col-12">
                        <label className="form-label">Image Use Cases</label>
                        <input
                            type="text"
                            className="form-control"
                            name="imageUseCases"
                            placeholder="e.g. blog banner, product hero, social media post, catalogue cover"
                            value={form.imageUseCases}
                            onChange={onChange}
                        />
                    </div>

                    <div className="col-12">
                        <label className="form-label">Extra Prompt Guidance</label>
                        <textarea
                            className="form-control"
                            name="promptGuidance"
                            rows={4}
                            placeholder="Additional instructions injected into every AI image prompt. e.g. 'Always show premium interior spaces with wooden textures and warm lighting. Avoid outdoor scenes.'"
                            value={form.promptGuidance}
                            onChange={onChange}
                        />
                    </div>

                    <div className="col-12">
                        <label className="form-label">Negative Prompt (things to avoid)</label>
                        <textarea
                            className="form-control"
                            name="negativePrompt"
                            rows={3}
                            placeholder="e.g. cartoon, anime, low quality, blurry, people, faces, competitor logos"
                            value={form.negativePrompt}
                            onChange={onChange}
                        />
                    </div>

                    {/* ── Text / Logo Suppression Rules ─────────────────── */}
                    <div className="col-12">
                        <label className="form-label">Text & Logo Suppression Rules</label>
                        <p style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
                            Enable only the rules that match your brand style. For example, if your
                            brand uses text-heavy editorial images, uncheck "No Text" and "No Typography".
                            All checked rules are injected into both the positive and negative prompt.
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 24px" }}>
                            {ALL_SUPPRESS_OPTIONS.map((opt) => {
                                const active = (form.suppressRules || []).includes(opt.key);
                                return (
                                    <label
                                        key={opt.key}
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: 8,
                                            cursor: "pointer",
                                            minWidth: 220,
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            className="form-checkbox"
                                            checked={active}
                                            onChange={() => onSuppressToggle(opt.key)}
                                            style={{ marginTop: 3, flexShrink: 0 }}
                                        />
                                        <span>
                                            <span style={{ fontWeight: 600, fontSize: 13 }}>{opt.label}</span>
                                            <br />
                                            <span style={{ fontSize: 11, color: "#888" }}>{opt.desc}</span>
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="save-field-button">
                <LoadingButton loading={isSaving} submitHandler={handleSave} btnName="Save Settings" />
            </div>
        </>
    );
}
