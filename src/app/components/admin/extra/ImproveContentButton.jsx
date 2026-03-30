"use client";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";
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
import { useRef, useState } from "react";
import { axiosInstance } from "@/app/config/axiosInstance";
import { generateApiAccessToken } from "@/app/lib/auth.improved.js";

/** Module-level in-memory cache (cleared on page reload) */
const suggestionCache = new Map();

function cacheKey(text, fieldType, locale, prompt) {
    return `${fieldType}::${locale}::${prompt?.trim() || ""}::${text}`;
}

/**
 * ImproveContentButton
 *
 * Props:
 *  - value        : string  — current field value
 *  - fieldType    : "text" | "rich-text-blocks" | "rich-text-markdown"
 *  - locale       : string  — active locale code
 *  - fieldId      : string  — dot-path id e.g. "about-us-page.visionMission.title"
 *  - onApply      : (newValue: string) => void
 */
const ImproveContentButton = ({ value, fieldType = "text", locale = "en", fieldId = "", onApply }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [tab, setTab] = useState(0); // 0 = Suggestions, 1 = History
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [error, setError] = useState(null);
    const [prompt, setPrompt] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [originalValue, setOriginalValue] = useState("");

    // History state
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyRuns, setHistoryRuns] = useState(null); // null = not loaded yet
    const [historyError, setHistoryError] = useState(null);

    const promptRef = useRef(null);
    const hasContent = value && String(value).trim().length > 0;
    const isEmpty = !hasContent;
    const open = Boolean(anchorEl);

    // ── Fetch AI suggestions ──────────────────────────────────────────────────
    const fetchSuggestions = async (customPrompt = "") => {
        const key = cacheKey(value, fieldType, locale, customPrompt);
        if (suggestionCache.has(key)) {
            setSuggestions(suggestionCache.get(key));
            setSelectedIndex(null);
            return;
        }

        setLoading(true);
        setError(null);
        setSuggestions([]);
        setSelectedIndex(null);

        try {
            const token = await generateApiAccessToken();
            const { data } = await axiosInstance.post(
                "/content/improve",
                { text: value, fieldType, locale, prompt: customPrompt, fieldId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success && Array.isArray(data.suggestions)) {
                suggestionCache.set(key, data.suggestions);
                setSuggestions(data.suggestions);
            } else {
                setError(data.message || "Failed to generate suggestions");
            }
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to generate suggestions");
        } finally {
            setLoading(false);
        }
    };

    // ── Generate from scratch (empty field) ──────────────────────────────────
    const fetchSuggestionsFromScratch = async (userPrompt) => {
        setLoading(true);
        setError(null);
        setSuggestions([]);
        setSelectedIndex(null);

        try {
            const token = await generateApiAccessToken();
            const { data } = await axiosInstance.post(
                "/content/improve",
                {
                    text: userPrompt,          // use the prompt as the source
                    fieldType,
                    locale,
                    prompt: "",                // no extra instruction needed
                    fieldId,
                    generateFromScratch: true, // hint for the API
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success && Array.isArray(data.suggestions)) {
                setSuggestions(data.suggestions);
                // Load history now that we have results
                if (fieldId) fetchHistory();
            } else {
                setError(data.message || "Failed to generate content");
            }
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to generate content");
        } finally {
            setLoading(false);
        }
    };

    // ── Fetch history from DB ─────────────────────────────────────────────────
    const fetchHistory = async () => {
        if (!fieldId) return;
        setHistoryLoading(true);
        setHistoryError(null);
        try {
            const token = await generateApiAccessToken();
            const { data } = await axiosInstance.get(
                `/content/history?fieldId=${encodeURIComponent(fieldId)}&locale=${locale}&limit=20`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                setHistoryRuns(data.data || []);
            } else {
                setHistoryError(data.message || "Failed to load history");
            }
        } catch (err) {
            setHistoryError(err?.response?.data?.message || "Failed to load history");
        } finally {
            setHistoryLoading(false);
        }
    };

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleOpen = (e) => {
        e.stopPropagation();
        setOriginalValue(value || "");
        setSelectedIndex(null);
        setTab(0);
        setAnchorEl(e.currentTarget);

        if (isEmpty) {
            // Empty field — don't auto-generate, wait for user prompt
            setPrompt("");
            setSuggestions([]);
            setError(null);
        } else {
            setPrompt("");
            fetchSuggestions("");
            if (fieldId && historyRuns === null) fetchHistory();
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
        setSelectedIndex(null);
    };

    const handleTabChange = (_, newTab) => {
        setTab(newTab);
        // Reload history when switching to it
        if (newTab === 1 && fieldId) fetchHistory();
    };

    const handlePromptSubmit = () => {
        if (!prompt.trim()) return;
        setSelectedIndex(null);

        if (isEmpty) {
            // Generate from scratch — use the prompt as the source text
            fetchSuggestionsFromScratch(prompt);
        } else {
            const key = cacheKey(value, fieldType, locale, prompt);
            suggestionCache.delete(key);
            fetchSuggestions(prompt);
        }
        setTab(0);
    };

    const handleApply = () => {
        if (selectedIndex === null) return;
        onApply(suggestions[selectedIndex]);
        handleClose();
    };

    const handleApplyFromHistory = (suggestion) => {
        onApply(suggestion);
        handleClose();
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <Tooltip title={isEmpty ? "Generate content with AI" : "Improve content with AI"} placement="top">
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
                            width: 600,
                            maxWidth: "96vw",
                            borderRadius: 2,
                            boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
                            border: "1px solid #e9d5ff",
                            display: "flex",
                            flexDirection: "column",
                            maxHeight: "82vh",
                        },
                    },
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <Box
                    sx={{
                        px: 2,
                        py: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                        borderRadius: "8px 8px 0 0",
                        flexShrink: 0,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <AutoFixHighIcon sx={{ color: "#fff", fontSize: 18 }} />
                        <Typography variant="subtitle2" sx={{ color: "#fff", fontWeight: 600 }}>
                            AI Content Suggestions
                        </Typography>
                        {fieldId && (
                            <Typography
                                variant="caption"
                                sx={{
                                    color: "rgba(255,255,255,0.65)",
                                    fontSize: "10px",
                                    fontFamily: "monospace",
                                    ml: 0.5,
                                    maxWidth: 200,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {fieldId}
                            </Typography>
                        )}
                    </Box>
                    <IconButton size="small" onClick={handleClose} sx={{ color: "#fff", p: "2px" }}>
                        <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Box>

                {/* ── Prompt input ── */}
                <Box sx={{ px: 2, pt: 1.5, pb: 1, flexShrink: 0, borderBottom: "1px solid #f3e8ff" }}>
                    <OutlinedInput
                        inputRef={promptRef}
                        size="small"
                        fullWidth
                        placeholder={isEmpty
                            ? "Describe what you want to generate…"
                            : 'e.g. "make it more formal", "shorter", "add a CTA"…'
                        }
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") { e.preventDefault(); handlePromptSubmit(); }
                        }}
                        disabled={loading}
                        sx={{
                            fontSize: 13,
                            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e9d5ff" },
                            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#a78bfa" },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#7c3aed" },
                        }}
                        endAdornment={
                            <InputAdornment position="end">
                                <Tooltip title={isEmpty ? "Generate content" : "Generate with this prompt"}>
                                    <span>
                                        <IconButton
                                            size="small"
                                            onClick={handlePromptSubmit}
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
                </Box>

                {/* ── Tabs (only shown when field has content) ── */}
                {!isEmpty && (
                    <Tabs
                        value={tab}
                        onChange={handleTabChange}
                        sx={{
                            flexShrink: 0,
                            minHeight: 36,
                            borderBottom: "1px solid #f3e8ff",
                            "& .MuiTab-root": { minHeight: 36, fontSize: 12, textTransform: "none", py: 0 },
                            "& .Mui-selected": { color: "#7c3aed" },
                            "& .MuiTabs-indicator": { backgroundColor: "#7c3aed" },
                        }}
                    >
                        <Tab label="Suggestions" />
                        <Tab
                            label="History"
                            icon={<HistoryIcon sx={{ fontSize: 14 }} />}
                            iconPosition="start"
                            disabled={!fieldId}
                        />
                    </Tabs>
                )}

                {/* ── Body ── */}
                <Box sx={{ p: 2, overflowY: "auto", flex: 1 }}>

                    {/* ── EMPTY FIELD STATE ── */}
                    {isEmpty && suggestions.length === 0 && !loading && !error && (
                        <Box sx={{ textAlign: "center", py: 3 }}>
                            <AutoFixHighIcon sx={{ fontSize: 40, color: "#c4b5fd", mb: 1.5 }} />
                            <Typography variant="body2" sx={{ color: "#555", fontWeight: 600, mb: 0.5 }}>
                                This field is empty
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#999", display: "block", mb: 2 }}>
                                Describe what you want to generate above and press ↵ or the send button.
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#bbb", fontStyle: "italic" }}>
                                e.g. "A short tagline about sustainable laminates" or "Hero subtitle for a flooring brand"
                            </Typography>
                        </Box>
                    )}

                    {loading && <LoadingRow label={isEmpty ? "Generating content…" : "Generating suggestions…"} />}

                    {error && !loading && (
                        <Typography variant="body2" sx={{ color: "#d32f2f", py: 1 }}>{error}</Typography>
                    )}

                    {/* ── SUGGESTIONS TAB (or generated results for empty field) ── */}
                    {(isEmpty || tab === 0) && !loading && !error && suggestions.length > 0 && (
                        <>
                            {/* Current value — only shown when field had content */}
                            {!isEmpty && originalValue && (
                                <Box sx={{ mb: 2 }}>
                                    <SectionLabel>Current</SectionLabel>
                                    <ContentCard sx={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb" }}>
                                        <ContentPreview value={originalValue} fieldType={fieldType} color="#555" />
                                    </ContentCard>
                                </Box>
                            )}

                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                <SectionLabel>
                                    {isEmpty ? "Generated options — click one to select" : "Suggestions — click one to select"}
                                </SectionLabel>
                                {suggestions.map((suggestion, idx) => (
                                    <SuggestionCard
                                        key={idx}
                                        index={idx}
                                        suggestion={suggestion}
                                        fieldType={fieldType}
                                        selected={selectedIndex === idx}
                                        onSelect={() => setSelectedIndex(idx)}
                                    />
                                ))}
                            </Box>
                        </>
                    )}

                    {/* ── HISTORY TAB ── */}
                    {!isEmpty && tab === 1 && (
                        <>
                            {historyLoading && <LoadingRow label="Loading history…" />}

                            {historyError && !historyLoading && (
                                <Typography variant="body2" sx={{ color: "#d32f2f", py: 1 }}>{historyError}</Typography>
                            )}

                            {!historyLoading && !historyError && historyRuns !== null && historyRuns.length === 0 && (
                                <Box sx={{ textAlign: "center", py: 4 }}>
                                    <HistoryIcon sx={{ fontSize: 36, color: "#d1d5db", mb: 1 }} />
                                    <Typography variant="body2" sx={{ color: "#999", mb: 1 }}>
                                        No history yet for this field.
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: "#bbb" }}>
                                        Generate suggestions to start building history.
                                    </Typography>
                                </Box>
                            )}

                            {!historyLoading && !historyError && historyRuns && historyRuns.length > 0 && (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                                    {historyRuns.map((run) => (
                                        <HistoryRunCard
                                            key={run._id}
                                            run={run}
                                            fieldType={fieldType}
                                            onApply={handleApplyFromHistory}
                                        />
                                    ))}
                                </Box>
                            )}
                        </>
                    )}
                </Box>

                {/* ── Footer Apply button (suggestions tab only) ── */}
                {tab === 0 && selectedIndex !== null && (
                    <Box
                        sx={{
                            px: 2,
                            py: 1.5,
                            borderTop: "1px solid #f3e8ff",
                            flexShrink: 0,
                            display: "flex",
                            justifyContent: "flex-end",
                        }}
                    >
                        <Box
                            component="button"
                            onClick={handleApply}
                            sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.75,
                                px: 2.5,
                                py: 0.9,
                                borderRadius: 1.5,
                                border: "none",
                                cursor: "pointer",
                                background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                                color: "#fff",
                                fontSize: 13,
                                fontWeight: 600,
                                "&:hover": { opacity: 0.9 },
                            }}
                        >
                            <CheckIcon sx={{ fontSize: 15 }} />
                            Apply Option {selectedIndex + 1}
                        </Box>
                    </Box>
                )}
            </Popover>
        </>
    );
};

