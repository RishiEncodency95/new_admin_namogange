import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";
import { createActivityLogThunk } from "../activityLog/activityLogSlice";

export const createSupport = createAsyncThunk(
  "support/create",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/support/create", formData);
      dispatch(
        createActivityLogThunk({
          user_id: formData?.user_id || null,
          message: "Support created",
          link: `${import.meta.env.VITE_API_FRONT_URL}/support`,
          section: "Support",
          data: {
            action: "SUPPORT CREATED",
            entity: "SUPPORT",
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

export const getAllSupports = createAsyncThunk(
  "support/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/support");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const getSupportById = createAsyncThunk(
  "support/getById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/support/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const updateSupport = createAsyncThunk(
  "support/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/support/${id}`, formData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const deleteSupport = createAsyncThunk(
  "support/delete",
  async ({ id, user_id }, { dispatch, rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) return rejectWithValue("No token provided");
    try {
      await api.delete(`/support/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(
        createActivityLogThunk({
          user_id,
          message: "Support deleted",
          link: `${import.meta.env.VITE_API_FRONT_URL}/support/support-list`,
          section: "Support",
        }),
      );
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

const supportSlice = createSlice({
  name: "support",
  initialState: {
    supports: [],
    singleSupport: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createSupport.pending, (state) => {
        state.loading = true;
      })
      .addCase(createSupport.fulfilled, (state, action) => {
        state.loading = false;
        state.supports.unshift(action.payload);
      })
      .addCase(createSupport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get All
      .addCase(getAllSupports.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllSupports.fulfilled, (state, action) => {
        state.loading = false;
        state.supports = action.payload;
      })
      .addCase(getAllSupports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get By ID
      .addCase(getSupportById.fulfilled, (state, action) => {
        state.singleSupport = action.payload;
      })
      // Update
      .addCase(updateSupport.fulfilled, (state, action) => {
        const index = state.supports.findIndex(
          (item) => item._id === action.payload._id,
        );
        if (index !== -1) {
          state.supports[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteSupport.fulfilled, (state, action) => {
        state.supports = state.supports.filter(
          (item) => item._id !== action.payload,
        );
      });
  },
});

export default supportSlice.reducer;
