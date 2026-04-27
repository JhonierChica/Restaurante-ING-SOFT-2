import React, { useState, ReactNode } from 'react';
import Navbar from './Navbar';
import '../../styles/Layout.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="layout-wrapper flex min-h-screen bg-gray-50">
      <Navbar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <main className={`main-content flex-1 transition-all duration-300 ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="content-container p-0 md:p-4">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;