"use client";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CloseIcon from "@mui/icons-material/Close";
import EditNoteIcon from "@mui/icons-material/EditNote";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { axiosInstance } from "@/app/config/axiosInstance";
import { generateApiAccessToken } from "@/app/lib/auth.improved.js";

/**
 * Collect all fields with aiEnabled=true or aiPrompt set from page config sections.
 * Returns array of { key, label, type, aiPrompt }
 */
function collectAiInputFields(sections) {
    const fields = [];
    function walk(fieldList) {
        for (const field of fieldList) {
            const key = field.field?.value ?? field.field;
            if (!key) continue;
            if (field.type === "component" && Array.isArray(field.fields)) {
                walk(field.fields);
            } else if (field.aiEnabled === true) {
                fields.push({
                    key,
                    label: field.Printvalue || key,
                    type: field.type,
                    aiPrompt: field.aiPrompt || "",
                });
            }
        }
    }
    for (const section of sections) {
        if (Array.isArray(section.fields)) walk(section.fields);
    }
    return fields;
}

/**
 * AiAgentModal
 *
 * Props:
 *  - open           : boolean
 *  - onClose        : () => void
 *  - createLink     : string  — the manual create URL
 *  - sections       : array   — page config sections
 *  - moduleAiPrompt : string  — top-level AI prompt from page config
 *  - locale         : string
 */
export default function AiAgentModal({
    open,
    onClose,
    createLink,
    sections = [],
    moduleAiPrompt = "",
    locale = "en",
}) {
    const router = useRouter();

    // Step: "choice" | "inputs" | "loading" | "done"
    const [step, setStep] = useState("choice");
    const [userInputs, setUserInputs] = useState({});
    const [error, setError] = useState(null);

    const aiInputFields = collectAiInputFields(sections);

    const handleManual = () => {
        onClose();
        router.push(createLink);
    };

    const handleAiChoice = () => {
        // Pre-fill empty inputs
        const initial = {};
        for (const f of aiInputFields) initial[f.key] = "";
        setUserInputs(initial);
        setStep("inputs");
    };

    const handleGenerate = async () => {
        setStep("loading");
        setError(null);
        try {
            const token = await generateApiAccessToken();
            const { data } = await axiosInstance.post(
                "/content/ai-generate",
                { userInputs, sections, moduleAiPrompt, locale },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success && data.data) {
                // Encode generated data into URL query param and navigate to create page
                const encoded = encodeURIComponent(JSON.stringify(data.data));
                router.push(`${createLink}?ai_prefill=${encoded}`);
                onClose();
            } else {
                setError(data.message || "AI generation failed");
                setStep("inputs");
            }
        } catch (err) {
            setError(err?.response?.data?.message || "AI generation failed");
            setStep("inputs");
        }
    };

    const handleClose = () => {
        setStep("choice");
        setUserInputs({});
        setError(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" gap={1}>
                        <AutoFixHighIcon color="primary" />
                        <Typography variant="h6" fontWeight={600}>
                            Add New Entry
                        </Typography>
                    </Stack>
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <Divider />

            <DialogContent>
                {/* Step: choice */}
                {step === "choice" && (
                    <Stack spacing={2} py={1}>
                        <Typography variant="body2" color="text.secondary">
                            How would you like to create this entry?
                        </Typography>

                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<SmartToyIcon />}
                            onClick={handleAiChoice}
                            sx={{ justifyContent: "flex-start", py: 1.5, px: 2 }}
                        >
                            <Box textAlign="left">
                                <Typography variant="subtitle2" fontWeight={700}>
                                    AI Agent
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                                    Provide a few inputs and let AI generate the content
                                </Typography>
                            </Box>
                        </Button>

                        <Button
                            variant="outlined"
                            size="large"
                            startIcon={<EditNoteIcon />}
                            onClick={handleManual}
                            sx={{ justifyContent: "flex-start", py: 1.5, px: 2 }}
                        >
                            <Box textAlign="left">
                                <Typography variant="subtitle2" fontWeight={700}>
                                    Manually
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Fill in all fields yourself
                                </Typography>
                            </Box>
                        </Button>
                    </Stack>
                )}

                {/* Step: inputs */}
                {step === "inputs" && (
                    <Stack spacing={2} py={1}>
                        <Typography variant="body2" color="text.secondary">
                            Provide context for the AI to generate your content. Fill in what you know.
                        </Typography>

                        {aiInputFields.map((field) => (
                            <TextField
                                key={field.key}
                                label={field.label}
                                placeholder={field.aiPrompt?.split("\n")[0]?.replace(/^-\s*/, "") || `Enter ${field.label}`}
                                value={userInputs[field.key] || ""}
                                onChange={(e) =>
                                    setUserInputs((prev) => ({ ...prev, [field.key]: e.target.value }))
                                }
                                multiline={field.type !== "text"}
                                rows={field.type !== "text" ? 3 : 1}
                                fullWidth
                                size="small"
                            />
                        ))}

                        {error && (
                            <Typography variant="caption" color="error">
                                {error}
                            </Typography>
                        )}

                        <Stack direction="row" spacing={1} justifyContent="flex-end" pt={1}>
                            <Button variant="text" onClick={() => setStep("choice")}>
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                endIcon={<SendIcon />}
                                onClick={handleGenerate}
                            >
                                Generate
                            </Button>
                        </Stack>
                    </Stack>
                )}

                {/* Step: loading */}
                {step === "loading" && (
                    <Stack alignItems="center" spacing={2} py={4}>
                        <CircularProgress />
                        <Typography variant="body2" color="text.secondary">
                            AI is generating your content...
                        </Typography>
                    </Stack>
                )}
            </DialogContent>
        </Dialog>
    );
}
