export type TRegisterUser = {
  fullName: string;
  email: string;
  password: string;
};

export type TLoginUser = {
  email: string;
  password: string;
};

export type TUserAuthData = {
  userId: string;
  userEmail: string;
  role: string;
};
