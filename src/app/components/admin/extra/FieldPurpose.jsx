"use client";
import React, { useState } from 'react'
import InfoIcon from '@mui/icons-material/Info';
import { ClickAwayListener, Tooltip } from '@mui/material'
import "@/app/styles/admin/FieldPurpose.scss"
const FieldPurpose = ({ Purpose = "" }) => {
    const [open, setOpen] = useState(false);

    const handleTooltipClose = () => {
        setOpen(false);
    };

    const handleTooltipOpen = () => {
        setOpen(true);
    };
    return (
        <>
            {
                Purpose?.trim() ? <> <ClickAwayListener onClickAway={handleTooltipClose}>
                    <div>
                        <Tooltip
                            PopperProps={{
                                disablePortal: true,
                            }}
                            onClose={handleTooltipClose}
                            open={open}
                            disableFocusListener
                            disableHoverListener
                            disableTouchListener
                            title={Purpose}
                        >
                            <span onClick={handleTooltipOpen}><InfoIcon className='MuiSvgIcon-root-info' /></span>
                        </Tooltip>
                    </div>
                </ClickAwayListener></> : <></>
            }
        </>
    )
}

export default FieldPurpose