import { baseApi } from "../baseApi/baseApi";

export const productAPI = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Add Product
    addProduct: builder.mutation({
      query: (data) => {
        console.log("Payload sent to backend:", data);
        return {
          url: `/product/addProduct`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["product"],
    }),

    // Get All Products
    getProducts: builder.query({
      query: () => ({
        url: `/product/getProducts`,
        method: "GET",
      }),
      providesTags: ["product"],
    }),

    // Optional: Get single product (for editing)
    getProductById: builder.query({
      query: (id: string) => ({
        url: `/product/getProduct/${id}`,
        method: "GET",
      }),
      providesTags: ["product"],
    }),

    // Update Product
    updateProduct: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/product/updateProduct/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["product"],
    }),

    // Delete Product
    deleteProduct: builder.mutation({
      query: (id: string) => ({
        url: `/product/deleteProduct/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["product"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAddProductMutation,
  useGetProductsQuery,
  useGetProductByIdQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productAPI;
