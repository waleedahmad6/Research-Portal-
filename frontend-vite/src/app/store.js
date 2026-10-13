
import { configureStore } from "@reduxjs/toolkit";
import opportunityReducer from "../features/opportunities/opportunitySlice";

export const store = configureStore({
    reducer: {
        opportunities: opportunityReducer
    }
});
