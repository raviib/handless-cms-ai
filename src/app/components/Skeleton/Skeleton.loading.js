import React from 'react'
import Skeleton from '@mui/material/Skeleton';
const Box_loading = ({height=70}) => {
    return (
        <Skeleton variant="rounded" width={"100%"} height={height} />
    )
}

export default Box_loading