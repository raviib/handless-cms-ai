import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Store for persisting table filters and pagination per page
const useTableFiltersStore = create(
    persist(
        (set, get) => ({
            // Store filters by page key (e.g., "cms-banner")
            pageStates: {},

            // Get state for a specific page
            getPageState: (pageKey) => {
                return get().pageStates[pageKey] || null;
            },

            // Set state for a specific page
            setPageState: (pageKey, state) => {
                set((prev) => ({
                    pageStates: {
                        ...prev.pageStates,
                        [pageKey]: {
                            ...prev.pageStates[pageKey],
                            ...state,
                            lastUpdated: Date.now()
                        }
                    }
                }));
            },

            // Clear state for a specific page
            clearPageState: (pageKey) => {
                set((prev) => {
                    const newPageStates = { ...prev.pageStates };
                    delete newPageStates[pageKey];
                    return { pageStates: newPageStates };
                });
            },

            // Clear all states
            clearAllStates: () => {
                set({ pageStates: {} });
            }
        }),
        {
            name: 'table-filters-storage',
            storage: createJSONStorage(() => localStorage),
            // Only persist specific fields
            partialize: (state) => ({
                pageStates: state.pageStates
            })
        }
    )
);

export default useTableFiltersStore;
