import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Signup from "./components/Signup.JSX";
import { ToastContainer } from "react-toastify";
import Login from "./components/Login";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" pauseOnHover={true} autoClose={3000}/>
    </div>
  );
}

export default App;
