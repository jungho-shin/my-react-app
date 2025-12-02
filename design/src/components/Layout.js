import React from 'react';
import NavbarVertical from './NavbarVertical';
import NavbarTop from './NavbarTop';
import SearchboxModal from './SearchboxModal';

const Layout = ({ children }) => {
  return (
    <main id="top" className="main">
      <NavbarVertical />
      <NavbarTop />
      <SearchboxModal />
      <div className="content">
        <div className="pb-5">
          {children}
        </div>
      </div>
    </main>
  );
};

export default Layout;

