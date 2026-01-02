import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import CONSTANTS from "../constants/constants";

import {
    fetchProblemListStart,
    fetchProblemListSuccess,
    fetchProblemListFailure
} from "../data_store/problemList_store";

function* fetchProblemListSaga() {
    try {
        const endpoint = CONSTANTS.BASE_URLS + CONSTANTS.API + CONSTANTS.SLASH + CONSTANTS.PROBLEM_META_DATA;

        const response = yield call(() =>
            axios.get(endpoint)
        );
        yield put(fetchProblemListSuccess(response.data));
    } catch (error) {
        yield put(fetchProblemListFailure(error.message));
    }
}

export default function* problemListWatcher() {
    yield takeLatest(fetchProblemListStart.type, fetchProblemListSaga);
}
