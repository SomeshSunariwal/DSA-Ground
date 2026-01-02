import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import CONSTANTS from "../constants/constants";

import {
    fetchRunCodeStart,
    fetchRunCodeSuccess,
    fetchRunCodeFailure
} from "../data_store/run_code_store";

function* fetchRunCode(action) {
    const { language, code, stdin, mode } = action.payload;

    try {
        const endpoint =
            mode === "docker"
                ? CONSTANTS.BASE_URLS + CONSTANTS.API + CONSTANTS.SLASH + CONSTANTS.RUN + CONSTANTS.SLASH + CONSTANTS.DOCKER
                : CONSTANTS.BASE_URLS + CONSTANTS.API + CONSTANTS.SLASH + CONSTANTS.RUN + CONSTANTS.SLASH + CONSTANTS.LOCAL;

        const response = yield call(() =>
            axios.post(endpoint, {
                language,
                code,
                stdin,
            })
        );

        yield put(fetchRunCodeSuccess(response.data));
    } catch (error) {
        yield put(fetchRunCodeFailure(error.message));
    }
}

export default function* runCodeWatcherWatcher() {
    yield takeLatest(fetchRunCodeStart.type, fetchRunCode);
}
