import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { Typography } from "@mui/material";
const TableSkeleton = () => {
    return (

        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Box sx={{ width: "100%", height: "60vh" }}>
                <Typography variant="h2">
                    <Skeleton />
                </Typography>
                <Typography variant="h4">
                    <Skeleton animation="wave" />
                </Typography>
                <Typography variant="h4">
                    <Skeleton animation="wave" />
                </Typography>
                <Typography variant="h4">
                    <Skeleton animation="wave" />
                </Typography>
                <Typography variant="h4">
                    <Skeleton animation={false} />
                </Typography>
                <Typography variant="h2">
                    <Skeleton animation={false} />
                </Typography>
            </Box>
        </div>

    );
};

export default TableSkeleton;