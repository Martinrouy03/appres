import { store } from "../../app/App";

//*** Application initialisation**************************** */
export function getConfiguration() {
  return (dispatch) => {
    // let configurationFile = "";

    if (store.getState().configurationReducer.configuration !== "") return;

    fetch("configuration.json", {
      // cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    })
      .then((r) => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      })
      .then((data) => {
        dispatch(getConfigurationSuccess(data));
      })
      .catch((error) => {
        console.error("Fetch error:", error); // Logging fetch errors
        dispatch(getConfigurationFailure(error));
      });
  };
}

export function getConfigurationdepositpercent() {
  return store.getState().configurationReducer.configuration.depositpercent;
}

export function getConfigurationValue(valueName) {
  let config = store.getState().configurationReducer.configuration;
  return config[valueName];
}

export function getConfigurationSuccess(configuration) {
  return (dispatch) => {
    dispatch({
      type: GET_CONFIGURATION_SUCCESS,
      payload: { configuration },
    });
  };
}
export const GET_CONFIGURATION_SUCCESS = "GET_CONFIGURATION_SUCCESS";

export function getConfigurationFailure(error) {
  return (dispatch) => {
    dispatch({
      type: GET_CONFIGURATION_FAILURE,
      payload: { error },
    });
  };
}
export const GET_CONFIGURATION_FAILURE = "GET_CONFIGURATION_FAILURE";
