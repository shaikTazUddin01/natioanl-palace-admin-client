import { baseApi } from "../baseApi/baseApi";

export const salesAPI = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Add Sale
    addSale: builder.mutation({
      query: (data) => {
        console.log("Sale payload sent to backend:", data);
        return {
          url: `/sales/addSale`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["sales"],
    }),

    // ✅ Get All Sales
    getSales: builder.query({
      query: () => ({
        url: `/sales/getSales`,
        method: "GET",
      }),
      providesTags: ["sales"],
    }),

    // ✅ Get Single Sale
    getSaleById: builder.query({
      query: (id: string) => ({
        url: `/sales/getSale/${id}`,
        method: "GET",
      }),
      providesTags: ["sales"],
    }),

    // ✅ Update Sale
    updateSale: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/sales/updateSale/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["sales"],
    }),

    // ✅ Delete Sale
    deleteSale: builder.mutation({
      query: (id: string) => ({
        url: `/sales/deleteSale/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["sales"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAddSaleMutation,
  useGetSalesQuery,
  useGetSaleByIdQuery,
  useUpdateSaleMutation,
  useDeleteSaleMutation,
} = salesAPI;
