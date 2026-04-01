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
 * Multi-select version of AiImageSuggestButton.
 * onApply receives an array of selected image paths.
 */
const AiMultiImageSuggestButton = ({ fieldId = "", contextText = "", onApply }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [tab, setTab] = useState(0);
    const [prompt, setPrompt] = useState("");
    const [imgWidth, setImgWidth] = useState(1024);
    const [imgHeight, setImgHeight] = useState(1024);
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]);
    const [selectedIndices, setSelectedIndices] = useState(new Set());
    const [error, setError] = useState(null);

    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyRuns, setHistoryRuns] = useState(null);
    const [historyError, setHistoryError] = useState(null);
    const [selectedHistoryPaths, setSelectedHistoryPaths] = useState(new Set());

    const open = Boolean(anchorEl);

    const generateImages = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setError(null);
        setImages([]);
        setSelectedIndices(new Set());
        try {
            const token = await generateApiAccessToken();
            const { data } = await axiosInstance.post(
                "/content/image-generate",
                { prompt: prompt.trim(), contextText, fieldId, count: 3, width: imgWidth, height: imgHeight },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success && Array.isArray(data.images)) {
                setImages(data.images);
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

    const handleOpen = (e) => {
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
        setTab(0);
        setImages([]);
        setSelectedIndices(new Set());
        setSelectedHistoryPaths(new Set());
        setError(null);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setSelectedIndices(new Set());
        setSelectedHistoryPaths(new Set());
    };

    const handleTabChange = (_, newTab) => {
        setTab(newTab);
        if (newTab === 1 && fieldId && historyRuns === null) fetchHistory();
    };

    const toggleGenerated = (idx) => {
        setSelectedIndices((prev) => {
            const next = new Set(prev);
            next.has(idx) ? next.delete(idx) : next.add(idx);
            return next;
        });
    };

    const toggleHistoryPath = (imgPath) => {
        setSelectedHistoryPaths((prev) => {
            const next = new Set(prev);
            next.has(imgPath) ? next.delete(imgPath) : next.add(imgPath);
            return next;
        });
    };

    const handleApplyGenerated = () => {
        if (selectedIndices.size === 0) return;
        const paths = [...selectedIndices].sort().map((i) => images[i]);
        onApply(paths);
        handleClose();
    };

    const handleApplyHistory = () => {
        if (selectedHistoryPaths.size === 0) return;
        onApply([...selectedHistoryPaths]);
        handleClose();
    };

    const totalSelected = tab === 0 ? selectedIndices.size : selectedHistoryPaths.size;

    return (
        <>
            <Tooltip title="Generate images with AI (multi-select)" placement="top">
                <span>
                    <IconButton
                        size="small"
                        onClick={handleOpen}
                        sx={{ color: "#7c3aed", p: "2px", "&:hover": { backgroundColor: "rgba(124,58,237,0.08)" } }}
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
                            width: 640, maxWidth: "96vw", borderRadius: 2,
                            boxShadow: "0 8px 32px rgba(0,0,0,0.16)", border: "1px solid #e9d5ff",
                            display: "flex", flexDirection: "column", maxHeight: "85vh",
                        },
                    },
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <Box sx={{
                    px: 2, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                    borderRadius: "8px 8px 0 0", flexShrink: 0,
                }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <ImageIcon sx={{ color: "#fff", fontSize: 18 }} />
                        <Typography variant="subtitle2" sx={{ color: "#fff", fontWeight: 600 }}>
                            AI Image Suggestions
                        </Typography>
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.75)", fontSize: "10px", ml: 0.5 }}>
                            multi-select
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={handleClose} sx={{ color: "#fff", p: "2px" }}>
                        <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Box>

                <Box sx={{ px: 2, pt: 1.5, pb: 1, flexShrink: 0, borderBottom: "1px solid #f3e8ff" }}>
                    <OutlinedInput
                        size="small" fullWidth
                        placeholder='Describe the images, e.g. "modern interior with wooden textures"'
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
                                            {loading ? <CircularProgress size={14} sx={{ color: "#7c3aed" }} /> : <SendIcon sx={{ fontSize: 15 }} />}
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </InputAdornment>
                        }
                    />
                    {/* Width × Height */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                        <Typography variant="caption" sx={{ color: "#888", fontSize: "11px", whiteSpace: "nowrap" }}>Size:</Typography>
                        <OutlinedInput
                            size="small" type="number" value={imgWidth}
                            onChange={(e) => setImgWidth(Math.max(64, Math.min(2048, Number(e.target.value) || 1024)))}
                            disabled={loading}
                            inputProps={{ min: 64, max: 2048, step: 64 }}
                            sx={{ width: 90, fontSize: 12, "& input": { py: "4px", px: "8px" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e9d5ff" } }}
                        />
                        <Typography variant="caption" sx={{ color: "#aaa" }}>×</Typography>
                        <OutlinedInput
                            size="small" type="number" value={imgHeight}
                            onChange={(e) => setImgHeight(Math.max(64, Math.min(2048, Number(e.target.value) || 1024)))}
                            disabled={loading}
                            inputProps={{ min: 64, max: 2048, step: 64 }}
                            sx={{ width: 90, fontSize: 12, "& input": { py: "4px", px: "8px" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e9d5ff" } }}
                        />
                        <Typography variant="caption" sx={{ color: "#bbb", fontSize: "10px" }}>px</Typography>
                        {[["1:1", 1024, 1024], ["16:9", 1024, 576], ["9:16", 576, 1024], ["4:3", 1024, 768]].map(([label, w, h]) => (
                            <Box
                                key={label}
                                component="button"
                                onClick={() => { setImgWidth(w); setImgHeight(h); }}
                                disabled={loading}
                                sx={{
                                    px: 1, py: "2px", fontSize: "10px", border: "1px solid",
                                    borderColor: imgWidth === w && imgHeight === h ? "#7c3aed" : "#e9d5ff",
                                    borderRadius: 1, cursor: "pointer", background: "none",
                                    color: imgWidth === w && imgHeight === h ? "#7c3aed" : "#999",
                                    fontWeight: imgWidth === w && imgHeight === h ? 700 : 400,
                                    "&:hover": { borderColor: "#a78bfa", color: "#7c3aed" },
                                }}
                            >
                                {label}
                            </Box>
                        ))}
                    </Box>
                    <Typography variant="caption" sx={{ color: "#a78bfa", fontSize: "10px", mt: 0.5, display: "block" }}>
                        Select one or more images to add them all to the field.
                    </Typography>
                </Box>

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
                    <Tab label="History" icon={<HistoryIcon sx={{ fontSize: 14 }} />} iconPosition="start" disabled={!fieldId} />
                </Tabs>

                <Box sx={{ p: 2, overflowY: "auto", flex: 1 }}>
                    {tab === 0 && (
                        <>
                            {!loading && images.length === 0 && !error && (
                                <Box sx={{ textAlign: "center", py: 4 }}>
                                    <ImageIcon sx={{ fontSize: 48, color: "#c4b5fd", mb: 1.5 }} />
                                    <Typography variant="body2" sx={{ color: "#555", fontWeight: 600, mb: 0.5 }}>
                                        Describe the images above
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: "#999" }}>
                                        3 options will be generated. Select any combination to add them.
                                    </Typography>
                                </Box>
                            )}
                            {loading && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 3, justifyContent: "center" }}>
                                    <CircularProgress size={20} sx={{ color: "#7c3aed" }} />
                                    <Typography variant="body2" sx={{ color: "#666" }}>Generating 3 images…</Typography>
                                </Box>
                            )}
                            {error && !loading && <Typography variant="body2" sx={{ color: "#d32f2f", py: 1 }}>{error}</Typography>}
                            {!loading && images.length > 0 && (
                                <>
                                    <Typography variant="caption" sx={{ color: "#888", fontWeight: 700, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", mb: 1.5 }}>
                                        Click to select / deselect — select multiple
                                    </Typography>
                                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.5 }}>
                                        {images.map((imgPath, idx) => {
                                            const src = imgPath.startsWith("http") ? imgPath : `${SITE_IMAGE_URL}${imgPath}`;
                                            const selected = selectedIndices.has(idx);
                                            return (
                                                <Paper
                                                    key={idx}
                                                    variant="outlined"
                                                    onClick={() => toggleGenerated(idx)}
                                                    sx={{
                                                        borderColor: selected ? "#7c3aed" : "#e9d5ff",
                                                        borderWidth: selected ? 2 : 1,
                                                        borderRadius: 1.5, overflow: "hidden", cursor: "pointer",
                                                        position: "relative", transition: "all 0.15s",
                                                        "&:hover": { borderColor: "#7c3aed", transform: "translateY(-2px)" },
                                                    }}
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={src} alt={`AI option ${idx + 1}`} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block" }} />
                                                    <Box sx={{
                                                        position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: "50%",
                                                        border: "2px solid #fff", backgroundColor: selected ? "#7c3aed" : "rgba(0,0,0,0.35)",
                                                        display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s",
                                                    }}>
                                                        {selected && <CheckIcon sx={{ fontSize: 13, color: "#fff" }} />}
                                                    </Box>
                                                    <Typography variant="caption" sx={{ display: "block", textAlign: "center", py: 0.5, color: selected ? "#7c3aed" : "#888", fontWeight: 700, fontSize: "10px" }}>
                                                        {selected ? "✓ Selected" : `Option ${idx + 1}`}
                                                    </Typography>
                                                </Paper>
                                            );
                                        })}
                                    </Box>
                                </>
                            )}
                        </>
                    )}

                    {tab === 1 && (
                        <>
                            {historyLoading && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 2 }}>
                                    <CircularProgress size={18} sx={{ color: "#7c3aed" }} />
                                    <Typography variant="body2" sx={{ color: "#666" }}>Loading history…</Typography>
                                </Box>
                            )}
                            {historyError && !historyLoading && <Typography variant="body2" sx={{ color: "#d32f2f", py: 1 }}>{historyError}</Typography>}
                            {!historyLoading && !historyError && historyRuns !== null && historyRuns.length === 0 && (
                                <Box sx={{ textAlign: "center", py: 4 }}>
                                    <HistoryIcon sx={{ fontSize: 36, color: "#d1d5db", mb: 1 }} />
                                    <Typography variant="body2" sx={{ color: "#999" }}>No image history yet.</Typography>
                                </Box>
                            )}
                            {!historyLoading && !historyError && historyRuns && historyRuns.length > 0 && (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                                    {historyRuns.map((run) => (
                                        <MultiHistoryRunCard
                                            key={run._id}
                                            run={run}
                                            selectedHistoryPaths={selectedHistoryPaths}
                                            onToggle={toggleHistoryPath}
                                        />
                                    ))}
                                </Box>
                            )}
                        </>
                    )}
                </Box>

                {totalSelected > 0 && (
                    <Box sx={{ px: 2, py: 1.5, borderTop: "1px solid #f3e8ff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Typography variant="caption" sx={{ color: "#7c3aed", fontWeight: 600 }}>
                            {totalSelected} image{totalSelected > 1 ? "s" : ""} selected
                        </Typography>
                        <Box
                            component="button"
                            onClick={tab === 0 ? handleApplyGenerated : handleApplyHistory}
                            sx={{
                                display: "inline-flex", alignItems: "center", gap: 0.75,
                                px: 2.5, py: 0.9, borderRadius: 1.5, border: "none", cursor: "pointer",
                                background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                                color: "#fff", fontSize: 13, fontWeight: 600,
                                "&:hover": { opacity: 0.9 },
                            }}
                        >
                            <CheckIcon sx={{ fontSize: 15 }} />
                            Add {totalSelected} Image{totalSelected > 1 ? "s" : ""}
                        </Box>
                    </Box>
                )}
            </Popover>
        </>
    );
};

