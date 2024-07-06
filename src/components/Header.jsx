import logo from "../assets/Logo.png";
import { useDispatch } from "react-redux";
import { logout, loguserBegin } from "../services/login/LoginActions";
const Header = ({ setVisible, token }) => {
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
              // setVisible(true);
            }}
          >
            Logout
          </button>
        ) : (
          <button
            className="btn"
            onClick={() => {
              dispatch(loguserBegin());
              // setVisible(true);
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
