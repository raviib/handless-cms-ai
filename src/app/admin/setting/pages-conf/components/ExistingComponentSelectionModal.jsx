"use client"
import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    IconButton,
    Typography,
    Button,
    Stack,
    Paper,
    Chip,
    CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useGetApi } from '@/app/lib/apicallHooks';
import { useEffect, useState } from 'react';

/**
 * ExistingComponentSelectionModal Component
 * Allows users to select and add existing components
 */
export const ExistingComponentSelectionModal = ({ open, onClose, onSelectComponent }) => {
    const { data: componentsData, isLoading, doFetch } = useGetApi(null);
    const [availableComponents, setAvailableComponents] = useState([]);
    const [selectedComponent, setSelectedComponent] = useState(null);

    useEffect(() => {
        if (open) {
            doFetch('/setting/page-component?limit=1000');
        }
    }, [open]);

    useEffect(() => {
        if (componentsData?.data) {
            setAvailableComponents(componentsData.data);
        }
    }, [componentsData]);

    const handleComponentClick = (component) => {
        setSelectedComponent(component);
    };

    const handleConfirm = () => {
        if (selectedComponent) {
            onSelectComponent(selectedComponent);
            setSelectedComponent(null);
        }
    };

    const handleClose = () => {
        setSelectedComponent(null);
        onClose();
    };

    // Group components by category
    const componentsByCategory = availableComponents.reduce((acc, component) => {
        const category = component.category || 'general';
