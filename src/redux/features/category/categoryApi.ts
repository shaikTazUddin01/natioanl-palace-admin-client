import { baseApi } from "../baseApi/baseApi";

export const categoryAPI = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Add Category
    addCategory: builder.mutation({
      query: (data) => {
        console.log("Payload sent to backend:", data);
        return {
          url: `/category/addCategory`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["category"],
    }),

    // Get All Categories
    getCategories: builder.query({
      query: () => ({
        url: `/category/getCategories`,
        method: "GET",
      }),
      providesTags: ["category"],
    }),

    // Get Single Category (for editing)
    getCategoryById: builder.query({
      query: (id: string) => ({
        url: `/category/getCategory/${id}`,
        method: "GET",
      }),
      providesTags: ["category"],
    }),

    // Update Category
    updateCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/category/updateCategory/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["category"],
    }),

    // Delete Category
    deleteCategory: builder.mutation({
      query: (id: string) => ({
        url: `/category/deleteCategory/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["category"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAddCategoryMutation,
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryAPI;
