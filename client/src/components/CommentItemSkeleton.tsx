import React from "react";
import { Card, CardContent, Skeleton, Stack, Divider, Box } from "@mui/material";

export default function CommentItemSkeleton() {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        transition: "all 0.2s",
        "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
        mb: 2,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Stack direction="row" spacing={2} alignItems="center">
              <Skeleton variant="circular" width={40} height={40} />
              <Stack spacing={0.5}>
                <Skeleton variant="text" width={120} height={20} />
                <Skeleton variant="text" width={80} height={14} />
              </Stack>
            </Stack>
            <Skeleton variant="circular" width={24} height={24} />
          </Stack>

          {/* Text */}
          <Stack spacing={1} sx={{ pl: 7 }}>
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="95%" height={16} />
            <Skeleton variant="text" width="90%" height={16} />
          </Stack>

          <Divider sx={{ my: 1 }} />

          {/* Reactions */}
          <Stack direction="row" spacing={1}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                width={60}
                height={32}
                sx={{ borderRadius: 10 }}
              />
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
