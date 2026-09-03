import { ReactNode, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  logoutUser,
  TUserFromToken,
  userCurrentToken,
} from "../../redux/features/auth/authSlice";
import { Navigate } from "react-router-dom";
import { verifyToken } from "../../utils/verifyToken";

type TProtectedRoute = {
  children: ReactNode;
  role: string | undefined;
};

export const ProtectedRoute = ({ children, role }: TProtectedRoute) => {
  const dispatch = useAppDispatch();
  const token = useAppSelector(userCurrentToken);

  const [shouldLogout, setShouldLogout] = useState(false);

  useEffect(() => {
    if (token) {
      const verifiedUser = verifyToken(token) as TUserFromToken;

      if (role !== undefined && role !== verifiedUser?.role) {
        setShouldLogout(true);
      }
    } else {
      setShouldLogout(true);
    }
  }, [token, role]);

  useEffect(() => {
    if (shouldLogout) {
      dispatch(logoutUser());
    }
  }, [shouldLogout, dispatch]);

  if (!token || shouldLogout) {
    return <Navigate to="/login" replace={true} />;
  }
  return children;
};
