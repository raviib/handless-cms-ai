"use client";

import { Table_Create_Buttton } from "@/app/components/admin/extra/buttton.js";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { Box, Stack, Typography } from "@mui/material";
import Link from "next/link";
const CreateFirstDoc = ({ pageName = '', linkUrl = '', showButton = false }) => {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#fff",
      }}
    >
      <Stack spacing={1.5} alignItems="center" textAlign="center">
        {/* Icon */}
        <DescriptionOutlinedIcon
          sx={{
            fontSize: 56,
            color: "#94a3b8",
            mb: 1,
          }}
        />

        {/* Heading */}
        <Typography
          variant="h6"
          sx={{ fontWeight: 500, color: "#0f172a88" }}
        >
          No {pageName} found
        </Typography>




        {showButton && <>
          {/* Sub text */}
          <Typography
            variant="body2"
            sx={{ color: "#64748b", mb: 2 }}
          >
            Get started by creating your first {pageName} post.
          </Typography>
          {/* Button as Link */}
          <Link
            href={linkUrl}
            aria-label="Add New"
          >
            <Table_Create_Buttton
              name={`Add ${pageName}`}
            />
          </Link>
        </>}
      </Stack>
    </Box>
  );
};

export default CreateFirstDoc;
