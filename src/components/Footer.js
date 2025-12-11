import React from 'react';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-bottom">
          <p>&copy; {currentYear} React K8s App. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

