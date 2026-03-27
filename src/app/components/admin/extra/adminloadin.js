import { Box, Skeleton, Typography } from '@mui/material'
import React from 'react'

const Table_page_Loading = () => {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                // marginTop:"90px"
            }}
        >
            <div style={{ width: "100%", height: "100%" }}>
                <Skeleton height={"70px"} />
            </div>
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "row", gap: "10px", alignItems: "center",  }}>
                    <Skeleton height={"70px"} width={"221px"} />
                    <Skeleton height={"70px"} width={"160px"} />
                    <Skeleton height={"70px"} width={"160px"} />
                </div>
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "row", gap: "10px", alignItems: "center", justifyContent: "end" }}>
                  
                    <Skeleton variant="circular" width={38} height={38} />
                    <Skeleton variant="circular" width={38} height={38} />
                    <Skeleton variant="circular" width={38} height={38} /></div>
            </div>

            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "row", gap: "10px", alignItems: "center", justifyContent: "space-between" }}>
                <Skeleton height={"50px"} width={"170px"} />
                <Skeleton height={"70px"} width={"221px"} />
            </div>
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
    )
}
const Create_page_Loading = () => {
    return (
        <div className='container'>

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    // marginTop:"90px"
                }}
            >

                <div style={{ width: "100%", height: "100%" }}>
                    <Skeleton height={"70px"} />
                </div>
                <div style={{ width: "100%", height: "100%" }}>
                    <Skeleton height={"60px"} />
                </div>
                <div style={{ width: "100%", height: "100%", display: "flex", gap: "10px" }}>
                    <div style={{ width: "50%" }}>
                        <Skeleton height={"30px"} width={"200px"} />
                        <Skeleton height={"50px"} />
                    </div>
                    <div style={{ width: "50%" }}>
                        <Skeleton height={"30px"} width={"200px"} />
                        <Skeleton height={"50px"} />

                    </div>
                </div>
                <div style={{ width: "100%", height: "100%", display: "flex", gap: "10px" }}>
                    <div style={{ width: "50%" }}>
                        <Skeleton height={"30px"} width={"200px"} />
                        <Skeleton height={"50px"} />
                    </div>
                    <div style={{ width: "50%" }}>
                        <Skeleton height={"30px"} width={"200px"} />
                        <Skeleton height={"50px"} />

                    </div>
                </div>
                <div style={{ width: "100%", height: "100%", display: "flex", gap: "10px" }}>
                    <div style={{ width: "50%" }}>
                        <Skeleton height={"30px"} width={"200px"} />
                        <Skeleton height={"50px"} />
                    </div>
                    <div style={{ width: "50%" }}>
                        <Skeleton height={"30px"} width={"200px"} />
                        <Skeleton height={"50px"} />

                    </div>
                </div>

                <div style={{ width: "100%", height: "100%" }}>
                    <Skeleton height={"60px"} />
                </div>
                <div style={{ width: "100%", height: "100%", display: "flex", gap: "10px" }}>
                    <div style={{ width: "50%" }}>
                        <Skeleton height={"30px"} width={"200px"} />
                        <Skeleton height={"50px"} />
                    </div>
                    <div style={{ width: "50%" }}>
                        <Skeleton height={"30px"} width={"200px"} />
                        <Skeleton height={"50px"} />

                    </div>
                </div>
            </div>
        </div>
    )
}
export { Table_page_Loading, Create_page_Loading }
