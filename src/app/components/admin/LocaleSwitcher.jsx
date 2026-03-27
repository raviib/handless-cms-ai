"use client";
import { useState } from "react";
import { Button, Menu, MenuItem, Chip } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LanguageIcon from "@mui/icons-material/Language";
import ALL_LOCALES from "@/app/utils/db/internationalization.db.json";

/**
 * LocaleSwitcher
 * Props:
 *  - locales: string[]  — codes from page-config (e.g. ["en","hi"])
 *  - value: string      — currently selected locale code
 *  - onChange: (code) => void
 */
const LocaleSwitcher = ({ locales = ["en"], value = "en", onChange, isFallback = false }) => {
    const [anchor, setAnchor] = useState(null);

    // Only show if more than one locale is configured
    if (!locales || locales.length <= 1) return null;

    const current = ALL_LOCALES.find((l) => l.code === value) ?? { code: value, name: value, flag: "🌐" };

    return (
        <>
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
        </>
    );
};

export default LocaleSwitcher;
