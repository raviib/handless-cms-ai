"use client";
import React, { useEffect, useState } from 'react';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

const ShowFullScreen = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
                .catch((err) => {
                    console.error(`Error attempting to enter fullscreen: ${err.message}`);
                });
        } else {
            document.exitFullscreen();
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'F11') {
            event.preventDefault(); // Prevent default F11 browser behavior
            toggleFullscreen();
        }
    };

    const handleFullscreenChange = () => {
        setIsOpen(!!document.fullscreenElement); // Update state based on fullscreen status
    };

    useEffect(() => {
        // Add keydown event listener for F11
        window.addEventListener('keydown', handleKeyDown);

        // Listen for fullscreen changes
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        // Cleanup event listeners on component unmount
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    return (
        <div onClick={toggleFullscreen} style={{ cursor: 'pointer' }}>
            {isOpen ? <FullscreenExitIcon /> : <FullscreenIcon />}
        </div>
    );
};

export default ShowFullScreen;
