import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./main.css";

function MainNavbar(props) {
  const [click, setClick] = useState(false);

  const closeMobileMenu = () => setClick(false);
  const handleClick = () => setClick(!click);

  return (
    <>
      <nav className="navbar_home">
        <div className="textColor">Welcome {props.username.slice(43)}</div>

        <div className="menu-icon_home" onClick={handleClick}>
          <i className={click ? "fas fa-times_home" : "fas fa-bars_home"} />
        </div>

        <ul className={click ? "nav-menu_home active" : "nav-menu_home"}>
          <li className="nav-item_home">
            <Link
              to="/UnverifiedUsers"
              className="nav-links_admin"
              onClick={closeMobileMenu}
            >
              Verify New Applications
            </Link>
            <Link to="/" className="nav-links_admin" onClick={closeMobileMenu}>
              logout
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default MainNavbar;
