import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const adminAuth = sessionStorage.getItem("adminAuthenticated");

    // Allow access if they have a valid backend admin token OR if they've passed the client-side password gate
    if ((token && role === "admin") || adminAuth === "true") {
        return children;
    }

    // Redirect to the admin login page if not authenticated
    return <Navigate to="/admin" />;
};

export default AdminRoute;