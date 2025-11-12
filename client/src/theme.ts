import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#16A34A",      // ירוק
      dark: "#12803A",      // גוון כהה לריחוף
      contrastText: "#ffffff", // טקסט לבן
    },
  },
});

export default theme;
