import { const_apiurl } from "../../Constant";
import axios from "axios";
import { store } from "../../app/App";
// Actions
// import { getOrder } from "../services/services/OrderActions";
// import { getPlaces } from "../services/services/PlacesActions";
// import { getRegimes } from "../services/services/RegimesActions";
// import { customer } from "../../app/App";

export function loguser(username, password, setToken) {
  return (dispatch) => {
    console.log("loguser :  " + username);
    dispatch(loguserBegin());

    return axios
      .get(const_apiurl + "login?login=" + username + "&password=" + password)
      .then((json) => {
        console.log("loguserSucces : "); //+ JSON.stringify(json.data.success
        let login = {
          code: json.data.success.code,
          token: json.data.success.token,
          username: username,
        };
        dispatch(loguserSuccess(login));
        setToken(login.token);
        // dispatch(getPlaces());
        // dispatch(getRegimes());
        // dispatch(getOrder(customer, month, setCommandNb));
        /* update the status of the link with Dolibarr */
        // dispatch(getDolibarrStatus());

        return "";
      })
      .catch((error) => {
        console.log("loguserFailure");
        if (error.response) {
          dispatch(loguserFailure(error));
        } else {
          dispatch(loguserFailure(error));
        }
      });
  };
  //   }
  // }
}

export const LOG_USER_BEGIN = "LOG_USER_BEGIN";
export const LOG_USER_SUCCESS = "LOG_USER_SUCCESS";
export const LOG_USER_FAILURE = "LOG_USER_FAILURE";

export const loguserBegin = () => ({
  type: LOG_USER_BEGIN,
});

export const loguserSuccess = (user) => ({
  type: LOG_USER_SUCCESS,
  payload: { user },
});

export const loguserFailure = (error) => ({
  type: LOG_USER_FAILURE,
  payload: { error },
});

export function getUserToken() {
  return store.getState().loginReducer.user.token;
}
