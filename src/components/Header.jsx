import logo from "../assets/Logo.png";
const Header = () => {
  return (
    <header>
      <div className="container">
        <img src={logo} alt="" />
        <h1>Appli Résidents</h1>
        <button className="btn">Se connecter</button>
      </div>
    </header>
  );
};

export default Header;
