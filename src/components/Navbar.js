import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import Dropdown from "./Dropdown";

function Navbar() {
  const [click, setClick] = useState(false);
  const [dropdown, setDropdown] = useState(false);

  const closeMobileMenu = () => setClick(false);
  const handleClick = () => setClick(!click);

  const onMouseEnter = () => {
    console.log("s d s");
    if (window.innerWidth < 960) {
      setDropdown(false);
    } else {
      setDropdown(true);
    }
  };

  const onMouseLeave = () => {
    if (window.innerWidth < 960) {
      setDropdown(false);
    } else {
      setDropdown(false);
    }
  };

  return (
    <>
      <nav className="navbar_home">
        <Link to="/" className="navbar-logo_home">
          Agro-Supply Chain
        </Link>

        <div className="menu-icon_home" onClick={handleClick}>
          <i className={click ? "fas fa-times_home" : "fas fa-bars_home"} />
        </div>

        <ul className={click ? "nav-menu_home active" : "nav-menu_home"}>
          <li className="nav-item_home">
            <Link to="/" className="nav-links_home" onClick={closeMobileMenu}>
              Home
            </Link>
          </li>

          <li
            className="nav-item_home"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <Link
              to="/farmer"
              className="nav-links_home"
              onClick={closeMobileMenu}
            >
              Signup <i className="fas fa-caret-down_home" />
            </Link>
            {dropdown && <Dropdown />}
          </li>
          <li className="nav-item_home">
            <Link
              to="/login"
              className="nav-links_home"
              onClick={closeMobileMenu}
            >
              Login
            </Link>
          </li>

          <li className="nav-item_home">
            <Link
              to="/contact-us"
              className="nav-links_home"
              onClick={closeMobileMenu}
            >
              Contact Us
            </Link>
          </li>
          <li className="nav-item_home">
            <Link
              to="/instructions"
              className="nav-links_home"
              onClick={closeMobileMenu}
            >
              Instructions
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default Navbar;
