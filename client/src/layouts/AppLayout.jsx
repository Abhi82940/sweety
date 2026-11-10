import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AddReadingModal from '../components/AddReadingModal';

const AppLayout = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleReadingSaved = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70">
      <Navbar onOpenAddModal={() => setIsAddModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet context={{ refreshTrigger, onOpenAddModal: () => setIsAddModalOpen(true), handleReadingSaved }} />
      </main>

      <Footer />

      <AddReadingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onReadingSaved={handleReadingSaved}
      />
    </div>
  );
};

export default AppLayout;
