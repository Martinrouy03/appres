import {
  GET_CONFIGURATION_SUCCESS,
  GET_CONFIGURATION_FAILURE,
} from "./ConfigurationActions";

const initialState = {
  //   intakeplaces: [],
  //   mealtypes: [],
  configuration: "",
  loading: false,
  error: null,
};

export default function ConfigurationReducer(state = initialState, action) {
  switch (action.type) {
    case GET_CONFIGURATION_SUCCESS:
      return {
        ...state,
        loading: false,
        configuration: action.payload.configuration,
      };

    case GET_CONFIGURATION_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };
    // *** get dklplaces
    // case GET_INTAKEPLACES_BEGIN:
    //   return {
    //     ...state,
    //     loading: true,
    //     error: null,
    //   };

    // case GET_INTAKEPLACES_SUCCESS:
    //   return {
    //     ...state,
    //     loading: false,
    //     intakeplaces: action.payload.intakeplaces,
    //   };

    // case GET_INTAKEPLACES_FAILURE:
    //   return {
    //     ...state,
    //     loading: false,
    //     error: action.payload.error,
    //   };

    // // *** get mealtypes
    // case GET_MEALTYPES_BEGIN:
    //   return {
    //     ...state,
    //     loading: true,
    //     error: null,
    //   };

    // case GET_MEALTYPES_SUCCESS:
    //   return {
    //     ...state,
    //     loading: false,
    //     mealtypes: action.payload.mealtypes,
    //   };

    // case GET_MEALTYPES_FAILURE:
    //   return {
    //     ...state,
    //     loading: false,
    //     error: action.payload.error,
    //   };
    default:
      // ALWAYS have a default case in a reducer
      return state;
  }
}
