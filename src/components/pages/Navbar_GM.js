import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../Navbar.css";

function Navbar_GM() {
  const [click, setClick] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [dropdown, setDropdown] = useState(false);

  const closeMobileMenu = () => setClick(false);
  const handleClick = () => setClick(!click);

  return (
    <>
      <nav className="navbar_home">
        <Link to="/" className="navbar-logo_home">
          Verify Registration Requests
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

export default Navbar_GM;
