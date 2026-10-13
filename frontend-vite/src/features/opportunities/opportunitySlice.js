import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    opportunities: [],
    loading: false,
    error: null
};

const opportunitySlice = createSlice({
    name: "opportunities",
    initialState,
    reducers: {
        setOpportunities: (state, action) => {
            state.opportunities = action.payload;
        },

        addOpportunity: (state, action) => {
            state.opportunities.push(action.payload);
        },

        updateOpportunity: (state, action) => {
            const index = state.opportunities.findIndex(
                (item) => item.id === action.payload.id
            );

            if (index !== -1) {
                state.opportunities[index] = action.payload;
            }
        },

        removeOpportunity: (state, action) => {
            state.opportunities = state.opportunities.filter(
                (item) => item.id !== action.payload
            );
        },

        setLoading: (state, action) => {
            state.loading = action.payload;
        },

        setError: (state, action) => {
            state.error = action.payload;
        }
    }
});

export const {
    setOpportunities,
    addOpportunity,
    updateOpportunity,
    removeOpportunity,
    setLoading,
    setError
} = opportunitySlice.actions;

export default opportunitySlice.reducer;
