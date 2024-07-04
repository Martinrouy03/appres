import {
  LOG_USER_BEGIN,
  LOG_USER_SUCCESS,
  LOG_USER_FAILURE,
} from "./LoginActions";

const initialState = {
  user: { code: "", token: "", username: "" },
  isLogged: false,
  modalClose: false,
  loading: false,
  error: null,
};

export default function LoginReducer(state = initialState, action) {
  switch (action.type) {
    // *** Invoice  load
    case LOG_USER_BEGIN:
      return {
        ...state,
        loading: true,
        modalClose: false,
        error: null,
      };

    case LOG_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        modalClose: true,
        user: action.payload.user,
        isLogged: true,
      };

    case LOG_USER_FAILURE:
      return {
        ...state,
        loading: false,
        modalClose: false,
        error: action.payload.error,
      };
    default:
      // ALWAYS have a default case in a reducer
      return state;
  }
}