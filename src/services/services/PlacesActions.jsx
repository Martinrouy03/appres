import { const_apiurl } from "../../Constant.js";
import axios from "axios";

// import { getUserToken } from "../login/LoginActions.js";
import { token } from "../../app/App.jsx";

export function getPlaces() {
  return (dispatch) => {
    console.log("getPlacesBegin");
    dispatch(getPlacesBegin());
    return axios
      .get(
        const_apiurl +
          "dklaccueil/dictionary/intakePlaces" +
          "?DOLAPIKEY=" +
          token
      )
      .then((json) => {
        console.log("getPlacesSuccess");
        dispatch(getPlacesSuccess(json.data));
      })
      .catch((error) => {
        console.log("getPlacesFailure");
        // *** an 404 error is sent when Dolibarr didn't find invoices
        if (error.response) {
          // *** It's a Dolibarr error
          if (error.response.status === 404) dispatch(getPlacesSuccess());
          else
            dispatch(
              getPlacesFailure({
                code: error.response.status,
                message:
                  error.response.status + " " + error.response.statusText,
              })
            );
        } else {
          // *** It's an API error
          dispatch(getPlacesFailure(error));
        }
      });
  };
}
export const GET_PLACES_BEGIN = "GET_PLACES_BEGIN";
export const GET_PLACES_SUCCESS = "GET_PLACES_SUCCESS";
export const GET_PLACES_FAILURE = "GET_PLACES_FAILURE";

export const getPlacesBegin = () => ({
  type: GET_PLACES_BEGIN,
});

export const getPlacesSuccess = (places) => ({
  type: GET_PLACES_SUCCESS,
  payload: { places },
});

export const getPlacesFailure = (error) => ({
  type: GET_PLACES_FAILURE,
  payload: { error },
});
