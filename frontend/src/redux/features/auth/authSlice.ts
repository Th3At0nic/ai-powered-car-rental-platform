import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store";

export type TUserFromToken = {
  userEmail: string;
  role: "admin" | "user";
  iat: number;
  exp: number;
};

export type TAuthenticatedUser = {
  _id: string;
  fullName: string;
  email: string;
  role: "admin" | "user";
};

type TAuthState = {
  user: null | TAuthenticatedUser;
  token: null | string;
  accessToken: null | string;
  refreshToken: null | string;
};

const initialState: TAuthState = {
  user: null,
  token: null,
  accessToken: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.accessToken = token;
      state.refreshToken = refreshToken ?? state.refreshToken;
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.accessToken = null;
      state.refreshToken = null;
    },
  },
});

export const { setUser, logoutUser } = authSlice.actions;

export default authSlice.reducer;

export const userCurrentToken = (state: RootState) => state.auth.token;
export const currentUser = (state: RootState) => state.auth.user;
