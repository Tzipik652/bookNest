import React from "react";
import { Card, CardContent, CardActions, Skeleton, Box, Stack } from "@mui/material";

export default function BookCardSkeleton() {
  return (
    <Card
      sx={{
        overflow: "hidden",
        cursor: "pointer",
        transition: "0.3s",
        "&:hover": { boxShadow: 4 },
        width: 240,
        minHeight: 350,
        margin: 1,
      }}
    >
      <Box sx={{ width: "100%", height: 200, overflow: "hidden" }}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
        />
      </Box>

      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Skeleton variant="text" width="80%" height={24} />
          <Skeleton variant="text" width="50%" height={18} />
          <Skeleton
            variant="rectangular"
            width={90}
            height={24}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton variant="text" width="100%" height={16} />
          <Skeleton variant="text" width="90%" height={16} />
          <Skeleton variant="text" width="75%" height={16} />
        </Stack>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={36}
          sx={{ borderRadius: 1 }}
        />
      </CardActions>
    </Card>
  );
}
