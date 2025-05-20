
import axios from "axios";
const bookingApiInstance = axios.create({
  baseURL: 'http://localhost:8080/api/bookings', // Adjust port if different
  headers: {
    'Content-Type': 'application/json'
  }
});
// Automatically include auth token 
bookingApiInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); 
  console.log("token: ", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
const bookingApi = {
  // Get bookings for the logged-in user
  getMyBookings: async () => {
    const response = await bookingApiInstance.get('/my');
    return response.data;
  },

  // Create a new booking
  createBooking: async (bookingData) => {
    const response = await bookingApiInstance.post('/', bookingData);
    return response.data;
  },

  // Cancel a booking
  cancelBooking: async (bookingId) => {
    const response = await bookingApiInstance.patch(`/${bookingId}/cancel`);
    return response.data;
  },

  // Get booking by ID
  getBookingById: async (bookingId) => {
    const response = await bookingApiInstance.get(`/${bookingId}`);
    return response.data;
  },
};

export default bookingApi;
