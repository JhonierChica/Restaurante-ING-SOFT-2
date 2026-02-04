import React, { useState } from 'react';
import Navbar from './Navbar';
import '../../styles/Layout.css';

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="layout-wrapper">
      <Navbar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="content-container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
