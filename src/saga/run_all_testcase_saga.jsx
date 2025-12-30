import { put, take, takeLatest } from "redux-saga/effects";

import {
    fetchRunCodeStart,
    fetchRunCodeSuccess,
    fetchRunCodeFailure,
} from "../data_store/run_code_store";

import {
    runAllTestCaseUpdate,
    runAllTestCasesStart,
    runAllTestCasesEnd
} from "../data_store/run_all_testcase_store";

function* runAllTestCasesSaga(action) {
    const { testCases, language, code, mode } = action.payload;

    try {
        for (let i = 0; i < testCases.length; i++) {

            // trigger EXISTING run code saga
            yield put(
                fetchRunCodeStart({
                    language,
                    code,
                    stdin: testCases[i].input,
                    mode,
                })
            );

            // wait for result of EXISTING saga
            const resultAction = yield take([
                fetchRunCodeSuccess.type,
                fetchRunCodeFailure.type,
            ]);

            if (resultAction.type === fetchRunCodeFailure.type) {
                yield put(
                    runAllTestCaseUpdate({
                        index: i,
                        output: resultAction.payload,
                    })
                );
                return;
            }

            const output =
                resultAction.payload.run?.stdout ||
                resultAction.payload.run?.stderr ||
                resultAction.payload.compile?.stderr ||
                "No Output";

            yield put(
                runAllTestCaseUpdate({
                    index: i,
                    output,
                })
            );
        }
    } catch (error) {
        console.log("Run all test cases failed:", error);
    } finally {
        yield put(runAllTestCasesEnd());
    }
}

export default function* runAllTestCasesWatcher() {
    yield takeLatest(runAllTestCasesStart.type, runAllTestCasesSaga);
}
