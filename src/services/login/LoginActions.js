import { const_apiurl } from "../../Constant";
import axios from "axios";
import { store } from "../../app/App";

export function loguser(username, password) {
  return (dispatch) => {
    console.log("loguser :  " + username);
    dispatch(loguserBegin());

    return axios
      .post(const_apiurl + "login", {
        login: username,
        password: password,
        entity: "",
        reset: 1, // *** The token must be renew
      })
      .then((json) => {
        console.log("loguserSucces : "); //+ JSON.stringify(json.data.success
        let login = {
          code: json.data.success.code,
          token: json.data.success.token,
          username: username,
        };
        dispatch(loguserSuccess(login));

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
