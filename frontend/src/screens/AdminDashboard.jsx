import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [spots, setSpots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, availableSpots: 0, activeBookings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [usersRes, spotsRes, bookingsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/users', { headers }), // changed from /users/all
        axios.get('http://localhost:8080/api/slots', { headers }),
        axios.get('http://localhost:8080/api/bookings', { headers }),
      ]);

      // Extract data properly depending on API response format
      const usersArray = usersRes.data?.data || []; // your users endpoint returns { success, data }
      const spotsArray = Array.isArray(spotsRes.data) ? spotsRes.data : spotsRes.data?.data || [];
      const bookingsArray = Array.isArray(bookingsRes.data) ? bookingsRes.data : bookingsRes.data?.data || [];

      setUsers(usersArray);
      setSpots(spotsArray);
      setBookings(bookingsArray);

      setStats({
        totalUsers: usersArray.length,
        availableSpots: spotsArray.filter(s => s.status === 'available').length,
        activeBookings: bookingsArray.filter(b => b.status === 'active').length,
      });

    } catch (err) {
      console.error("Error fetching dashboard data:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  const handleBookingAction = async (bookingId, action) => {
    console.log(`[DEBUG] Initiating booking action:`, { bookingId, action });
    
    // 1. Validate inputs
    if (!bookingId || !action) {
      console.error('[ERROR] Missing required parameters:', { bookingId, action });
      alert('Booking ID and action are required');
      return;
    }
  
    // 2. Validate action type
    const validActions = ['approve', 'cancel', 'complete'];
    if (!validActions.includes(action)) {
      console.error('[ERROR] Invalid action type:', action);
      alert(`Invalid action. Must be one of: ${validActions.join(', ')}`);
      return;
    }
  
    try {
      // 3. Get and verify token
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('[ERROR] No auth token found in localStorage');
        alert('Authentication required. Please login again.');
        return;
      }
  
      console.log('[DEBUG] Making API request with:', {
        url: `http://localhost:8080/api/bookings/${bookingId}/${action}`,
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
  
      // 4. Make the API call
      const response = await axios.patch(
        `http://localhost:8080/api/bookings/${bookingId}/${action}`,
        {},
        { 
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: (status) => status < 500 // Don't throw for 4xx errors
        }
      );
  
      console.log('[DEBUG] API Response:', {
        status: response.status,
        data: response.data
      });
  
      // 5. Handle different response statuses
      if (response.status === 200 || response.status === 204) {
        console.log('[SUCCESS] Booking updated successfully');
        
        // Optimistic UI update - no need to refetch all bookings
        setBookings(prev => 
          prev.map(b => 
            b.id === bookingId 
              ? { 
                  ...b, 
                  status: action === 'approve' ? 'approved' 
                        : action === 'cancel' ? 'cancelled'
                        : 'completed'
                } 
              : b
          )
        );
  
        // Update stats
        setStats(prev => ({
          ...prev,
          activeBookings: action === 'approve' 
            ? prev.activeBookings + 1 
            : action === 'cancel' 
              ? prev.activeBookings - (prev.activeBookings > 0 ? 1 : 0)
              : prev.activeBookings
        }));
  
      } else if (response.status === 401) {
        console.error('[ERROR] Unauthorized - invalid token');
        alert('Session expired. Please login again.');
      } else if (response.status === 404) {
        console.error('[ERROR] Booking not found');
        alert('Booking not found');
      } else if (response.status === 400) {
        console.error('[ERROR] Bad request:', response.data);
        alert(`Invalid request: ${response.data.message || 'Unknown error'}`);
      } else {
        console.error('[ERROR] Unexpected response:', response);
        alert('Unexpected server response');
      }
  
    } catch (err) {
      // 6. Detailed error handling
      console.error('[FULL ERROR DETAILS]', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        } : null,
        request: err.request
      });
  
      if (err.response) {
        // Server responded with error status
        alert(`Error: ${err.response.data?.message || err.response.statusText}`);
      } else if (err.request) {
        // Request was made but no response
        console.error('[NETWORK ERROR] No response received');
        alert('Network error - could not reach server');
      } else {
        // Other errors
        console.error('[UNEXPECTED ERROR]', err.message);
        alert(`Error: ${err.message}`);
      }
    }
  };
  if (loading) return <div className="flex justify-center items-center h-screen">Loading dashboard...</div>;
  if (error) return <div className="text-red-600 text-center mt-6">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-blue-700">Admin Dashboard</h1>
      </header>

      {/* Stats */}
      <section className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-blue-600 mb-2">Total Users</h2>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-blue-600 mb-2">Available Spots</h2>
          <p className="text-3xl font-bold">{stats.availableSpots}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-blue-600 mb-2">Active Bookings</h2>
          <p className="text-3xl font-bold">{stats.activeBookings}</p>
        </div>
      </section>

      {/* Users Table */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Users</h2>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-600 text-white">
              <tr>
                {['ID', 'Username', 'Email', 'Status', 'Role'].map(col => (
                  <th key={col} className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-blue-50">
                  <td className="px-6 py-4">{u.id}</td>
                  <td className="px-6 py-4">{u.username}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className={`px-6 py-4 font-semibold ${
                    u.status === 'active' ? 'text-green-600' :
                    u.status === 'banned' ? 'text-red-600' : 'text-yellow-600'}`}>
                    {u.status}
                  </td>
                  <td className="px-6 py-4">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Parking Spots Table */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Parking Spots</h2>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-600 text-white">
              <tr>
                {['ID', 'Spot Number', 'Type', 'Status'].map(col => (
                  <th key={col} className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {spots.map(s => (
                <tr key={s.id} className="hover:bg-blue-50">
                  <td className="px-6 py-4">{s.id}</td>
                  <td className="px-6 py-4 font-mono">{s.spotNumber}</td>
                  <td className="px-6 py-4 capitalize">{s.spotType}</td>
                  <td className={`px-6 py-4 font-semibold ${
                    s.status === 'available' ? 'text-green-600' :
                    s.status === 'occupied' ? 'text-red-600' :
                    s.status === 'reserved' ? 'text-yellow-600' : 'text-gray-600'}`}>
                    {s.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bookings Table */}
      <section>
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Bookings</h2>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-600 text-white">
              <tr>
                {['ID', 'User ID', 'Spot Number', 'Start Time', 'End Time', 'Status', 'Actions'].map(col => (
                  <th key={col} className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wider">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map(b => (
                <tr key={b.id} className="hover:bg-blue-50">
                  <td className="px-4 py-2">{b.id}</td>
                  <td className="px-4 py-2">{b.userId}</td>
                  <td className="px-4 py-2 font-mono">{b.parkingSpot?.spotNumber || 'N/A'}</td>
                  <td className="px-4 py-2">{new Date(b.startTime).toLocaleString()}</td>
                  <td className="px-4 py-2">{new Date(b.endTime).toLocaleString()}</td>
                  <td className={`px-4 py-2 font-semibold ${
                    b.status === 'pending' ? 'text-yellow-600' :
                    b.status === 'approved' ? 'text-blue-600' :
                    b.status === 'active' ? 'text-green-600' :
                    b.status === 'completed' ? 'text-gray-600' :
                    b.status === 'cancelled' ? 'text-red-600' : 'text-gray-400'}`}>
                    {b.status}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    {b.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleBookingAction(b.id, 'approve')}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleBookingAction(b.id, 'cancel')}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
