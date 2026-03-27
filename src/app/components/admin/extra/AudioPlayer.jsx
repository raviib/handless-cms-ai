'use client';
import React, { useState, useRef } from 'react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { IconButton, Slider, Box, Typography } from '@mui/material';

const AudioPlayer = ({ audioUrl, className = '' }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef(null);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (event, newValue) => {
        if (audioRef.current) {
            audioRef.current.currentTime = newValue;
            setCurrentTime(newValue);
        }
    };

    const handleVolumeChange = (event, newValue) => {
        const volumeValue = newValue / 100;
        setVolume(volumeValue);
        if (audioRef.current) {
            audioRef.current.volume = volumeValue;
        }
        setIsMuted(volumeValue === 0);
    };

    const toggleMute = () => {
        if (audioRef.current) {
            if (isMuted) {
                audioRef.current.volume = volume;
                setIsMuted(false);
            } else {
                audioRef.current.volume = 0;
                setIsMuted(true);
            }
        }
    };

    const formatTime = (time) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <Box className={`audio-player ${className}`} sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            p: 2, 
            border: '1px solid #ddd', 
            borderRadius: 1,
            backgroundColor: '#f9f9f9',
            minWidth: 300
        }}>
            <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
            />
            
            <IconButton onClick={togglePlay} size="small">
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            
            <Box sx={{ flex: 1, mx: 1 }}>
                <Slider
                    size="small"
                    value={currentTime}
                    max={duration || 100}
                    onChange={handleSeek}
                    sx={{ mb: 0.5 }}
                />
                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                </Typography>
            </Box>
            
            <IconButton onClick={toggleMute} size="small">
                {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </IconButton>
            
            <Slider
                size="small"
                value={isMuted ? 0 : volume * 100}
                onChange={handleVolumeChange}
                sx={{ width: 60 }}
            />
        </Box>
    );
};

export default AudioPlayer;