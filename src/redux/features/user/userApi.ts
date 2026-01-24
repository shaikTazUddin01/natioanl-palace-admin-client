import { baseApi } from "../baseApi/baseApi";


export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    alluser: builder.query({
      query: ({verified}) => ({
        url: "/user/getUsers",
        method: "GET",
        params:{verified}
      }),
      providesTags:["user"]
    }),
    getSingleUser: builder.query({
      query: (id:string) => ({
        url: `/user/getSingleUser/${id}`,
        method: "GET",
      }),
      providesTags:['user']
    }),
    getMyInFo: builder.query({
      query: () => ({
        url: `/user/getMyInFo`,
        method: "GET",
      }),
      providesTags:['user']
    }),
    deleteUser: builder.mutation({
      query: (id:string) => ({
        url: `/user/deleteUser/${id}`,
        method: "DELETE",
      }),
      invalidatesTags:["user"]
    }),
    updateUser: builder.mutation({
      query: ({payload}) => ({
        url: `/user/updateUserProfile/${payload?.id}`,
        method: "PATCH",
        body:payload?.updateInFo
      }),
      invalidatesTags:["user"]
    }),
    updateProfileImage: builder.mutation({
      query: (payload) =>{ 
        // console.log('object-->',payload);
        return({
        url: '/user/updateProfileImage',
        method: "PATCH",
        body:payload
      })},
      invalidatesTags:["user"]
    }),
    
  }),
});

export const {useAlluserQuery,useGetSingleUserQuery,useDeleteUserMutation,useUpdateUserMutation,useUpdateProfileImageMutation,useGetMyInFoQuery} = userApi;