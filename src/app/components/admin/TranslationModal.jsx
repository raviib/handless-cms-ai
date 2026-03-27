"use client";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Chip, CircularProgress,
  RadioGroup, FormControlLabel, Radio, Divider, Alert,
  LinearProgress, Checkbox, Tooltip, IconButton,
} from "@mui/material";
import TranslateIcon from "@mui/icons-material/Translate";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import EditIcon from "@mui/icons-material/Edit";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { useState, useMemo, useEffect } from "react";
import { axiosInstance } from "@/app/config/axiosInstance";
import { TostSuccess } from "@/app/utils/tost/Tost";
import {
  collectAllTranslatableFields,
  applyTranslations,
} from "@/app/utils/translate/huggingface";

// Chip color per field type
const TYPE_COLOR = {
  "text": { bg: "#e0f2fe", color: "#0369a1" },
  "rich-text-blocks": { bg: "#fef9c3", color: "#854d0e" },
  "rich-text-markdown": { bg: "#f3e8ff", color: "#7e22ce" },
};

/**
 * TranslationModal
 * Props:
 *  - open: bool
 *  - onClose: () => void
 *  - formData: object
 *  - targetLang: string
 *  - targetLangName: string
 *  - Page_Fields: array
 *  - onApply: (updatedFormData) => void
 */
