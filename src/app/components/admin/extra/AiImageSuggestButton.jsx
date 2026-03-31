"use client";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";
import ImageIcon from "@mui/icons-material/Image";
import SendIcon from "@mui/icons-material/Send";
import {
    Box,
    CircularProgress,
    IconButton,
    InputAdornment,
    OutlinedInput,
    Paper,
    Popover,
    Tab,
    Tabs,
    Tooltip,
    Typography,
} from "@mui/material";
import { useState } from "react";
import { axiosInstance } from "@/app/config/axiosInstance";
import { generateApiAccessToken } from "@/app/lib/auth.improved.js";

const SITE_IMAGE_URL = process.env.NEXT_PUBLIC_SITE_IMAGE_URL || "";

/**
 * AiImageSuggestButton
 *
 * Props:
 *  - fieldId        : string  — dot-path id for history tracking
 *  - contextText    : string  — current text content from the page to enrich the prompt
 *  - onApply        : (imagePath: string) => void  — called when user selects an image
 */
const AiImageSuggestButton = ({ fieldId = "", contextText = "", onApply }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [tab, setTab] = useState(0); // 0 = Generate, 1 = History
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]); // generated image paths
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [error, setError] = useState(null);

    // History
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyRuns, setHistoryRuns] = useState(null);
    const [historyError, setHistoryError] = useState(null);

    const open = Boolean(anchorEl);

    // ── Generate images ───────────────────────────────────────────────────────
    const generateImages = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setError(null);
        setImages([]);
        setSelectedIndex(null);

        try {
            const token = await generateApiAccessToken();
            const { data } = await axiosInstance.post(
                "/content/image-generate",
                { prompt: prompt.trim(), contextText, fieldId, count: 3 },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success && Array.isArray(data.images)) {
                setImages(data.images);
                // Refresh history after generation
                if (fieldId) fetchHistory();
            } else {
                setError(data.message || "Image generation failed");
            }
        } catch (err) {
            setError(err?.response?.data?.message || "Image generation failed");
        } finally {
            setLoading(false);
        }
    };

    // ── Fetch history ─────────────────────────────────────────────────────────
    const fetchHistory = async () => {
        if (!fieldId) return;
        setHistoryLoading(true);
        setHistoryError(null);
        try {
            const token = await generateApiAccessToken();
            const { data } = await axiosInstance.get(
                `/content/image-history?fieldId=${encodeURIComponent(fieldId)}&limit=20`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) setHistoryRuns(data.data || []);
            else setHistoryError(data.message || "Failed to load history");
        } catch (err) {
            setHistoryError(err?.response?.data?.message || "Failed to load history");
        } finally {
            setHistoryLoading(false);
        }
    };

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleOpen = (e) => {
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
        setTab(0);
        setImages([]);
        setSelectedIndex(null);
        setError(null);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setSelectedIndex(null);
    };

    const handleTabChange = (_, newTab) => {
        setTab(newTab);
        if (newTab === 1 && fieldId && historyRuns === null) fetchHistory();
    };

    const handleApply = () => {
        if (selectedIndex === null) return;
        onApply(images[selectedIndex]);
        handleClose();
    };

    const handleApplyFromHistory = (imagePath) => {
        onApply(imagePath);
        handleClose();
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <Tooltip title="Generate image with AI" placement="top">
                <span>
                    <IconButton
                        size="small"
                        onClick={handleOpen}
                        sx={{
                            color: "#7c3aed",
                            p: "2px",
                            "&:hover": { backgroundColor: "rgba(124,58,237,0.08)" },
                        }}
                    >
                        <AutoFixHighIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </span>
            </Tooltip>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                slotProps={{
                    paper: {
                        sx: {
                            width: 640,
                            maxWidth: "96vw",
                            borderRadius: 2,
                            boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
                            border: "1px solid #e9d5ff",
                            display: "flex",
                            flexDirection: "column",
                            maxHeight: "85vh",
                        },
                    },
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <Box
                    sx={{
                        px: 2, py: 1.5,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                        borderRadius: "8px 8px 0 0",
                        flexShrink: 0,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <ImageIcon sx={{ color: "#fff", fontSize: 18 }} />
                        <Typography variant="subtitle2" sx={{ color: "#fff", fontWeight: 600 }}>
                            AI Image Suggestions
                        </Typography>
                        {fieldId && (
                            <Typography
                                variant="caption"
                                sx={{ color: "rgba(255,255,255,0.65)", fontSize: "10px", fontFamily: "monospace", ml: 0.5, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                            >
                                {fieldId}
                            </Typography>
                        )}
                    </Box>
                    <IconButton size="small" onClick={handleClose} sx={{ color: "#fff", p: "2px" }}>
                        <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Box>

                {/* Prompt input */}
                <Box sx={{ px: 2, pt: 1.5, pb: 1, flexShrink: 0, borderBottom: "1px solid #f3e8ff" }}>
                    <OutlinedInput
                        size="small"
                        fullWidth
                        placeholder='Describe the image you want, e.g. "modern office building at sunset"'
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); generateImages(); } }}
                        disabled={loading}
                        sx={{
                            fontSize: 13,
                            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e9d5ff" },
                            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#a78bfa" },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#7c3aed" },
                        }}
                        endAdornment={
                            <InputAdornment position="end">
                                <Tooltip title="Generate 3 images">
                                    <span>
                                        <IconButton
                                            size="small"
                                            onClick={generateImages}
                                            disabled={loading || !prompt.trim()}
                                            sx={{ color: "#7c3aed", p: "4px" }}
                                        >
                                            {loading
                                                ? <CircularProgress size={14} sx={{ color: "#7c3aed" }} />
                                                : <SendIcon sx={{ fontSize: 15 }} />
                                            }
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </InputAdornment>
                        }
                    />
                    {contextText?.trim() && (
                        <Typography variant="caption" sx={{ color: "#a78bfa", fontSize: "10px", mt: 0.5, display: "block" }}>
                            Context from page content will be used to enrich the prompt.
                        </Typography>
                    )}
                </Box>

                {/* Tabs */}
                <Tabs
                    value={tab}
                    onChange={handleTabChange}
                    sx={{
                        flexShrink: 0, minHeight: 36, borderBottom: "1px solid #f3e8ff",
                        "& .MuiTab-root": { minHeight: 36, fontSize: 12, textTransform: "none", py: 0 },
                        "& .Mui-selected": { color: "#7c3aed" },
                        "& .MuiTabs-indicator": { backgroundColor: "#7c3aed" },
                    }}
                >
                    <Tab label="Generate" />
                    <Tab
                        label="History"
                        icon={<HistoryIcon sx={{ fontSize: 14 }} />}
                        iconPosition="start"
                        disabled={!fieldId}
                    />
                </Tabs>

                {/* Body */}
                <Box sx={{ p: 2, overflowY: "auto", flex: 1 }}>

                    {/* Generate tab */}
                    {tab === 0 && (
                        <>
                            {!loading && images.length === 0 && !error && (
                                <Box sx={{ textAlign: "center", py: 4 }}>
                                    <ImageIcon sx={{ fontSize: 48, color: "#c4b5fd", mb: 1.5 }} />
                                    <Typography variant="body2" sx={{ color: "#555", fontWeight: 600, mb: 0.5 }}>
                                        Describe the image above
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: "#999" }}>
                                        3 image options will be generated. Select one to use it.
                                    </Typography>
                                </Box>
                            )}

                            {loading && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 3, justifyContent: "center" }}>
                                    <CircularProgress size={20} sx={{ color: "#7c3aed" }} />
                                    <Typography variant="body2" sx={{ color: "#666" }}>
                                        Generating 3 images… this may take a moment
                                    </Typography>
                                </Box>
                            )}

                            {error && !loading && (
                                <Typography variant="body2" sx={{ color: "#d32f2f", py: 1 }}>{error}</Typography>
                            )}

                            {!loading && images.length > 0 && (
                                <>
                                    <Typography variant="caption" sx={{ color: "#888", fontWeight: 700, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", mb: 1.5 }}>
                                        Click an image to select it
                                    </Typography>
                                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.5 }}>
                                        {images.map((imgPath, idx) => (
                                            <ImageCard
                                                key={idx}
                                                index={idx}
                                                imgPath={imgPath}
                                                selected={selectedIndex === idx}
                                                onSelect={() => setSelectedIndex(idx)}
                                                siteImageUrl={SITE_IMAGE_URL}
                                            />
                                        ))}
                                    </Box>
                                </>
                            )}
                        </>
                    )}

                    {/* History tab */}
                    {tab === 1 && (
                        <>
                            {historyLoading && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 2 }}>
                                    <CircularProgress size={18} sx={{ color: "#7c3aed" }} />
                                    <Typography variant="body2" sx={{ color: "#666" }}>Loading history…</Typography>
                                </Box>
                            )}
                            {historyError && !historyLoading && (
                                <Typography variant="body2" sx={{ color: "#d32f2f", py: 1 }}>{historyError}</Typography>
                            )}
                            {!historyLoading && !historyError && historyRuns !== null && historyRuns.length === 0 && (
                                <Box sx={{ textAlign: "center", py: 4 }}>
                                    <HistoryIcon sx={{ fontSize: 36, color: "#d1d5db", mb: 1 }} />
                                    <Typography variant="body2" sx={{ color: "#999" }}>No image history yet.</Typography>
                                </Box>
                            )}
                            {!historyLoading && !historyError && historyRuns && historyRuns.length > 0 && (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                                    {historyRuns.map((run) => (
                                        <HistoryRunCard
                                            key={run._id}
                                            run={run}
                                            siteImageUrl={SITE_IMAGE_URL}
                                            onApply={handleApplyFromHistory}
                                        />
                                    ))}
                                </Box>
                            )}
                        </>
                    )}
                </Box>

                {/* Footer apply button */}
                {tab === 0 && selectedIndex !== null && (
                    <Box sx={{ px: 2, py: 1.5, borderTop: "1px solid #f3e8ff", flexShrink: 0, display: "flex", justifyContent: "flex-end" }}>
                        <Box
                            component="button"
                            onClick={handleApply}
                            sx={{
                                display: "inline-flex", alignItems: "center", gap: 0.75,
                                px: 2.5, py: 0.9, borderRadius: 1.5, border: "none", cursor: "pointer",
                                background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                                color: "#fff", fontSize: 13, fontWeight: 600,
                                "&:hover": { opacity: 0.9 },
                            }}
                        >
                            <CheckIcon sx={{ fontSize: 15 }} />
                            Use Image {selectedIndex + 1}
                        </Box>
                    </Box>
                )}
            </Popover>
        </>
    );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const ImageCard = ({ index, imgPath, selected, onSelect, siteImageUrl }) => {
    const src = imgPath.startsWith("http") ? imgPath : `${siteImageUrl}${imgPath}`;
    return (
        <Paper
            variant="outlined"
            onClick={onSelect}
            sx={{
                borderColor: selected ? "#7c3aed" : "#e9d5ff",
                borderRadius: 1.5,
                overflow: "hidden",
                cursor: "pointer",
                position: "relative",
                transition: "all 0.15s",
                "&:hover": { borderColor: "#7c3aed", transform: "translateY(-2px)" },
            }}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`AI option ${index + 1}`} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block" }} />
            {selected && (
                <Box sx={{
                    position: "absolute", top: 6, right: 6,
                    backgroundColor: "#7c3aed", borderRadius: "50%",
                    width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <CheckIcon sx={{ fontSize: 14, color: "#fff" }} />
                </Box>
            )}
            <Typography variant="caption" sx={{ display: "block", textAlign: "center", py: 0.5, color: "#7c3aed", fontWeight: 700, fontSize: "10px" }}>
                Option {index + 1}
            </Typography>
        </Paper>
    );
};

const HistoryRunCard = ({ run, siteImageUrl, onApply }) => {
    const [expanded, setExpanded] = useState(false);
    const date = new Date(run.createdAt).toLocaleString();

    return (
        <Box sx={{ border: "1px solid #e9d5ff", borderRadius: 1.5, overflow: "hidden" }}>
            <Box
                onClick={() => setExpanded((v) => !v)}
                sx={{
                    px: 1.5, py: 1, backgroundColor: "#faf5ff",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    cursor: "pointer", "&:hover": { backgroundColor: "#f3e8ff" },
                }}
            >
                <Box>
                    <Typography variant="caption" sx={{ color: "#7c3aed", fontWeight: 600, fontSize: "11px" }}>{date}</Typography>
                    {run.prompt && (
                        <Typography variant="caption" sx={{ color: "#888", ml: 1, fontSize: "11px" }}>— "{run.prompt.slice(0, 60)}"</Typography>
                    )}
                </Box>
                <Typography variant="caption" sx={{ color: "#a78bfa", fontSize: "11px" }}>
                    {expanded ? "▲ hide" : "▼ show"} {run.generatedImages.length} images
                </Typography>
            </Box>

            {expanded && (
                <Box sx={{ p: 1.5 }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
                        {run.generatedImages.map((imgPath, idx) => {
                            const src = imgPath.startsWith("http") ? imgPath : `${siteImageUrl}${imgPath}`;
                            const isSelected = run.selectedImage === imgPath;
                            return (
                                <Paper
                                    key={idx}
                                    variant="outlined"
                                    onClick={() => onApply(imgPath)}
                                    sx={{
                                        borderColor: isSelected ? "#7c3aed" : "#e9d5ff",
                                        borderRadius: 1.5, overflow: "hidden", cursor: "pointer",
                                        position: "relative", transition: "all 0.15s",
                                        "&:hover": { borderColor: "#7c3aed" },
                                    }}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={src} alt={`history ${idx + 1}`} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block" }} />
                                    {isSelected && (
                                        <Box sx={{
                                            position: "absolute", top: 4, right: 4,
                                            backgroundColor: "#7c3aed", borderRadius: "50%",
                                            width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
                                        }}>
                                            <CheckIcon sx={{ fontSize: 12, color: "#fff" }} />
                                        </Box>
                                    )}
                                </Paper>
                            );
                        })}
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default AiImageSuggestButton;
