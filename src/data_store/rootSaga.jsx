import { all } from "redux-saga/effects";
import problemListWatcher from "../saga/problemLists_saga";
import problemWatcher from "../saga/problem_saga";
import runCodeWatcher from "../saga/runCode_saga"
import codePrettierWatcher from "../saga/code_prettier_saga"
import runAllTestCasesWatcher from "../saga/run_all_testcase_saga"

export default function* rootSaga() {
    yield all([
        problemListWatcher(),
        problemWatcher(),
        runCodeWatcher(),
        codePrettierWatcher(),
        runAllTestCasesWatcher(),
    ]);
}
