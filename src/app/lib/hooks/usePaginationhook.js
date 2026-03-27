"use client"

import { useState, useEffect } from 'react';

export const usePagination = (initialPage = 1, itemsPerPage = 5) => {
  const [curNumber, setCurNumber] = useState(initialPage);
  const [lastNumberItems, setLastNumberItems] = useState(0);
  const [curNumberItems, setCurNumberItems] = useState(itemsPerPage);

  const handleItemClick = (page) => {
    setCurNumber(page);
  };

  const navigateItemsReverse = () => {
    if (curNumberItems > itemsPerPage) {
      setLastNumberItems(lastNumberItems - itemsPerPage);
      setCurNumberItems(curNumberItems - itemsPerPage);
    }
  };

  const navigateItemsForward = () => {
    // Assuming totalBlogCount is available in the component
    if (curNumberItems < 20) {
      setLastNumberItems(lastNumberItems + itemsPerPage);
      setCurNumberItems(curNumberItems + itemsPerPage);
    }
  };

  return {
    curNumber,
    lastNumberItems,
    curNumberItems,
    handleItemClick,
    navigateItemsReverse,
    navigateItemsForward,
  };
};
