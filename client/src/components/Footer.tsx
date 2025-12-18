import { Link } from "react-router-dom";
import { BookOpen, Heart, Sparkles, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Box, Typography, useTheme } from "@mui/material";
const FloatingElement = ({ children, delay = 0, duration = 3 }: { children: React.ReactNode; delay?: number; duration?: number }) => {
  return (
    <div
      className="animate-float"
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`
      }}
    >
      {children}
    </div>
  );
};
export function Footer() {
  const { t } = useTranslation(["footer", "common"]);
  const currentYear = new Date().getFullYear();
  const commonDir = t("common:dir") as "rtl" | "ltr";
  const theme = useTheme();

  const originalColors = {
    bg: "#0f172a",
    textSecondary: "#cbd5e1",
    textPrimary: "#ffffff",
    highlight: "#4ade80",
    divider: "#1e293b",
  };

  const getDynamicColor = (
    key: keyof typeof originalColors,
    type: "bg" | "text" | "link" | "divider"
  ) => {
    if (theme.palette.mode === "light") {
      return originalColors[key];
    }

    switch (type) {
      case "bg":
        return theme.palette.background.paper;
      case "text":
        return key === "textPrimary"
          ? theme.palette.text.primary
          : theme.palette.text.secondary;
      case "link":
        return theme.palette.text.secondary;
      case "divider":
        return theme.palette.divider;
      default:
        return originalColors[key];
    }
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: getDynamicColor("bg", "bg"),
        color: getDynamicColor("textSecondary", "text"),
        mt: "auto",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          className="grid grid-cols-1 md:grid-cols-4 gap-8"
          style={{ direction: commonDir }}
        >
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <FloatingElement delay={0} duration={5}>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <BookOpen
                    className="h-8 w-8"
                    style={{ color: getDynamicColor("highlight", "link") }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      color: getDynamicColor("textPrimary", "text"),
                      fontWeight: "bold",
                    }}
                  >
                    BookNest
                  </Typography>
                </div>
              </FloatingElement>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: getDynamicColor("textSecondary", "text"),
                maxWidth: "400px",
              }}
            >
              {t("tagline")}
            </Typography>
          </div>

          {/* Quick Links */}
          <div>
            <Typography
              variant="subtitle1"
              sx={{
                color: getDynamicColor("textPrimary", "text"),
                mb: 2,
                fontWeight: "bold",
              }}
            >
              {t("quickLinksTitle")}
            </Typography>
            <ul className="space-y-2">
              {[
                { to: "/home", icon: Home, text: t("linkHome") },
                { to: "/my-books", icon: BookOpen, text: t("linkMyBooks") },
                { to: "/favorites", icon: Heart, text: t("linkFavorites") },
                {
                  to: "/recommendations",
                  icon: Sparkles,
                  text: t("linkRecommendations"),
                },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: theme.spacing(1),
                      color: getDynamicColor("textSecondary", "link"),
                    }}
                    className="transition-colors"
                    onMouseOver={(e) =>
                      (e.currentTarget.style.color = getDynamicColor(
                        "highlight",
                        "link"
                      ))
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.color = getDynamicColor(
                        "textSecondary",
                        "link"
                      ))
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    <Box component="span">{item.text}</Box>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <Typography
              variant="subtitle1"
              sx={{
                color: getDynamicColor("textPrimary", "text"),
                mb: 2,
                fontWeight: "bold",
              }}
            >
              {t("featuresTitle")}
            </Typography>
            <ul className="space-y-2">
              <Typography
                component="li"
                sx={{ color: getDynamicColor("textSecondary", "text") }}
                variant="body2"
              >
                {t("featureDiscovery")}
              </Typography>
              <Typography
                component="li"
                sx={{ color: getDynamicColor("textSecondary", "text") }}
                variant="body2"
              >
                {t("featureCollection")}
              </Typography>
              <Typography
                component="li"
                sx={{ color: getDynamicColor("textSecondary", "text") }}
                variant="body2"
              >
                {t("featureAI")}
              </Typography>
              <Typography
                component="li"
                sx={{ color: getDynamicColor("textSecondary", "text") }}
                variant="body2"
              >
                {t("featureLists")}
              </Typography>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <Box
          sx={{
            borderTop: `1px solid ${getDynamicColor("divider", "divider")}`,
            mt: 8,
            pt: 4,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: getDynamicColor("textSecondary", "text") }}
          >
            {t("copyright", { year: currentYear })}
          </Typography>

          <div className="flex gap-6 text-sm">
            {[
              { to: "/privacy-policy", text: t("privacyPolicy") },
              { to: "/terms-of-service", text: t("termsOfService") },
              { to: "/contact", text: t("contact") },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="transition-colors"
                style={{ color: getDynamicColor("textSecondary", "link") }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.color = getDynamicColor(
                    "highlight",
                    "link"
                  ))
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.color = getDynamicColor(
                    "textSecondary",
                    "link"
                  ))
                }
              >
                {item.text}
              </Link>
            ))}
          </div>
        </Box>
      </div>
    </Box>
  );
}
