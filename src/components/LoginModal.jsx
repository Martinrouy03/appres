import React from "react";
import { useState } from "react";
import { loguser, modalOut } from "../services/login/LoginActions";
import { useDispatch, useSelector, shallowEqual } from "react-redux";

const LoginModal = () => {
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [pwd, setPwd] = useState("");
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
          <h1>Identifiez-vous</h1>
          <div className="input-container">
            <input
              type="text"
              value={username}
              placeholder="Username:"
              onChange={(event) => {
                setUsername(event.target.value);
              }}
            />
          </div>
          <input
            type="password"
            value={pwd}
            placeholder="Password:"
            onChange={(event) => {
              setPwd(event.target.value);
            }}
          />
          {error && error.response.status === 403 && (
            <h3 style={{ color: "red", display: "center" }}>
              Identifiants incorrects
            </h3>
          )}
          <input type="submit" value="Login" />
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
