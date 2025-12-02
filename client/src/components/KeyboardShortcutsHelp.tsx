import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"; // רכיב Shadcn UI
import { Keyboard } from "lucide-react";
import { Box, Typography, Chip, useTheme } from "@mui/material"; // 👈 ייבוא useTheme ו-Box/Typography/Chip
import { useTranslation } from "react-i18next";

// 👈 ייבוא useAccessibilityStore כדי לקבל את highContrast
import { useAccessibilityStore } from "../store/accessibilityStore";

import { heShortcutType } from "../types/i18n";

// הגדרת קיצורי הדרך
interface Shortcut {
  key: string;
  descriptionKey: keyof heShortcutType;
  categoryKey: keyof heShortcutType;
}

const rawShortcuts: Omit<Shortcut, "description">[] = [
  {
    key: "/",
    descriptionKey: "descriptionFocusSearch",
    categoryKey: "categoryNavigation",
  },
  {
    key: "Ctrl + K",
    descriptionKey: "descriptionFocusSearchAlt",
    categoryKey: "categoryNavigation",
  },
  {
    key: "C",
    descriptionKey: "descriptionOpenCategory",
    categoryKey: "categoryNavigation",
  },
  {
    key: "ESC",
    descriptionKey: "descriptionClearClose",
    categoryKey: "categoryNavigation",
  },
  {
    key: "↑ ↓ ← →",
    descriptionKey: "descriptionNavigateBooks",
    categoryKey: "categoryGridNavigation",
  },
  {
    key: "Enter",
    descriptionKey: "descriptionOpenBook",
    categoryKey: "categoryGridNavigation",
  },
  {
    key: "Space",
    descriptionKey: "descriptionOpenBookSpace",
    categoryKey: "categoryGridNavigation",
  },
  {
    key: "Home",
    descriptionKey: "descriptionGoToFirst",
    categoryKey: "categoryGridNavigation",
  },
  {
    key: "End",
    descriptionKey: "descriptionGoToLast",
    categoryKey: "categoryGridNavigation",
  },
  {
    key: "Ctrl + N",
    descriptionKey: "descriptionNextPage",
    categoryKey: "categoryPagination",
  },
  {
    key: "Ctrl + P",
    descriptionKey: "descriptionPreviousPage",
    categoryKey: "categoryPagination",
  },
  {
    key: "?",
    descriptionKey: "descriptionShowHelp",
    categoryKey: "categoryHelp",
  },
];

export function KeyboardShortcutsHelp() {
  const { t } = useTranslation(["keyboardShortcutsHelp", "common"]);
  const commonDir = t("common:dir") as "rtl" | "ltr";
  const theme = useTheme(); // 👈 שימוש ב-useTheme
  const { highContrast } = useAccessibilityStore(); // 👈 ייבוא highContrast
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          setIsOpen(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const groupedShortcuts = rawShortcuts.reduce((acc, shortcut) => {
    const translatedCategoryName = t(shortcut.categoryKey);
    if (!acc[translatedCategoryName]) {
      acc[translatedCategoryName] = [];
    }
    acc[translatedCategoryName].push(shortcut);
    return acc;
  }, {} as Record<string, Omit<Shortcut, "description">[]>);

  return (
    <>
      {/* כפתור קבוע בפינה - Chip */}
      <Box
        sx={{
          position: "fixed",
          bottom: 20,
          right: commonDir === "ltr" ? 20 : "auto",
          left: commonDir === "rtl" ? 20 : "auto",
          zIndex: 1000,
        }}
      >
        <Chip
          icon={<Keyboard size={16} />}
          label="?"
          onClick={() => setIsOpen(true)}
          sx={{
            cursor: "pointer",
            // ✅ צבע רקע דינמי
            bgcolor: theme.palette.primary.main,
            // ✅ צבע טקסט דינמי
            color: theme.palette.primary.contrastText,
            fontSize: "1rem",
            fontWeight: "bold",
            padding: "10px",
            "&:hover": {
              // ✅ ריחוף דינמי
              bgcolor: theme.palette.primary.dark,
            },
            // ✅ צל דינמי
            boxShadow: theme.shadows[3],
          }}
        />
      </Box>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {/* DialogContent - זהו רכיב Shadcn. יש לטפל בצבע הרקע שלו 
                  באמצעות style/sx כדי שיגיב ל-Theme/highContrast
                */}
        <DialogContent
          className="max-w-2xl max-h-[80vh] overflow-y-auto"
          style={{
            backgroundColor: highContrast
              ? theme.palette.background.default
              : theme.palette.background.paper,
            color: highContrast
              ? theme.palette.text.primary
              : theme.palette.text.primary,
            border: highContrast
              ? `2px solid ${theme.palette.text.primary}`
              : "none",
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Keyboard
                className="h-6 w-6"
                style={{ color: theme.palette.primary.main }}
              />
              {t("dialogTitle")}
            </DialogTitle>
          </DialogHeader>

          <Box sx={{ mt: 2 }}>
            {Object.entries(groupedShortcuts).map(
              ([category, categoryShortcuts]) => (
                <Box key={category} sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: "bold",
                      color: theme.palette.primary.main,
                      mb: 1,
                      borderBottom: `2px solid ${
                        highContrast
                          ? theme.palette.text.primary
                          : theme.palette.primary.main
                      }`,
                      pb: 0.5,
                    }}
                  >
                    {t(`category:${category.replace(/\s+/g, '')}`)}
                  </Typography>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {categoryShortcuts.map((shortcut, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          // ✅ רקע פריט דינמי
                          bgcolor: theme.palette.background.default,
                          borderRadius: 1,
                          "&:hover": {
                            // ✅ ריחוף דינמי
                            bgcolor: theme.palette.action.hover,
                          },
                          // ✅ גבול במצב ניגודיות גבוהה
                          border: highContrast
                            ? `1px solid ${theme.palette.text.primary}`
                            : "none",
                        }}
                      >
                        {/* ✅ צבע טקסט דינמי */}
                        <Typography
                          variant="body2"
                          sx={{ flex: 1 }}
                          color="text.primary"
                        >
                          {t(shortcut.descriptionKey)}
                        </Typography>
                        <Chip
                          label={shortcut.key}
                          size="small"
                          sx={{
                            // ✅ רקע דינמי
                            bgcolor: theme.palette.background.paper,
                            // ✅ גבול דינמי
                            border: `1px solid ${theme.palette.divider}`,
                            color: theme.palette.text.primary,
                            fontFamily: "monospace",
                            fontWeight: "bold",
                            minWidth: "80px",
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              )
            )}
          </Box>

          <Box
            sx={{
              mt: 3,
              pt: 2,
              // ✅ גבול עליון דינמי
              borderTop: `1px solid ${theme.palette.divider}`,
              textAlign: "center",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {t("closeHint", { components: { strong: <strong /> } })}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
