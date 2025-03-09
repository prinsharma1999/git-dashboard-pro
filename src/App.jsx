import React from 'react';
import { Toaster } from 'react-hot-toast';
import GitDashboardPro from './components/GitDashboardPro';

function App() {
  return (
    <div className="App">
      <Toaster position="top-right" />
      <GitDashboardPro />
    </div>
  );
}

export default App; 