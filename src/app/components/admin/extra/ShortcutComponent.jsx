import React, { useState, useEffect } from 'react';

const ShortcutComponent = () => {
  const [isComponentOpen, setIsComponentOpen] = useState(false);

  // Function to handle the keydown event
  const handleKeyDown = (event) => {
    if (event.ctrlKey && event.key === 'k') {
      event.preventDefault();
      setIsComponentOpen(true); // Open the component
    }
  };

  useEffect(() => {
    // Attach the event listener when the component mounts
    document.addEventListener('keydown', handleKeyDown);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div>
      {isComponentOpen && (
        <div className="modal">
          <h2>Component Opened with Ctrl + K</h2>
          {/* Your component content */}
        </div>
      )}
    </div>
  );
};

export default ShortcutComponent;
