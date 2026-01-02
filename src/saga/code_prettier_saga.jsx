import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import {
    fetchCodePrettierStart,
    fetchCodePrettierSuccess,
    fetchCodePrettierFailure
} from "../data_store/code_prettier";
import CONSTANTS from "../constants/constants";

function* fetchCodePrettierSaga(action) {
    const { language, code } = action.payload;

    try {
        const endpoint = CONSTANTS.BASE_URLS + CONSTANTS.API + CONSTANTS.SLASH + CONSTANTS.CodePrettier;

        const response = yield call(() =>
            axios.post(endpoint, {
                language, code
            })
        );

        yield put(fetchCodePrettierSuccess(response.data));

    } catch (error) {
        yield put(fetchCodePrettierFailure(error.message));
    }
}

export default function* codePrettierWatcher() {
    yield takeLatest(fetchCodePrettierStart.type, fetchCodePrettierSaga);
}
