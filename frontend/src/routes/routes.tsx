import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "../pages/Login";
import ChangePassword from "../pages/ChangePassword";
import Register from "../pages/Register";
import About from "../pages/About";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { routesGenerator } from "../utils/routesGenerator";
import { adminPaths } from "./adminRoutes";
import { userPaths } from "./userRoutes";
import CustomerHome from "../pages/CustomerHome";
import VehicleDetails from "../pages/VehicleDetails";
import MyRentals from "../pages/MyRentals";
import Booking from "../pages/Booking";
import CustomerLayout from "../components/layout/CustomerLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <CustomerLayout />,
    children: [
      {
        index: true,
        element: <CustomerHome />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "vehicles/:vehicleId",
        element: <VehicleDetails />,
      },
      {
        path: "vehicles/:vehicleId/rent",
        element: (
          <ProtectedRoute role="user">
            <Booking />
          </ProtectedRoute>
        ),
      },
      {
        path: "my-rentals",
        element: (
          <ProtectedRoute role="user">
            <MyRentals />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute role="admin">
        <App />
      </ProtectedRoute>
    ),
    children: routesGenerator(adminPaths),
  },
  {
    path: "/user",
    element: (
      <ProtectedRoute role="user">
        <App />
      </ProtectedRoute>
    ),
    children: routesGenerator(userPaths),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/auth/change-password",
    element: <ChangePassword />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);
