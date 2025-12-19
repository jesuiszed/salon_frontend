import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Layout.css';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  return (
    <>
      <Header />
      <div className="layout">
        <Sidebar />
        <div className="main-content">
          <Outlet />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Layout;