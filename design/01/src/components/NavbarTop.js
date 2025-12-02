import React from 'react';

const NavbarTop = () => {
  return (
    <nav className="navbar navbar-top navbar-expand-lg navbar-slim navbar-light">
      <div className="navbar-top-container">
        <div className="container-fluid">
          <div className="navbar-top-content">
            <div className="navbar-top-content-left">
              <button
                className="btn navbar-toggler-humburger-icon navbar-vertical-toggle"
                id="navbarVerticalCollapse"
                aria-label="Toggle Navigation"
              >
                <span className="navbar-toggle-icon">
                  <span className="toggle-line"></span>
                </span>
              </button>
            </div>
            <div className="navbar-top-content-right">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <a className="nav-link" href="#!" role="button">
                    <span data-feather="search"></span>
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#!" role="button">
                    <span data-feather="bell"></span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarTop;

