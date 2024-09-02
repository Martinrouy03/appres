import { const_apiurl } from "../../Constant";
import axios from "axios";
import { store } from "../../app/App";
// import { get } from "lodash";

export function loguser(username, password) {
  return (dispatch) => {
    console.log("loguser :  " + username);
    dispatch(loguserBegin());

    return axios
      .get(
        const_apiurl +
          "login?login=" +
          username +
          "&password=" +
          password +
          "&entity=1"
      ) // fetch token
      .then((json) => {
        console.log("loguserSuccess : ");
        console.log(json);
        let login = {
          code: json.data.success.code,
          token: json.data.success.token,
          username: username,
        };
        dispatch(loguserSuccess(login));
        localStorage.setItem("token", login.token);
        axios
          .get(
            // fetch email from username
            const_apiurl +
              `users?sortfield=t.rowid&sortorder=ASC&sqlfilters=t.lastname:=:'${username}'` +
              "&DOLAPIKEY=" +
              login.token
          )
          .then((json) => {
            console.log("fetchEmailSuccess : ");
            const email = json.data[0].email;
            localStorage.setItem("userEmail", email);
            axios
              .get(
                // fetch userId from email
                const_apiurl +
                  "thirdparties/email/" +
                  email +
                  "?DOLAPIKEY=" +
                  login.token
              )
              .then((json) => {
                console.log("fetchEmailSuccess : ");
                localStorage.setItem("userId", json.data.id);
              });
          })
          .catch((error) => console.log(error));
        return "";
        // }
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

export function logout() {
  return (dispatch) => {
    console.log("logout begin");
    dispatch(logoutBegin());
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    try {
      console.log("logout Success");
      dispatch(logoutSuccess());
    } catch (error) {
      console.log(error);
      dispatch(logoutFailure(error));
    }
  };
}

export const LOGOUT_USER_BEGIN = "LOGOUT_USER_BEGIN";
export const LOGOUT_USER_SUCCESS = "LOGOUT_USER_SUCCESS";
export const LOGOUT_USER_FAILURE = "LOGOUT_USER_FAILURE";

export const logoutBegin = () => ({
  type: LOGOUT_USER_BEGIN,
});

export const logoutSuccess = () => ({
  type: LOGOUT_USER_SUCCESS,
});

export const logoutFailure = (error) => ({
  type: LOGOUT_USER_FAILURE,
  payload: { error },
});

export function modalOut() {
  return (dispatch) => {
    console.log("Modal Out Success");
    dispatch(ModalOutSuccess());
  };
}

export const MODAL_OUT = "MODAL_OUT";
export const ModalOutSuccess = () => ({
  type: MODAL_OUT,
});
