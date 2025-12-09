import { Box, Typography, Tooltip, Zoom } from "@mui/material";
import { AutoAwesome } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export const AIReasonBubble = ({ reason }: { reason: string }) => {
    if (!reason) return null;
    const { t } = useTranslation('AIRecommendations');

    return (
        <Tooltip
            title={<Typography fontSize={13}>{reason}</Typography>}
            arrow
            TransitionComponent={Zoom}
            placement="top"
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    mb: 1,
                    cursor: 'help',
                    opacity: 0.8,
                    '&:hover': { opacity: 1 }
                }}
            >
                <AutoAwesome sx={{ fontSize: 16, color: "primary.main" }} />
                <Typography
                    variant="caption"
                    sx={{
                        fontWeight: 'bold',
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        fontSize: '0.7rem',
                        letterSpacing: 1
                    }}
                >
                   {t('whyFitsYou')}
                </Typography>
            </Box>
        </Tooltip>
    );
};