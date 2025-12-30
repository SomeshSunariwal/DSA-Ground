import { createSlice } from "@reduxjs/toolkit";

const runAllTestCasesSlice = createSlice({
    name: "runAllTestCases",

    initialState: {
        running: false,
        error: null,
        outputs: [], // index-based outputs for test cases
    },

    reducers: {
        // start running all cases
        runAllTestCasesStart: (state) => {
            state.running = true;
            state.error = null;
            state.outputs = [];
        },

        // update output of one case
        runAllTestCaseUpdate: (state, action) => {
            const { index, output } = action.payload;
            state.outputs[index] = output;
        },

        // finish all cases
        runAllTestCasesEnd: (state) => {
            state.running = false;
        },

        // failure
        runAllTestCasesFailure: (state, action) => {
            state.running = false;
            state.error = action.payload;
        },
    },
});

export const {
    runAllTestCasesStart,
    runAllTestCaseUpdate,
    runAllTestCasesEnd,
    runAllTestCasesFailure,
} = runAllTestCasesSlice.actions;

export default runAllTestCasesSlice.reducer;
