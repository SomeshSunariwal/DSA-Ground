import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import {
    fetchProblemStart,
    fetchProblemSuccess,
    fetchProblemFailure
} from "../data_store/problem_store";
import CONSTANTS from "../constants/constants";

function* fetchProblemSaga(action) {
    const { difficulty, category, file } = action.payload;

    try {
        const endpoint = CONSTANTS.BASE_URLS + CONSTANTS.API + CONSTANTS.SLASH + CONSTANTS.PROBLEM;

        const response = yield call(() =>
            axios.get(endpoint, {
                params: { difficulty, category, file }
            })
        );

        yield put(fetchProblemSuccess(response.data));

    } catch (error) {
        yield put(fetchProblemFailure(error.message));
    }
}

export default function* problemWatcher() {
    yield takeLatest(fetchProblemStart.type, fetchProblemSaga);
}
