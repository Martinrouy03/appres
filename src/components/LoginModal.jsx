import React from "react";
import { useState } from "react";
import { loguser } from "../services/login/LoginActions";
import { useDispatch } from "react-redux";

const LoginModal = ({ setVisible, setToken }) => {
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [pwd, setPwd] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (username, password) => {
    console.log(username, password);
    dispatch(loguser(username, password, setToken));
  };
  return (
    <div
      className="modal-root"
      onMouseDown={() => {
        setVisible(false);
      }}
    >
      <div
        className="modal"
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
        onSubmit={(event) => {
          event.preventDefault();
          setErrorMessage("");
          handleSubmit(username, pwd);
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
            {/* <input
              type="email"
              value={email}
              placeholder="blabla@mail.com"
              onChange={(event) => {
                setEmail(event.target.value);
              }}
            /> */}
          </div>
          <input
            type="password"
            value={pwd}
            placeholder="Password:"
            onChange={(event) => {
              setPwd(event.target.value);
            }}
          />
          {errorMessage && (
            <h3 style={{ color: "red", display: "center" }}>Unauthorized</h3>
          )}
          <input type="submit" value="Login" />
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
