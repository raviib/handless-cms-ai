"use client";
import React, { useState, useRef, useMemo } from 'react';
import dynamic from "next/dynamic";
import Box_loading from "@/app/components/Skeleton/Skeleton.loading.js"

const JoditEditor = dynamic(() => import("jodit-react"), {
    ssr: false,
    loading: () => <Box_loading height={200} />,
});

const TextEditor = ({ placeholder, setContent, content = "", is_coustom = false, fieldName }) => {
    const editor = useRef(null);

    const joditConfig = useMemo(() => ({
        style: {
            backgroundColor: '#f2f2f2',
            minHeight: "400px"
        }
    }), []);

    const Editor = useMemo(() => (
        <JoditEditor
            ref={editor}
            value={content}
            config={joditConfig}
            onBlur={(newContent) => {
                if (is_coustom === "obj") {
                    setContent(newContent, fieldName, "object", 'text-editor');
                } else if (is_coustom === "non-obj") {
                    setContent(newContent, fieldName, 'text-editor');
                } else if (is_coustom === "rich-text-markdown") {
                    setContent(newContent, fieldName, 'rich-text-markdown');
                } else {
                    setContent(newContent);
                }
            }}
            onChange={() => { }}
        />
    ), [content, setContent, is_coustom, fieldName, joditConfig]);

    return (
        <div className='jodit-react-size'>
            {Editor}
        </div>
    );
};

export default TextEditor;
