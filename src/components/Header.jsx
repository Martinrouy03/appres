import logo from "../assets/Logo.png";
import { useDispatch } from "react-redux";
import {
  logout,
  loguserBegin,
  getLogout,
} from "../services/login/LoginActions";
const Header = ({ token }) => {
  const dispatch = useDispatch();
  return (
    <header>
      <div className="container">
        <img src={logo} alt="" />
        <h1>Appli Résidents</h1>
        {token ? (
          <button
            className="btn"
            onClick={() => {
              dispatch(logout());
              getLogout();
            }}
          >
            Logout
          </button>
        ) : (
          <button
            className="btn"
            onClick={() => {
              dispatch(loguserBegin());
            }}
          >
            Se connecter
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
