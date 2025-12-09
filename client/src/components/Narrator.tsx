import { Pause, PlayArrow, Stop } from "@mui/icons-material";
import { IconButton, Typography, Box } from "@mui/material";
import { useSpeechNarrator } from "../hooks/useNarrator";
import { useTranslation } from "react-i18next";

export default function Narrator({ text }: { text: string }) {
  const { currentIndex, speak, pause, stop, isPaused, isSpeaking } =
    useSpeechNarrator(text);
  const { t } = useTranslation("boolDetails");
  const isHebrew = /[\u0590-\u05FF]/.test(text);

  const highlighted =
    currentIndex !== null ? (
      <>
        <span>{text.slice(0, currentIndex)}</span>
        <span style={{ background: "#DCFCE7" }}>
          {text.slice(currentIndex).split(" ")[0]}
        </span>
        <span>
          {text.slice(
            currentIndex + text.slice(currentIndex).split(" ")[0].length
          )}
        </span>
      </>
    ) : (
      text
    );

  return (
    <Box maxWidth="600px">
      {/* --- Row of icons (top) --- */}
      <Box
        display="flex"
        justifyContent={isHebrew ? "flex-end" : "flex-start"}
        gap={0.7}
        mb={0.5}
      >
        {!isSpeaking || isPaused ? (
          <IconButton
            size="small"
            onClick={speak}
            sx={{ p: 0.3 }}
            aria-label={t('startNarration')}
          >
            <PlayArrow sx={{ fontSize: 18 }} />
          </IconButton>
        ) : (
          <IconButton
            size="small"
            onClick={pause}
            sx={{ p: 0.3 }}
            aria-label={t('pauseNarration')}
          >
            <Pause sx={{ fontSize: 18 }} />
          </IconButton>
        )}
        <IconButton
          size="small"
          onClick={stop}
          sx={{ p: 0.3 }}
          aria-label={t('stopNarration')}
        >
          <Stop sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* --- Text below --- */}
      <Typography
        className="book-summary"
        data-skip-sr
        variant="body2"
        sx={{ whiteSpace: "normal" }}
      >
        {highlighted}
      </Typography>
    </Box>
  );
}