// ── Small shared sub-components ───────────────────────────────────────────────

const SectionLabel = ({ children }) => (
    <Typography
        variant="caption"
        sx={{
            color: "#888",
            fontWeight: 700,
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            display: "block",
            mb: 0.75,
        }}
    >
        {children}
    </Typography>
);

const ContentCard = ({ children, sx = {} }) => (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, ...sx }}>
        {children}
    </Paper>
);

const ContentPreview = ({ value, fieldType, color = "#333" }) => {
    if (fieldType === "rich-text-markdown") {
        return (
            <div
                style={{ fontSize: 13, lineHeight: 1.6, color, wordBreak: "break-word" }}
                dangerouslySetInnerHTML={{ __html: value }}
            />
        );
    }
    return (
        <Typography variant="body2" sx={{ color, lineHeight: 1.6, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
            {value}
        </Typography>
    );
};

const LoadingRow = ({ label }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 2 }}>
        <CircularProgress size={18} sx={{ color: "#7c3aed" }} />
        <Typography variant="body2" sx={{ color: "#666" }}>{label}</Typography>
    </Box>
);

/** Suggestion card — click to select, Apply button commits */
const SuggestionCard = ({ index, suggestion, fieldType, selected, onSelect }) => (
    <Paper
        variant="outlined"
        onClick={onSelect}
        sx={{
            p: 1.5,
            borderColor: selected ? "#7c3aed" : "#e9d5ff",
            borderRadius: 1.5,
            cursor: "pointer",
            backgroundColor: selected ? "#faf5ff" : "#fff",
            transition: "all 0.15s",
            "&:hover": { borderColor: "#7c3aed", backgroundColor: "#faf5ff" },
        }}
    >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}>
            <Typography
                variant="caption"
                sx={{ color: selected ? "#5b21b6" : "#7c3aed", fontWeight: 700, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}
            >
                Option {index + 1}
            </Typography>
            {selected && (
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.25, px: 0.75, py: 0.1, borderRadius: 10, backgroundColor: "#ede9fe", fontSize: "9px", color: "#5b21b6", fontWeight: 600 }}>
                    <CheckIcon sx={{ fontSize: 10 }} /> Selected
                </Box>
            )}
        </Box>
        <ContentPreview value={suggestion} fieldType={fieldType} />
    </Paper>
);

