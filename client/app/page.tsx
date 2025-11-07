'use client';

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import EmployeeManagement from './components/EmployeeManagement';
import DeviceManagement from './components/DeviceManagement';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'employees' | 'devices'>('employees');

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-8">
        {activeTab === 'employees' && <EmployeeManagement />}
        {activeTab === 'devices' && <DeviceManagement />}
      </main>
    </div>
  );
}
