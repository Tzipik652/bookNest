import React from "react";
import BookCardSkeleton from "./BookCardSkeleton";
import { Box } from "@mui/material";

export default function BookSkeletonList({ count = 8 }: { count?: number }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        gap: 2,
        p: 2,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </Box>
  );
}
