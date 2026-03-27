"use client";
import { useState } from "react";
import { Button, Menu, MenuItem, Chip, Box } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import TranslateIcon from "@mui/icons-material/Translate";
import ALL_LOCALES from "@/app/utils/db/internationalization.db.json";

/**
 * LocaleSwitcher
 * Props:
 *  - locales: string[]  — codes from page-config (e.g. ["en","hi"])
 *  - value: string      — currently selected locale code
 *  - onChange: (code) => void
 *  - onTranslateClick: () => void — opens translation modal
 */
const LocaleSwitcher = ({ locales = ["en"], value = "en", onChange, isFallback = false, onTranslateClick }) => {
    const [anchor, setAnchor] = useState(null);

    if (!locales || locales.length <= 1) return null;

    const current = ALL_LOCALES.find((l) => l.code === value) ?? { code: value, name: value, flag: "🌐" };

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
                variant="outlined"
                size="small"
                endIcon={<KeyboardArrowDownIcon />}
                startIcon={<span style={{ fontSize: 16 }}>{current.flag}</span>}
                onClick={(e) => setAnchor(e.currentTarget)}
                sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "8px",
                    borderColor: isFallback ? "#f59e0b" : "#d0d0d0",
                    color: "#333",
                    gap: 0.5,
                    "&:hover": { borderColor: "#999", background: "#f5f5f5" },
                }}
            >
                {current.name} ({current.code})
                {isFallback && (
                    <Chip label="No translation" size="small" color="warning" sx={{ ml: 1, height: 20, fontSize: 11 }} />
                )}
            </Button>

            {/* Translate button — only when viewing a non-English locale with no translation yet */}
            {isFallback && value !== "en" && (
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<TranslateIcon />}
                    onClick={onTranslateClick}
                    sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: "8px",
                        bgcolor: "#f59e0b",
                        color: "#fff",
                        "&:hover": { bgcolor: "#d97706" },
                    }}
                >
                    Translate
                </Button>
            )}

            <Menu
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={() => setAnchor(null)}
                PaperProps={{ sx: { minWidth: 200, borderRadius: "10px", mt: 0.5 } }}
            >
                {locales.map((code) => {
                    const locale = ALL_LOCALES.find((l) => l.code === code) ?? { code, name: code, flag: "🌐" };
                    return (
                        <MenuItem
                            key={code}
                            selected={code === value}
                            onClick={() => { onChange?.(code); setAnchor(null); }}
                            sx={{ gap: 1.5, fontWeight: code === value ? 700 : 400 }}
                        >
                            <span style={{ fontSize: 18 }}>{locale.flag}</span>
                            {locale.name}
                            {code === "en" && (
                                <Chip label="Default" size="small" color="primary" sx={{ ml: "auto", height: 20, fontSize: 11 }} />
                            )}
                        </MenuItem>
                    );
                })}
            </Menu>
        </Box>
    );
};

export default LocaleSwitcher;
