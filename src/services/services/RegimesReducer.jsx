import {
  GET_REGIMES_BEGIN,
  GET_REGIMES_FAILURE,
  GET_REGIMES_SUCCESS,
} from "./RegimesActions";

const initialState = [];

export default function RegimesReducer(state = initialState, action) {
  switch (action.type) {
    // *** Get Order
    case GET_REGIMES_BEGIN:
      return {
        ...state,
        regimes: [],
        loading: true,
        error: null,
      };

    case GET_REGIMES_SUCCESS:
      const regimes = action.payload.regimes;
      return {
        ...state,
        loading: false,
        regimes: regimes,
      };

    case GET_REGIMES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };

    default:
      // ALWAYS have a default case in a reducer
      return state;
  }
}