const TranslationModal = ({ open, onClose, formData, targetLang, targetLangName, Page_Fields, onApply }) => {
  const [choice, setChoice] = useState(null); // "ai" | "manual"
  const [translating, setTranslating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [error, setError] = useState(null);
  const [selectedPaths, setSelectedPaths] = useState(new Set());

  // Collect all translatable fields with their current values
  const allFields = useMemo(
    () => collectAllTranslatableFields(Page_Fields || [], formData || {}),
    [Page_Fields, formData]
  );

  // Only fields that actually have content
  const fieldsWithContent = useMemo(
    () => allFields.filter((f) => f.value && String(f.value).trim()),
    [allFields]
  );

  // Select all by default when modal opens
  useEffect(() => {
    if (open) {
      setSelectedPaths(new Set(fieldsWithContent.map((f) => f.path)));
      setChoice(null);
      setError(null);
      setProgress(0);
    }
  }, [open, fieldsWithContent.length]);

  const selectedFields = fieldsWithContent.filter((f) => selectedPaths.has(f.path));
  const allSelected = selectedFields.length === fieldsWithContent.length;
  const noneSelected = selectedFields.length === 0;

  const toggleField = (path) => {
    setSelectedPaths((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedPaths(new Set());
    } else {
      setSelectedPaths(new Set(fieldsWithContent.map((f) => f.path)));
    }
  };

  const handleAITranslate = async () => {
    setTranslating(true);
    setError(null);
    setProgress(0);

    try {
      const toTranslate = selectedFields;
      const texts = toTranslate.map((f) => String(f.value));
      const CHUNK = 5;
      const allTranslated = [];

      for (let i = 0; i < texts.length; i += CHUNK) {
        const chunk = texts.slice(i, i + CHUNK);
        setProgressLabel(`Translating ${i + 1}–${Math.min(i + CHUNK, texts.length)} of ${texts.length}...`);

        const { generateApiAccessToken } = await import("@/app/lib/auth.improved.js");
        const token = await generateApiAccessToken();

        const { data: res } = await axiosInstance.post(
          "/translate",
          { texts: chunk, targetLang },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res?.success) throw new Error(res?.message || "Translation failed");
        allTranslated.push(...res.translated);
        setProgress(Math.round(((i + chunk.length) / texts.length) * 100));
      }

      const translationMap = toTranslate.map((f, i) => ({
        path: f.path,
        translated: allTranslated[i] ?? f.value,
      }));

      const updatedFormData = applyTranslations(formData, translationMap);
      TostSuccess(`${toTranslate.length} field${toTranslate.length !== 1 ? "s" : ""} translated successfully`);
      onApply(updatedFormData);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Translation failed. Please try again.");
    } finally {
      setTranslating(false);
      setProgress(0);
      setProgressLabel("");
    }
  };

  const handleConfirm = () => {
    if (choice === "ai") handleAITranslate();
    else if (choice === "manual") onClose();
  };

  const handleClose = () => {
    if (translating) return;
    setChoice(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, maxHeight: "90vh" } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
        <TranslateIcon sx={{ color: "#f59e0b" }} />
        <Typography variant="h6" fontWeight={600}>
          Translate to {targetLangName}
        </Typography>
        <Chip label="No translation" size="small" color="warning" sx={{ ml: "auto", height: 20, fontSize: 11 }} />
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>

        {/* How to translate */}
        <Box>
          <Typography variant="body2" fontWeight={600} mb={1}>
            How would you like to translate?
          </Typography>
          <RadioGroup row value={choice} onChange={(e) => setChoice(e.target.value)} sx={{ gap: 1 }}>
            <FormControlLabel
              value="ai"
              control={<Radio size="small" />}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <SmartToyIcon fontSize="small" sx={{ color: "#6366f1" }} />
                  <Box>
                    <Typography variant="body2" fontWeight={600} lineHeight={1.2}>AI Translation</Typography>
                    <Typography variant="caption" color="text.secondary">Auto-translate using HuggingFace</Typography>
                  </Box>
                </Box>
              }
              sx={{
                flex: 1, m: 0, p: 1.5,
                border: choice === "ai" ? "2px solid #6366f1" : "1px solid #e0e0e0",
                borderRadius: 2, alignItems: "flex-start",
              }}
            />
            <FormControlLabel
              value="manual"
              control={<Radio size="small" />}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <EditIcon fontSize="small" sx={{ color: "#10b981" }} />
                  <Box>
                    <Typography variant="body2" fontWeight={600} lineHeight={1.2}>Manual</Typography>
                    <Typography variant="caption" color="text.secondary">I'll fill in the fields myself</Typography>
                  </Box>
                </Box>
              }
              sx={{
                flex: 1, m: 0, p: 1.5,
                border: choice === "manual" ? "2px solid #10b981" : "1px solid #e0e0e0",
                borderRadius: 2, alignItems: "flex-start",
              }}
            />
          </RadioGroup>
        </Box>

        {/* Field selection — only relevant for AI */}
        {choice === "ai" && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                Select fields to translate
                <Typography component="span" variant="caption" color="text.secondary" ml={1}>
                  ({selectedFields.length} of {fieldsWithContent.length} selected)
                </Typography>
              </Typography>
              <Tooltip title={allSelected ? "Deselect all" : "Select all"}>
                <IconButton size="small" onClick={toggleAll}>
                  {allSelected
                    ? <CheckBoxIcon fontSize="small" sx={{ color: "#6366f1" }} />
                    : <CheckBoxOutlineBlankIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>

            {fieldsWithContent.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                No translatable fields with content found.
              </Typography>
            ) : (
              <Box
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 1.5,
                  overflow: "hidden",
                  maxHeight: 320,
                  overflowY: "auto",
                }}
              >
                {fieldsWithContent.map((f, i) => {
                  const checked = selectedPaths.has(f.path);
                  const typeStyle = TYPE_COLOR[f.type] || { bg: "#f3f4f6", color: "#374151" };
                  const preview = String(f.value).replace(/<[^>]+>/g, "").slice(0, 80);

                  return (
                    <Box
                      key={f.path}
                      onClick={() => toggleField(f.path)}
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                        px: 1.5,
                        py: 1,
                        cursor: "pointer",
                        bgcolor: checked ? "#f5f3ff" : "transparent",
                        borderBottom: i < fieldsWithContent.length - 1 ? "1px solid #f0f0f0" : "none",
                        "&:hover": { bgcolor: checked ? "#ede9fe" : "#fafafa" },
                        transition: "background 0.15s",
                      }}
                    >
                      <Checkbox
                        checked={checked}
                        size="small"
                        sx={{ p: 0, mt: 0.2, color: "#6366f1", "&.Mui-checked": { color: "#6366f1" } }}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleField(f.path)}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                          <Chip
                            label={f.type}
                            size="small"
                            sx={{
                              height: 18, fontSize: 10, fontWeight: 600,
                              bgcolor: typeStyle.bg, color: typeStyle.color,
                              border: "none",
                            }}
                          />
                          <Typography variant="caption" fontWeight={600} color="#333" sx={{ wordBreak: "break-word" }}>
                            {f.label}
                          </Typography>
                        </Box>
                        {preview && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mt: 0.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          >
                            {preview}{String(f.value).length > 80 ? "…" : ""}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        )}

        {/* Progress */}
        {translating && (
          <Box>
            <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
              {progressLabel || `Translating... ${progress}%`}
            </Typography>
            <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 1, height: 6 }} />
          </Box>
        )}

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={handleClose} disabled={translating} variant="outlined" size="small">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!choice || translating || (choice === "ai" && noneSelected)}
          variant="contained"
          size="small"
          startIcon={translating ? <CircularProgress size={14} color="inherit" /> : <TranslateIcon />}
          sx={{
            bgcolor: choice === "manual" ? "#10b981" : "#6366f1",
            "&:hover": { bgcolor: choice === "manual" ? "#059669" : "#4f46e5" },
            "&.Mui-disabled": { bgcolor: "#e0e0e0" },
          }}
        >
          {translating
            ? `Translating... ${progress}%`
            : choice === "manual"
            ? "Translate Manually"
            : `Translate ${selectedFields.length} field${selectedFields.length !== 1 ? "s" : ""} with AI`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TranslationModal;
