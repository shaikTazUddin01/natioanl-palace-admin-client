import { createSlice } from "@reduxjs/toolkit";

export type TUser = {
  _id?: string;
  userId?: string;
  email: string | undefined;
  role: string | undefined;
  phoneNumber: string;
  image: string;
  name: string;
  exp: number;
  iat: number;
};

export type TInitialState = {
  user: null | TUser;
  token: null | string;
};

const initialState: TInitialState = {
  user: null,
  token: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authInfo: (state, action) => {
      const { data, token } = action.payload;
      // console.log("--->", data);
      (state.user = data), (state.token = token);
    },
    logout:(state)=>{
      state.user=null;
      state.token=null;

    },
  },
});

// Action creators are generated for each case reducer function
export const { authInfo ,logout} = authSlice.actions;

export default authSlice.reducer;