// ── Sub-component: history run card with proper useState ─────────────────────
const MultiHistoryRunCard = ({ run, selectedHistoryPaths, onToggle }) => {
    const [expanded, setExpanded] = useState(false);
    const date = new Date(run.createdAt).toLocaleString();
    const selectedCount = run.generatedImages.filter((p) => selectedHistoryPaths.has(p)).length;

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
                        <Typography variant="caption" sx={{ color: "#888", ml: 1, fontSize: "11px" }}>
                            — "{run.prompt.slice(0, 60)}"
                        </Typography>
                    )}
                </Box>
                <Typography variant="caption" sx={{ color: selectedCount > 0 ? "#7c3aed" : "#a78bfa", fontSize: "11px", fontWeight: selectedCount > 0 ? 700 : 400 }}>
                    {selectedCount > 0 ? `${selectedCount} selected · ` : ""}
                    {expanded ? "▲ hide" : "▼ show"} {run.generatedImages.length} images
                </Typography>
            </Box>

            {expanded && (
                <Box sx={{ p: 1.5 }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
                        {run.generatedImages.map((imgPath, idx) => {
                            const src = imgPath.startsWith("http") ? imgPath : `${SITE_IMAGE_URL}${imgPath}`;
                            const isSelected = selectedHistoryPaths.has(imgPath);
                            return (
                                <Paper
                                    key={idx}
                                    variant="outlined"
                                    onClick={() => onToggle(imgPath)}
                                    sx={{
                                        borderColor: isSelected ? "#7c3aed" : "#e9d5ff",
                                        borderWidth: isSelected ? 2 : 1,
                                        borderRadius: 1.5, overflow: "hidden", cursor: "pointer",
                                        position: "relative", transition: "all 0.15s",
                                        "&:hover": { borderColor: "#7c3aed" },
                                    }}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={src} alt={`history ${idx + 1}`} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block" }} />
                                    <Box sx={{
                                        position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%",
                                        border: "2px solid #fff",
                                        backgroundColor: isSelected ? "#7c3aed" : "rgba(0,0,0,0.35)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        {isSelected && <CheckIcon sx={{ fontSize: 12, color: "#fff" }} />}
                                    </Box>
                                </Paper>
                            );
                        })}
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default AiMultiImageSuggestButton;
