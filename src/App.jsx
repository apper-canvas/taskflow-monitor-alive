import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import TaskDashboard from '@/components/pages/TaskDashboard';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<TaskDashboard />} />
        <Route path="/today" element={<TaskDashboard />} />
        <Route path="/upcoming" element={<TaskDashboard />} />
        <Route path="/all" element={<TaskDashboard />} />
      </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />
    </>
  );
}

export default App;