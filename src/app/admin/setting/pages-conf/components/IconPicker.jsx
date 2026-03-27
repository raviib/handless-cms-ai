"use client"
import {
    Box,
    Grid,
    IconButton,
    TextField,
    Typography,
    InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useState, useMemo } from 'react';

// Available icons with their emoji representations
const AVAILABLE_ICONS = [
    { id: 'puzzle', emoji: '🧩', label: 'Puzzle' },
    { id: 'pin', emoji: '📍', label: 'Pin' },
    { id: 'calendar', emoji: '📅', label: 'Calendar' },
    { id: 'user', emoji: '👤', label: 'User' },
    { id: 'mail', emoji: '✉️', label: 'Mail' },
    { id: 'phone', emoji: '📞', label: 'Phone' },
    { id: 'home', emoji: '🏠', label: 'Home' },
    { id: 'building', emoji: '🏢', label: 'Building' },
    { id: 'cart', emoji: '🛒', label: 'Cart' },
    { id: 'tag', emoji: '🏷️', label: 'Tag' },
    { id: 'star', emoji: '⭐', label: 'Star' },
    { id: 'heart', emoji: '❤️', label: 'Heart' },
    { id: 'book', emoji: '📚', label: 'Book' },
    { id: 'folder', emoji: '📁', label: 'Folder' },
    { id: 'file', emoji: '📄', label: 'File' },
    { id: 'image', emoji: '🖼️', label: 'Image' },
    { id: 'video', emoji: '🎥', label: 'Video' },
    { id: 'music', emoji: '🎵', label: 'Music' },
    { id: 'settings', emoji: '⚙️', label: 'Settings' },
    { id: 'lock', emoji: '🔒', label: 'Lock' },
    { id: 'key', emoji: '🔑', label: 'Key' },
    { id: 'bell', emoji: '🔔', label: 'Bell' },
    { id: 'clock', emoji: '🕐', label: 'Clock' },
    { id: 'globe', emoji: '🌐', label: 'Globe' },
    { id: 'location', emoji: '📌', label: 'Location' },
    { id: 'map', emoji: '🗺️', label: 'Map' },
    { id: 'flag', emoji: '🚩', label: 'Flag' },
    { id: 'trophy', emoji: '🏆', label: 'Trophy' },
    { id: 'gift', emoji: '🎁', label: 'Gift' },
    { id: 'camera', emoji: '📷', label: 'Camera' },
    { id: 'microphone', emoji: '🎤', label: 'Microphone' },
    { id: 'speaker', emoji: '🔊', label: 'Speaker' },
    { id: 'chart', emoji: '📊', label: 'Chart' },
    { id: 'graph', emoji: '📈', label: 'Graph' },
    { id: 'clipboard', emoji: '📋', label: 'Clipboard' },
    { id: 'pencil', emoji: '✏️', label: 'Pencil' },
    { id: 'brush', emoji: '🖌️', label: 'Brush' },
    { id: 'palette', emoji: '🎨', label: 'Palette' },
    { id: 'link', emoji: '🔗', label: 'Link' },
    { id: 'shield', emoji: '🛡️', label: 'Shield' },
    { id: 'crown', emoji: '👑', label: 'Crown' },
    { id: 'diamond', emoji: '💎', label: 'Diamond' },
    { id: 'fire', emoji: '🔥', label: 'Fire' },
    { id: 'lightning', emoji: '⚡', label: 'Lightning' },
    { id: 'cloud', emoji: '☁️', label: 'Cloud' },
    { id: 'sun', emoji: '☀️', label: 'Sun' },
    { id: 'moon', emoji: '🌙', label: 'Moon' },
    { id: 'rocket', emoji: '🚀', label: 'Rocket' },
    { id: 'plane', emoji: '✈️', label: 'Plane' },
    { id: 'car', emoji: '🚗', label: 'Car' },
    { id: 'train', emoji: '🚆', label: 'Train' },
    { id: 'ship', emoji: '🚢', label: 'Ship' },
    { id: 'anchor', emoji: '⚓', label: 'Anchor' },
    { id: 'umbrella', emoji: '☂️', label: 'Umbrella' },
    { id: 'coffee', emoji: '☕', label: 'Coffee' },
    { id: 'pizza', emoji: '🍕', label: 'Pizza' },
    { id: 'cake', emoji: '🎂', label: 'Cake' },
    { id: 'apple', emoji: '🍎', label: 'Apple' },
    { id: 'tree', emoji: '🌳', label: 'Tree' },
    { id: 'flower', emoji: '🌸', label: 'Flower' },
    { id: 'leaf', emoji: '🍃', label: 'Leaf' },
];

/**
 * IconPicker Component
 * Grid layout with searchable icons for component field configuration
 */
export const IconPicker = ({ selectedIcon, onIconSelect, error }) => {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter icons based on search query
    const filteredIcons = useMemo(() => {
        if (!searchQuery.trim()) {
            return AVAILABLE_ICONS;
        }
        const query = searchQuery.toLowerCase();
        return AVAILABLE_ICONS.filter(icon =>
            icon.label.toLowerCase().includes(query) ||
            icon.id.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleIconClick = (iconId) => {
        onIconSelect(iconId);
    };

    // Get selected icon details
    const selectedIconData = AVAILABLE_ICONS.find(icon => icon.id === selectedIcon);

    return (
        <Box>
            {/* Search Input */}
            <TextField
                fullWidth
                size="small"
                placeholder="Search icons..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                        </InputAdornment>
                    ),
                }}
                sx={{ mb: 2 }}
            />

            {/* Selected Icon Preview */}
            {selectedIconData && (
                <Box
                    sx={{
                        mb: 2,
                        p: 2,
                        bgcolor: 'primary.lighter',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'primary.light',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <Typography variant="h4" component="span">
                        {selectedIconData.emoji}
                    </Typography>
                    <Box>
                        <Typography variant="body2" fontWeight={600}>
                            Selected Icon
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {selectedIconData.label}
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* Icon Grid */}
            <Box
                sx={{
                    maxHeight: 300,
                    overflowY: 'auto',
                    border: '1px solid',
                    borderColor: error ? 'error.main' : 'divider',
                    borderRadius: 1,
                    p: 1
                }}
            >
                <Grid container spacing={1}>
                    {filteredIcons.map((icon) => (
                        <Grid item xs={3} sm={2} md={1.5} key={icon.id}>
                            <IconButton
                                onClick={() => handleIconClick(icon.id)}
                                sx={{
                                    width: '100%',
                                    aspectRatio: '1',
                                    border: '2px solid',
                                    borderColor: selectedIcon === icon.id ? 'primary.main' : 'divider',
                                    borderRadius: 1,
                                    bgcolor: selectedIcon === icon.id ? 'primary.lighter' : 'transparent',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        bgcolor: 'primary.lighter',
                                        transform: 'scale(1.05)'
                                    }
                                }}
                                title={icon.label}
                            >
                                <Typography variant="h6" component="span">
                                    {icon.emoji}
                                </Typography>
                            </IconButton>
                        </Grid>
                    ))}
                </Grid>

                {/* No results message */}
                {filteredIcons.length === 0 && (
                    <Box
                        sx={{
                            py: 4,
                            textAlign: 'center'
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            No icons found matching "{searchQuery}"
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Error message */}
            {error && (
                <Typography
                    variant="caption"
                    color="error"
                    sx={{ display: 'block', mt: 0.5, ml: 1.75 }}
                >
                    {error}
                </Typography>
            )}
        </Box>
    );
};
