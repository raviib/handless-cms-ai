import React from 'react'
import "@/app/styles/admin/tooltip.css"
const ToolTip = ({ children, message, flow = "up" }) => {
    // ENUM = ["up" , "left","right", "down"]
    return (
        <main>
            <div className='move-last'>
                <span tooltip={`${message}`} flow={flow}>{children}</span>
            </div>
        </main>


    )
}

export default ToolTip