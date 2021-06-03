import React, { useState } from "react";
import { Link } from "react-router-dom";
//import "./Farmer.css";

function FarmerNavbar(props) {
  const [click, setClick] = useState(false);

  const closeMobileMenu = () => setClick(false);
  const handleClick = () => setClick(!click);

  return (
    <>
      <nav className="navbar_home">
        <div className="textColor"> Welcome {props.username}</div>

        <div className="menu-icon_home" onClick={handleClick}>
          <i className={click ? "fas fa-times_home" : "fas fa-bars_home"} />
        </div>

        <ul className={click ? "nav-menu_farmer active" : "nav-menu_farmer"}>
          <li className="nav-item_home">
            <Link
              to={"/hireTransporter/" + props.publicKey}
              className="nav-links_farmer"
              onClick={closeMobileMenu}
            >
              Hire Transporter
            </Link>
          </li>
          <li className="nav-item_home">
            <Link
              to={"/buyGoods/" + props.publicKey}
              className="nav-links_farmer"
              onClick={closeMobileMenu}
            >
              Buy Goods
            </Link>
          </li>
          <li className="nav-item_home">
            <Link
              to={"/"}
              className="nav-links_farmer"
              onClick={closeMobileMenu}
            >
              logout
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default FarmerNavbar;
