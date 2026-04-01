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

// ================= CREATE =================
export const createJob = createAsyncThunk(
  "job/create",
  async (formData, { dispatch, rejectWithValue }) => {
    const token = sessionStorage.getItem("token");
    if (!token) return rejectWithValue("No token");

    try {
      const res = await api.post("/jobs/create", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userId = getUserId(formData);

      // 🔥 Activity Log
      dispatch(
        createActivityLogThunk({
          user_id: userId,
          created_by: userId,
          message: "Job created",
          link: `${import.meta.env.VITE_API_FRONT_URL}/jobs`,
          section: "Job",
          data: {
            action: "CREATE",
            entity: "Job",
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
export const getJobs = createAsyncThunk(
  "job/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/jobs/list");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// ================= GET SINGLE =================
export const getJobById = createAsyncThunk(
  "job/getById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/jobs/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// ================= UPDATE =================
export const updateJob = createAsyncThunk(
  "job/update",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    const token = sessionStorage.getItem("token");
    if (!token) return rejectWithValue("No token");

    try {
      const res = await api.put(`/jobs/update/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userId = getUserId(formData);

      // 🔥 Activity Log
      dispatch(
        createActivityLogThunk({
          user_id: userId,
          created_by: userId,
          message: "Job updated",
          link: `${import.meta.env.VITE_API_FRONT_URL}/jobs`,
          section: "Job",
          data: {
            action: "UPDATE",
            entity: "Job",
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
export const deleteJob = createAsyncThunk(
  "job/delete",
  async ({ id, user_id }, { dispatch, rejectWithValue }) => {
    const token = sessionStorage.getItem("token");
    if (!token) return rejectWithValue("No token");

    try {
      await api.delete(`/jobs/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 🔥 Activity Log
      dispatch(
        createActivityLogThunk({
          user_id,
          created_by: user_id,
          message: "Job deleted",
          link: `${import.meta.env.VITE_API_FRONT_URL}/jobs`,
          section: "Job",
          data: {
            action: "DELETE",
            entity: "Job",
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
const jobSlice = createSlice({
  name: "job",
  initialState: {
    jobList: [],
    singleJob: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearJob: (state) => {
      state.singleJob = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // CREATE
      .addCase(createJob.pending, (state) => {
        state.loading = true;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.loading = false;
        state.jobList.unshift(action.payload);
      })
      .addCase(createJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET ALL
      .addCase(getJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(getJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobList = action.payload;
      })
      .addCase(getJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET SINGLE
      .addCase(getJobById.fulfilled, (state, action) => {
        state.singleJob = action.payload;
      })

      // UPDATE
      .addCase(updateJob.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.loading = false;
        state.jobList = state.jobList.map((job) =>
          job._id === action.payload._id ? action.payload : job,
        );
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteJob.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.loading = false;
        state.jobList = state.jobList.filter(
          (job) => job._id !== action.payload,
        );
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearJob } = jobSlice.actions;
export default jobSlice.reducer;
