import axios from 'axios';
import Swal from "sweetalert2";


const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_APP_API_URL}/`,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log("Token in localStorage", token);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.log("sdsd", error.response.status);
            const { status } = error.response;
            console.log("status", status);

            if (status === 401) {
                Swal.fire({
                    icon: "error",
                    title: "Network Error",
                    text: error?.response?.data?.error || "Error",
                });
            }

            else if (status === 400) {
                Swal.fire({
                    icon: "error",
                    title: "Network Error",
                    text: error?.response?.data?.error || "Error",
                });
            }

            else if (status === 404) {
                Swal.fire({
                    icon: "error",
                    title: "Network Error",
                    text: error?.response?.data?.error || "Error",
                });
            }

            else if (status === 500) {
                Swal.fire({
                    icon: "error",
                    title: "Network Error",
                    text: error?.response?.data?.error || "Server Error",
                });
            }

        } else if (error.request) {
            console.log('Network error or no response received. Please check your connection.');
        } else {
            console.log('Error in setting up the request:', error.message);
        }
    }
);

export default axiosInstance;
