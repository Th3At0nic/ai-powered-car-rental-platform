import { baseApi } from "../../api/baseApi";
import type { TAuthenticatedUser } from "./authSlice";

type TAuthResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type TLoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: TAuthenticatedUser;
};

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<TAuthResponse<TAuthenticatedUser>, { fullName: string; email: string; password: string }>({
      query: (userInfo) => ({
        url: "/auth/register",
        method: "POST",
        body: userInfo,
      }),
    }),
    login: builder.mutation<TAuthResponse<TLoginResponse>, { email: string; password: string }>({
      query: (userInfo) => ({
        url: "/auth/login",
        method: "POST",
        body: userInfo,
      }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation } = authApi;
