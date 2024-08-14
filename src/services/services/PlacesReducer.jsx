import {
  GET_PLACES_BEGIN,
  GET_PLACES_FAILURE,
  GET_PLACES_SUCCESS,
  UPDATE_ISUNFOLDED_SUCCESS,
  UPDATE_ISUNFOLDED_BEGIN,
} from "./PlacesActions";

const initialState = {
  isUnFolded: [],
  places: [],
  loading: false,
  error: null,
};

export default function PlacesReducer(state = initialState, action) {
  switch (action.type) {
    // *** Get Order
    case GET_PLACES_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_PLACES_SUCCESS:
      const places = action.payload.places;
      const len = places.length;
      const isUnFolded = Array.from({ length: len }, () => true);
      return {
        ...state,
        isUnFolded: isUnFolded,
        loading: false,
        places: places,
      };

    case GET_PLACES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };
    case UPDATE_ISUNFOLDED_BEGIN:
      return {
        ...state,
        loading: true,
      };

    case UPDATE_ISUNFOLDED_SUCCESS:
      return {
        ...state,
        isUnFolded: action.payload.isUnFolded,
        loading: false,
      };

    default:
      // ALWAYS have a default case in a reducer
      return state;
  }
}
