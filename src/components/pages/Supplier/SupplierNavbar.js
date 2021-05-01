import React, { useState } from "react";
import { Link } from "react-router-dom";

function SupplierNavbar(props) {
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

        <ul className={click ? "nav-menu_home active" : "nav-menu_home"}>
          {/*<li className="nav-item_home">
              <Link
                to={"/ManageCommodities/" + props.publicKey}
                className="nav-links_farmer"
                onClick={closeMobileMenu}
              >
                Manage Commodities
              </Link>
    </li>*/}
          <li className="nav-item_home">
            <Link
              to={"/EditCommodities/" + props.publicKey}
              className="nav-links_farmer"
              onClick={closeMobileMenu}
            >
              Edit Commodities
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

export default SupplierNavbar;
