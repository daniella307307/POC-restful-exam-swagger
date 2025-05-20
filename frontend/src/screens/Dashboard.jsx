import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {userProfileApi} from '../apis/userAPi';
import bookingApi from '../apis/bookingApi';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const profileRes = await userProfileApi.getMe();
        setUser(profileRes.data);

        const bookingRes = await bookingApi.getMyBookings();
        setBookings(bookingRes.data);
      } catch (err) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40 text-lg">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Welcome Header */}
      <h1 className="text-3xl font-semibold text-gray-700 mb-4">
        Welcome back, {user?.username || 'User'} 👋
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-purple-100 p-4 rounded-xl shadow">
          <h2 className="text-xl font-medium text-purple-700">Total Bookings</h2>
          <p className="text-3xl font-bold">{bookings.length}</p>
        </div>

        <div className="bg-green-100 p-4 rounded-xl shadow">
          <h2 className="text-xl font-medium text-green-700">Active Booking</h2>
          <p className="text-3xl font-bold">
            {bookings.filter(b => b.status === 'approved').length}
          </p>
        </div>

        <div className="bg-blue-100 p-4 rounded-xl shadow">
          <h2 className="text-xl font-medium text-blue-700">Pending Bookings</h2>
          <p className="text-3xl font-bold">
            {bookings.filter(b => b.status === 'pending').length}
          </p>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-semibold mb-4">Recent Bookings</h2>
        {bookings.length === 0 ? (
          <p className="text-gray-500">No bookings found.</p>
        ) : (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="py-2">#</th>
                <th className="py-2">Slot</th>
                <th className="py-2">Date</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 5).map((booking, index) => (
                <tr key={booking.id} className="text-gray-700 border-b">
                  <td className="py-2">{index + 1}</td>
                  <td className="py-2">{booking.slotId || 'N/A'}</td>
                  <td className="py-2">{new Date(booking.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 capitalize">{booking.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
