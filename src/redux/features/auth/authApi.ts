import { baseApi } from "../baseApi/baseApi";


export const authApi = baseApi.injectEndpoints({
  endpoints: (builder:any) => ({
    signupApi: builder.mutation({
      query: (data:any) => ({
        url: "/user",
        method: "POST",
        body: data,
      }),
    }),
    loginApi: builder.mutation({
      query: (data:any) => ({
        url: "/auth/login",
        method: "POST",
        body: data,
      }),
    }),
    changePassword: builder.mutation({
      query: (data: any) => ({
        url: "/auth/changePassword",
        method: "POST",
        body: data,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (data:any) => ({
        url: "/auth/forgotPassword",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useSignupApiMutation ,useLoginApiMutation,useChangePasswordMutation,useForgotPasswordMutation} = authApi;