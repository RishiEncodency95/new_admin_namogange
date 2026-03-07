import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";
import { createActivityLogThunk } from "../activityLog/activityLogSlice";

/* ================= CREATE ================= */

export const createSeoCode = createAsyncThunk(
  "seoCode/create",
  async (formData, { dispatch, rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) return rejectWithValue("No token provided");

    try {
      const res = await api.post("/seo-code/create", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userId =
        formData instanceof FormData
          ? formData.get("user_id")
          : formData?.user_id;

      dispatch(
        createActivityLogThunk({
          user_id: userId,
          message: "SEO Code Created",
          link: `${import.meta.env.VITE_API_FRONT_URL}/seo-code`,
          section: "SEO Code",
          data: {
            action: "CREATE",
            entity: "SEO Code",
            new_data: res.data.data,
          },
        }),
      );

      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

/* ================= UPDATE ================= */

export const updateSeoCode = createAsyncThunk(
  "seoCode/update",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) return rejectWithValue("No token provided");

    try {
      const res = await api.put(`/seo-code/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userId =
        formData instanceof FormData
          ? formData.get("user_id")
          : formData?.user_id;

      dispatch(
        createActivityLogThunk({
          user_id: userId,
          message: "SEO Code Updated",
          link: `${import.meta.env.VITE_API_FRONT_URL}/seo-code`,
          section: "SEO Code",
          data: {
            action: "UPDATE",
            entity: "SEO Code",
            new_data: res.data.data,
          },
        }),
      );

      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

/* ================= GET ALL ================= */

export const getAllSeoCode = createAsyncThunk(
  "seoCode/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/seo-code");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

/* ================= GET BY ID ================= */

export const getSeoCodeById = createAsyncThunk(
  "seoCode/getById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/seo-code/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

/* ================= DELETE ================= */

export const deleteSeoCode = createAsyncThunk(
  "seoCode/delete",
  async ({ id, user_id }, { dispatch, rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return rejectWithValue("No token provided");
    }
    try {
      await api.delete(`/seo-code/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch(
        createActivityLogThunk({
          user_id,
          message: "SEO Code Deleted",
          link: `${import.meta.env.VITE_API_FRONT_URL}/seo-code`,
          section: "SEO Code",
          data: {
            action: "DELETE",
            entity: "SEO Code",
            new_data: id,
          },
        }),
      );

      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

/* ================= SLICE ================= */

const seoCodeSlice = createSlice({
  name: "seoCode",
  initialState: {
    seoCodeList: [],
    singleSeoCode: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSingleSeoCode: (state) => {
      state.singleSeoCode = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // CREATE
      .addCase(createSeoCode.pending, (state) => {
        state.loading = true;
      })
      .addCase(createSeoCode.fulfilled, (state, action) => {
        state.loading = false;
        state.seoCodeList.unshift(action.payload);
      })
      .addCase(createSeoCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET ALL
      .addCase(getAllSeoCode.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllSeoCode.fulfilled, (state, action) => {
        state.loading = false;
        state.seoCodeList = action.payload;
      })
      .addCase(getAllSeoCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET BY ID
      .addCase(getSeoCodeById.fulfilled, (state, action) => {
        state.singleSeoCode = action.payload;
      })

      // UPDATE
      .addCase(updateSeoCode.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSeoCode.fulfilled, (state, action) => {
        state.loading = false;

        const index = state.seoCodeList.findIndex(
          (item) => item._id === action.payload._id,
        );

        if (index !== -1) {
          state.seoCodeList[index] = action.payload;
        }

        state.singleSeoCode = action.payload;
      })
      .addCase(updateSeoCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteSeoCode.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSeoCode.fulfilled, (state, action) => {
        state.loading = false;
        state.seoCodeList = state.seoCodeList.filter(
          (item) => item._id !== action.payload,
        );
      })
      .addCase(deleteSeoCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSingleSeoCode } = seoCodeSlice.actions;

export default seoCodeSlice.reducer;
