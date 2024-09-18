import React from 'react';

function AdminPage() {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Content Area */}
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-semibold mb-4">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-4 shadow-md rounded-md">
            <h3 className="text-lg font-semibold">Total Viewers</h3>
            <p className="text-3xl font-bold">1,234</p>
          </div>
          <div className="bg-white p-4 shadow-md rounded-md">
            <h3 className="text-lg font-semibold">Viewers per cart</h3>
            <p className="text-3xl font-bold">4</p>
          </div>
          <div className="bg-white p-4 shadow-md rounded-md">
            <h3 className="text-lg font-semibold">Active Viewers</h3>
            <p className="text-3xl font-bold">567</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
