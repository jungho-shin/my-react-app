import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavbarVertical = () => {
  const location = useLocation();

  return (
    <nav className="navbar navbar-vertical navbar-expand-xl navbar-light">
      <div className="d-flex align-items-center">
        <div className="toggle-icon-wrapper">
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
        <Link className="navbar-brand" to="/">
          <div className="d-flex align-items-center py-3">
            <span className="text-sans-serif">Phoenix</span>
          </div>
        </Link>
      </div>
      <div className="navbar-vertical-content">
        <div className="navbar-vertical-collapse">
          <ul className="navbar-nav flex-column" id="navbarVerticalNav">
            <li className="nav-item">
              <Link
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                to="/"
              >
                <div className="d-flex align-items-center">
                  <span className="nav-link-icon">
                    <span data-feather="home"></span>
                  </span>
                  <span className="nav-link-text">홈</span>
                </div>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${location.pathname.startsWith('/dashboard') ? 'active' : ''}`}
                to="/dashboard"
              >
                <div className="d-flex align-items-center">
                  <span className="nav-link-icon">
                    <span data-feather="grid"></span>
                  </span>
                  <span className="nav-link-text">대시보드</span>
                </div>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${location.pathname.startsWith('/apps') ? 'active' : ''}`}
                to="/apps"
              >
                <div className="d-flex align-items-center">
                  <span className="nav-link-icon">
                    <span data-feather="package"></span>
                  </span>
                  <span className="nav-link-text">앱</span>
                </div>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${location.pathname.startsWith('/pages') ? 'active' : ''}`}
                to="/pages"
              >
                <div className="d-flex align-items-center">
                  <span className="nav-link-icon">
                    <span data-feather="file-text"></span>
                  </span>
                  <span className="nav-link-text">페이지</span>
                </div>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${location.pathname.startsWith('/modules') ? 'active' : ''}`}
                to="/modules"
              >
                <div className="d-flex align-items-center">
                  <span className="nav-link-icon">
                    <span data-feather="layers"></span>
                  </span>
                  <span className="nav-link-text">모듈</span>
                </div>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${location.pathname.startsWith('/documentation') ? 'active' : ''}`}
                to="/documentation"
              >
                <div className="d-flex align-items-center">
                  <span className="nav-link-icon">
                    <span data-feather="book"></span>
                  </span>
                  <span className="nav-link-text">문서</span>
                </div>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavbarVertical;

