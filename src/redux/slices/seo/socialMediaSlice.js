import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";
import { createActivityLogThunk } from "../activityLog/activityLogSlice";

// helper
const getUserId = (formData) => {
  return formData instanceof FormData
    ? formData.get("user_id")
    : formData?.user_id;
};

// ==============================
// UPSERT (CREATE + UPDATE)
// ==============================
export const upsertSocialMedia = createAsyncThunk(
  "social/upsert",
  async (formData, { dispatch, rejectWithValue }) => {
    const token = sessionStorage.getItem("token");
    if (!token) return rejectWithValue("No token provided");

    try {
      const res = await api.post("/social-media/upsert", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userId = getUserId(formData);

      dispatch(
        createActivityLogThunk({
          user_id: userId,
          message: "Social Media saved",
          link: `${import.meta.env.VITE_API_FRONT_URL}/social-media`,
          section: "Social Media",
          data: {
            action: "UPSERT",
            entity: "SocialMedia",
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

// ==============================
// GET SINGLE
// ==============================
export const getSocialMedia = createAsyncThunk(
  "social/get",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/social-media/get");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// ==============================
// DELETE
// ==============================
export const deleteSocialMedia = createAsyncThunk(
  "social/delete",
  async ({ user_id }, { dispatch, rejectWithValue }) => {
    const token = sessionStorage.getItem("token");
    if (!token) return rejectWithValue("No token provided");

    try {
      await api.delete("/social-media/delete", {
        headers: { Authorization: `Bearer ${token}` },
      });

      dispatch(
        createActivityLogThunk({
          user_id,
          message: "Social Media deleted",
          link: `${import.meta.env.VITE_API_FRONT_URL}/social-media`,
          section: "Social Media",
          data: {
            action: "DELETE",
            entity: "SocialMedia",
          },
        }),
      );

      return null;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// ==============================
// SLICE
// ==============================
const socialMediaSlice = createSlice({
  name: "socialMedia",
  initialState: {
    socialData: null, // 🔥 single object
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      // UPSERT
      .addCase(upsertSocialMedia.pending, (state) => {
        state.loading = true;
      })
      .addCase(upsertSocialMedia.fulfilled, (state, action) => {
        state.loading = false;
        state.socialData = action.payload; // 🔥 replace
      })
      .addCase(upsertSocialMedia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET
      .addCase(getSocialMedia.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSocialMedia.fulfilled, (state, action) => {
        state.loading = false;
        state.socialData = action.payload;
      })
      .addCase(getSocialMedia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteSocialMedia.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSocialMedia.fulfilled, (state) => {
        state.loading = false;
        state.socialData = null; // 🔥 clear
      })
      .addCase(deleteSocialMedia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default socialMediaSlice.reducer;
