import React from "react";
import { useState } from "react";
import { loguser, modalOut } from "../services/login/LoginActions";
import { useDispatch, useSelector, shallowEqual } from "react-redux";

const LoginModal = ({ lang }) => {
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [pwd, setPwd] = useState("");
  const language = useSelector(
    (state) => state.configurationReducer.configuration.language
  );
  const error = useSelector((state) => state.loginReducer.error, shallowEqual);

  const handleSubmit = async (username, password) => {
    dispatch(loguser(username, password));
  };

  return (
    <div
      className="modal-root"
      onMouseDown={() => {
        dispatch(modalOut());
      }}
    >
      <div
        className="modal"
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit(username, pwd);
          setUsername("");
          setPwd("");
        }}
      >
        <form>
          <br />

          <h1>{language[lang].identify}</h1>
          <div className="input-container">
            <input
              type="text"
              value={username}
              placeholder={language[lang].username}
              onChange={(event) => {
                setUsername(event.target.value);
              }}
            />
          </div>
          <input
            type="password"
            value={pwd}
            placeholder={language[lang].password}
            onChange={(event) => {
              setPwd(event.target.value);
            }}
          />
          {error && error.response.status === 403 && (
            <h3 style={{ color: "red", display: "center" }}>
              {language[lang].loginError}
            </h3>
          )}
          <input
            type="submit"
            value={language[lang].loginButton}
            disabled={!(username && pwd)}
          />
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
