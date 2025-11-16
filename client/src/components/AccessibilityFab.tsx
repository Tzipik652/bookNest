import { Fab } from "@mui/material";
import AccessibilityIcon from "@mui/icons-material/Accessibility";
import { useAccessibilityStore } from "../store/accessibilityStore";

export default function AccessibilityFab() {
  const { toggleMenu } = useAccessibilityStore();

  return (
    <Fab
      onClick={toggleMenu}
      color="primary"
      sx={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 2000,
        width: 64,
        height: 64,
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      }}
    >
      <AccessibilityIcon sx={{ fontSize: 32 }} />
    </Fab>
  );
}
