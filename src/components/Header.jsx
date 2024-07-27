import logo from "../assets/Logo.png";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { logout, loguserBegin } from "../services/login/LoginActions";
const Header = ({ token, lang, setLang }) => {
  const dispatch = useDispatch();
  const config = useSelector(
    (state) => state.configurationReducer.configuration,
    shallowEqual
  );
  return (
    <header>
      <div className="container">
        <img src={logo} alt="" />
        <h1>{config.language && config.language[lang].title}</h1>
        <select
          name=""
          id="language"
          onChange={(e) => {
            // console.log(e.target.value);
            setLang(e.target.value);
          }}
        >
          <option value="FR">FR</option>
          <option value="EN">EN</option>
        </select>
        {token ? (
          <button
            className="btn"
            onClick={() => {
              dispatch(logout());
            }}
          >
            {config.language && config.language[lang].signout}
          </button>
        ) : (
          <button
            className="btn"
            onClick={() => {
              dispatch(loguserBegin());
            }}
          >
            {config.language && config.language[lang].signin}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
