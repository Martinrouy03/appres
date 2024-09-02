import logo from "../assets/Logo.png";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { logout, loguserBegin } from "../services/login/LoginActions";
const Header = ({ token, lang, setLang, initLang }) => {
  const dispatch = useDispatch();
  const config = useSelector(
    (state) => state.configurationReducer.configuration,
    shallowEqual
  );

  const lang2 = initLang === "EN" ? "FR" : "EN";
  return (
    <header>
      <div className="container">
        <img src={logo} alt="" />
        <h1>{config.language && config.language[lang].title}</h1>
        <select
          name=""
          id="language"
          onChange={(e) => {
            setLang(e.target.value);
          }}
        >
          <option value={initLang}>{initLang}</option>
          <option value={lang2}>{lang2}</option>
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
