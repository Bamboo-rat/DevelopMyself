import React from 'react';
import { Outlet } from 'react-router';
import Sidebar from '~/component/layout/Sidebar';

const Dashboard = () => {
  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-white relative">
        <Outlet />
      </main>
    </div>
  );
}

export default Dashboard
