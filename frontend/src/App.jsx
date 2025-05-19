import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Signup from "./components/Signup.JSX";
import { ToastContainer } from "react-toastify";
import Login from "./components/Login";
import Dashboard from "./screens/Dashboard";
import AdminDashboard from "./screens/AdminDashboard";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/admin/dashboard" element={<AdminDashboard/>}/>
        </Routes>
      </Router>
      <ToastContainer position="top-right" pauseOnHover={true} autoClose={3000}/>
    </div>
  );
}

export default App;
