import {
  GET_PLACES_BEGIN,
  GET_PLACES_FAILURE,
  GET_PLACES_SUCCESS,
} from "./PlacesActions";

const initialState = [];

export default function PlacesReducer(state = initialState, action) {
  switch (action.type) {
    // *** Get Order
    case GET_PLACES_BEGIN:
      return {
        ...state,
        places: [],
        loading: true,
        error: null,
      };

    case GET_PLACES_SUCCESS:
      const places = action.payload.places;
      return {
        ...state,
        loading: false,
        places: places,
      };

    case GET_PLACES_FAILURE:
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
