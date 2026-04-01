import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";
import { createActivityLogThunk } from "../activityLog/activityLogSlice";

// helper
const getUserId = (data) => {
  if (data instanceof FormData) {
    return (
      data.get("user_id") || data.get("created_by") || data.get("updated_by")
    );
  }
  return (
    data?.user_id ||
    data?.created_by?._id ||
    data?.created_by ||
    data?.updated_by
  );
};

// ================= APPLY JOB =================
export const createJobApplication = createAsyncThunk(
  "jobApply/create",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/job-apply/create", formData);

      const userId = getUserId(formData);

      // 🔥 Activity Log
      dispatch(
        createActivityLogThunk({
          user_id: userId,
          created_by: userId,
          message: "Job application submitted",
          link: `${import.meta.env.VITE_API_FRONT_URL}/job-apply`,
          section: "Job Apply",
          data: {
            action: "CREATE",
            entity: "JobApplication",
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

// ================= GET ALL =================
export const getJobApplications = createAsyncThunk(
  "jobApply/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/job-apply/list");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// ================= GET SINGLE =================
export const getJobApplicationById = createAsyncThunk(
  "jobApply/getById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/job-apply/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// ================= UPDATE =================
export const updateJobApplication = createAsyncThunk(
  "jobApply/update",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/job-apply/update/${id}`, formData);

      const userId = getUserId(formData);

      dispatch(
        createActivityLogThunk({
          user_id: userId,
          created_by: userId,
          message: "Job application updated",
          link: `${import.meta.env.VITE_API_FRONT_URL}/job-apply`,
          section: "Job Apply",
          data: {
            action: "UPDATE",
            entity: "JobApplication",
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

// ================= DELETE =================
export const deleteJobApplication = createAsyncThunk(
  "jobApply/delete",
  async ({ id, user_id }, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`/job-apply/delete/${id}`);

      dispatch(
        createActivityLogThunk({
          user_id,
          created_by: user_id,
          message: "Job application deleted",
          link: `${import.meta.env.VITE_API_FRONT_URL}/job-apply`,
          section: "Job Apply",
          data: {
            action: "DELETE",
            entity: "JobApplication",
          },
        }),
      );

      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// ================= SLICE =================
const jobApplySlice = createSlice({
  name: "jobApply",
  initialState: {
    applicationList: [],
    singleApplication: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearApplication: (state) => {
      state.singleApplication = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // CREATE
      .addCase(createJobApplication.pending, (state) => {
        state.loading = true;
      })
      .addCase(createJobApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.applicationList.unshift(action.payload);
      })
      .addCase(createJobApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET ALL
      .addCase(getJobApplications.pending, (state) => {
        state.loading = true;
      })
      .addCase(getJobApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applicationList = action.payload;
      })
      .addCase(getJobApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET SINGLE
      .addCase(getJobApplicationById.fulfilled, (state, action) => {
        state.singleApplication = action.payload;
      })

      // UPDATE
      .addCase(updateJobApplication.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateJobApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.applicationList = state.applicationList.map((item) =>
          item._id === action.payload._id ? action.payload : item,
        );
      })
      .addCase(updateJobApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteJobApplication.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteJobApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.applicationList = state.applicationList.filter(
          (item) => item._id !== action.payload,
        );
      })
      .addCase(deleteJobApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearApplication } = jobApplySlice.actions;
export default jobApplySlice.reducer;
