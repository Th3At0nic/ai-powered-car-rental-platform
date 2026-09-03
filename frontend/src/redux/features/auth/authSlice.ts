import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store";

export type TUserFromToken = {
  userEmail: string;
  role: string;
  iat: number;
  exp: number;
};

type TAuthState = {
  user: null | TUserFromToken;
  token: null | string;
};

const initialState: TAuthState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setUser, logoutUser } = authSlice.actions;

export default authSlice.reducer;

export const userCurrentToken = (state: RootState) => state.auth.token;
export const currentUser = (state: RootState) => state.auth.user;
