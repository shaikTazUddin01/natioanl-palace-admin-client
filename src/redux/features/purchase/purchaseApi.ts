import { baseApi } from "../baseApi/baseApi";

export const purchaseAPI = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ✅ Add Purchase
    addPurchase: builder.mutation({
      query: (data) => {
        console.log("Purchase payload sent to backend:", data);
        return {
          url: `/purchase/addPurchase`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["purchase"],
    }),

    // ✅ Get All Purchases
    getPurchases: builder.query({
      query: () => ({
        url: `/purchase/getPurchases`,
        method: "GET",
      }),
      providesTags: ["purchase"],
    }),

    // ✅ Get Single Purchase (for edit / view)
    getPurchaseById: builder.query({
      query: (id: string) => ({
        url: `/purchase/getPurchase/${id}`,
        method: "GET",
      }),
      providesTags: ["purchase"],
    }),

    // ✅ Update Purchase
    updatePurchase: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/purchase/updatePurchase/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["purchase"],
    }),

    // ✅ Delete Purchase
    deletePurchase: builder.mutation({
      query: (id: string) => ({
        url: `/purchase/deletePurchase/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["purchase"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAddPurchaseMutation,
  useGetPurchasesQuery,
  useGetPurchaseByIdQuery,
  useUpdatePurchaseMutation,
  useDeletePurchaseMutation,
} = purchaseAPI;
