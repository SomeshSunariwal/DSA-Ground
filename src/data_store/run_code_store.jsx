import { createSlice } from "@reduxjs/toolkit";

const fetchRunCodeSlice = createSlice({
    name: "run_all_testcase",

    initialState: {
        loading: false,
        error: null,
        data: [],
    },

    reducers: {

        // Start fetching
        fetchRunCodeStart: (state) => {
            state.loading = true;
            state.error = null;
        },

        // Success
        fetchRunCodeSuccess: (state, action) => {
            state.loading = false;
            state.data = action.payload;
        },

        // Failure
        fetchRunCodeFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
    fetchRunCodeStart,
    fetchRunCodeSuccess,
    fetchRunCodeFailure
} = fetchRunCodeSlice.actions;

export default fetchRunCodeSlice.reducer;
