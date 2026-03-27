import React from 'react'
import { Button } from '@mui/material';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
export const Table_Create_Buttton = ({name='Add New'}) => {
    return (
        <div>

            <Button component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<AddCircleOutlineOutlinedIcon />}
                style={{
                    backgroundColor:'rgba(0,0,0,0.7)'
                }}
            >{name}</Button>
        </div>
    )
}

