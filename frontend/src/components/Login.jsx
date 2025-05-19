import React, { useState } from "react";
import { authApi } from "../apis/userAPi";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleTextChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      await authApi.login(formData.identifier, formData.password);
      toast.success("Login successful!");
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.role === "admin") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      toast.error("Please enter your email");
      return;
    }

    setIsSendingReset(true);
    try {
      await authApi.forgotPassword(forgotPasswordEmail);
      toast.success("If an account exists with this email, a reset link has been sent");
      setShowForgotPassword(false);
      setForgotPasswordEmail("");
    } catch (error) {
      toast.error(error.message || "Failed to send reset link");
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Login</h2>
        <p className="text-sm text-gray-500 text-center mb-6">Enter your credentials to access your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={formData.identifier}
            onChange={handleTextChange("identifier")}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            placeholder="Email or Username"
            required
          />
          <input
            type="password"
            value={formData.password}
            onChange={handleTextChange("password")}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            placeholder="Password"
            required
          />
          <button
            type="submit"
            disabled={isLoggingIn}
            className={`w-full bg-indigo-600 text-white py-2 rounded-md font-semibold hover:bg-indigo-700 transition duration-300 ${
              isLoggingIn ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoggingIn ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="flex justify-between items-center mt-4">
          <Link
            to="/signup"
            className="text-indigo-600 text-sm hover:underline"
          >
            Don't have an account? Sign Up
          </Link>
          <span
            onClick={() => setShowForgotPassword(true)}
            className="text-indigo-600 text-sm hover:underline cursor-pointer"
          >
            Forgot Password?
          </span>
        </div>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
            <h3 className="text-md font-semibold text-gray-700 mb-2 text-center">
              Reset Password
            </h3>
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
              <input
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                placeholder="Enter your email"
                required
              />
              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  disabled={isSendingReset}
                  className={`bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 transition ${
                    isSendingReset ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isSendingReset ? "Sending..." : "Send Link"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-gray-500 hover:underline text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