/** One history run — shows the original value + all suggestions from that run */
const HistoryRunCard = ({ run, fieldType, onApply }) => {
    const [expanded, setExpanded] = useState(false);
    const date = new Date(run.createdAt).toLocaleString();

    return (
        <Box sx={{ border: "1px solid #e9d5ff", borderRadius: 1.5, overflow: "hidden" }}>
            {/* Run header */}
            <Box
                onClick={() => setExpanded((v) => !v)}
                sx={{
                    px: 1.5,
                    py: 1,
                    backgroundColor: "#faf5ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#f3e8ff" },
                }}
            >
                <Box>
                    <Typography variant="caption" sx={{ color: "#7c3aed", fontWeight: 600, fontSize: "11px" }}>
                        {date}
                    </Typography>
                    {run.prompt && (
                        <Typography variant="caption" sx={{ color: "#888", ml: 1, fontSize: "11px" }}>
                            — "{run.prompt}"
                        </Typography>
                    )}
                </Box>
                <Typography variant="caption" sx={{ color: "#a78bfa", fontSize: "11px" }}>
                    {expanded ? "▲ hide" : "▼ show"} {run.suggestions.length} suggestions
                </Typography>
            </Box>

            {/* Suggestions from this run */}
            {expanded && (
                <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
                    {run.originalValue && (
                        <Box sx={{ mb: 1 }}>
                            <SectionLabel>Original at that time</SectionLabel>
                            <ContentCard sx={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb" }}>
                                <ContentPreview value={run.originalValue} fieldType={fieldType} color="#777" />
                            </ContentCard>
                        </Box>
                    )}
                    <SectionLabel>Suggestions</SectionLabel>
                    {run.suggestions.map((s, idx) => (
                        <Paper
                            key={idx}
                            variant="outlined"
                            sx={{
                                p: 1.25,
                                borderColor: "#e9d5ff",
                                borderRadius: 1.5,
                                cursor: "pointer",
                                transition: "all 0.15s",
                                "&:hover": { borderColor: "#7c3aed", backgroundColor: "#faf5ff" },
                            }}
                            onClick={() => onApply(s)}
                        >
                            <Typography variant="caption" sx={{ color: "#7c3aed", fontWeight: 700, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", mb: 0.5 }}>
                                Option {idx + 1}
                            </Typography>
                            <ContentPreview value={s} fieldType={fieldType} />
                        </Paper>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default ImproveContentButton;
