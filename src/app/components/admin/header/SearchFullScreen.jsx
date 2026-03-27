'use client';
import React, { useEffect, useState, useRef } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import Link from 'next/link';

const SearchFullScreen = ({ menudata }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // State for debounced search term
    const [recentSearches, setRecentSearches] = useState([]);
    const inputRef = useRef(null);

    const toggleFullscreen = () => {
        setIsOpen(!isOpen);
    };

    const handleKeyDown = (event) => {
        if (event.ctrlKey && event.key === 'k') {
            event.preventDefault();
            toggleFullscreen();
        }
        if (event.key === 'F11') {
            event.preventDefault();
            toggleFullscreen();
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);

        const savedRecentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
        setRecentSearches(savedRecentSearches);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Debounce search term changes
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm); // Update the debounced term after delay
        }, 500); // 500ms delay for debounce

        return () => {
            clearTimeout(handler); // Cleanup the timeout if the user types before delay
        };
    }, [searchTerm]);

    // Perform the search when the debounced term changes
    useEffect(() => {
        if (debouncedSearchTerm.trim()) {
            const filteredResults = searchByName(menudata, debouncedSearchTerm);
            setResults(filteredResults);
            // Save the debounced search term
        } else {
            setResults([]);
        }
    }, [debouncedSearchTerm]);

    function searchByName(menu, searchTerm, path = []) {
        let result = [];
        for (const item of menu) {
            const currentPath = [...path, item.name];
            if (item.submenu) {
                result = result.concat(searchByName(item.submenu, searchTerm, currentPath));
                continue;
            }
            if (item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                
                result.push({ hierarchy: currentPath, ...item });
            }
        }
        return result;
    }

    const handleSearch = (event) => {
        const query = event.target.value;
        setSearchTerm(query);
    };

    const saveRecentSearch = (query) => {
        let searches = JSON.parse(localStorage.getItem('recentSearches')) || [];
        if (!searches.includes(query)) {
            searches = [query, ...searches];
            if (searches.length > 5) searches.pop();
            localStorage.setItem('recentSearches', JSON.stringify(searches));
            setRecentSearches(searches);
        }
    };
    const handleRecentSearchClick = (search) => {
        setSearchTerm(search);
        const filteredResults = searchByName(menudata, search);
        
        setResults(filteredResults);
    };

    useEffect(() => {
        return () => {
            setIsOpen(false)
        }
    }, [])

    return (
        <>
            <SearchIcon
                className={`icon-searchicon ${isOpen ? 'active' : ''}`}
                onClick={toggleFullscreen}
            />
            <div className={`search-popup ${isOpen ? 'show' : ''}`}>
                {isOpen && (
                    <div className="inner-content">
                        <div className="form-wrapper">
                            <div className="form-item flex">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    className="search"
                                    placeholder="Search here..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                                {!searchTerm && <span className='keyword-open'>CTRL+K</span>}
                                <button type="submit">
                                    <SearchIcon className="icon icon-searchicon" />
                                </button>
                            </div>
                        </div>
                        <div className="suggestions mt-2">
                            {recentSearches.length > 0 && (
                                <div className="recent-searches">
                                    <h4>Recent Searches</h4>
                                    <hr />
                                    <div className="recent-search-items">
                                        {recentSearches.filter(ele => ele.toLowerCase() !== searchTerm.toLowerCase()).map((search, index) => (
                                            <span
                                                key={index}

                                                onClick={() => handleRecentSearchClick(search)}
                                            >
                                                {search}
                                            </span>
                                        ))}
                                    </div>

                                </div>
                            )}
                            {results.length > 0 ? (
                                <div className="results-searches">
                                    <h4>Results</h4>
                                    <hr />
                                    {
                                        results.map((result, index) => (
                                            <div key={index} onClick={() => {

                                                setIsOpen(false)
                                                saveRecentSearch(result.name)
                                            }} >

                                                <Link href={`/admin${result.url}`} className="search-links">
                                                    <span>{result.hierarchy.join(" > ")}</span>
                                                    {/* <span>{result.name}</span> */}
                                                </Link>

                                            </div>
                                        ))
                                    }

                                </div>
                            ) : (
                                <></>
                            )}

                            {((results.length === 0) && (recentSearches.length === 0)) && <p>No results found</p>}
                        </div>
                    </div>
                )}
            </div >
        </>
    );
};

export default SearchFullScreen;
