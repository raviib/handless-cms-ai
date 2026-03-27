"use client"
import "@/app/styles/admin/DateRange.css"
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { DateRangePicker } from 'react-date-range'; // https://www.npmjs.com/package/react-date-range // 
import { useState } from "react";
import React from 'react'
import { Tooltip } from '@mui/material';
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
const DateRange = ({
    setDateHandler
}) => {
    const [selectionRange, setselectionRange] = useState({
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
    })


    const handleSelect = (ranges) => {

        setDateHandler(ranges.selection)
        setselectionRange(ranges.selection)
    }
    function handleClick(event) {
        // Prevent the default behavior of the link
        event.preventDefault();
        // Stop the event from propagating up the DOM
        event.stopPropagation();
        // // Your custom logic here, for example, you can retrieve the text content of the clicked item
        // var selectedItem = event.target.textContent;
    
        // // Add your additional logic or actions here
    }
    return (


        <div className="dropdown">
            <Tooltip content="Date Range">
                <CalendarMonthIcon
                    role="button"
                    // className="dropdown-toggle dropdown-toggle-split"
                    data-bs-toggle="dropdown"
                    aria-expanded="true"
                    data-bs-reference="parent"
                    style={{
                        backgroundColor: "#E8960F",
                        color: "#fff",
                        padding: "5px",
                        borderRadius: "5px",
                        marginTop: "3px",
                        fontSize: "2rem",
                        // height: "2.3rem"
                    }}
                />
            </Tooltip>
            {/* <ul className="dropdown-menu">
                <li
                 onClick={handleClick}
                  >
                    <DateRangePicker ranges={[selectionRange]} onChange={handleSelect} showMonthArrow={false}/>
                </li>


            </ul> */}
        </div>

    );
}

export default DateRange