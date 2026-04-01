import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
} from "../../redux/slices/job/jobSlice";
import { showSuccess, showError } from "../../utils/toastService";
import useRoleRights from "../../hooks/useRoleRights";
import { PageNames } from "../../utils/constants";
import { Plus, Trash2 } from "lucide-react";

const Job = () => {
  const dispatch = useDispatch();
  const { jobList: jobs, loading } = useSelector((state) => state.job) || {
    jobList: [],
    loading: false,
  };
  console.log("Jobs data from redux state:", jobs);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const authUser = JSON.parse(sessionStorage.getItem("user"));

  const [formData, setFormData] = useState({
    _id: null,
    title: "",
    exp: "",
    salary: "",
    location: "",
    desc: [""], // array of points
    status: "Active",
  });

  /* ===== PAGINATION STATE ===== */
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(getJobs());
  }, [dispatch]);

  const { canWrite, canDelete, isFormDisabled } = useRoleRights(PageNames.JOB);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePointChange = (index, value) => {
    const newDesc = [...formData.desc];
    newDesc[index] = value;
    setFormData((prev) => ({ ...prev, desc: newDesc }));
  };

  const addPoint = () => {
    setFormData((prev) => ({ ...prev, desc: [...prev.desc, ""] }));
  };

  const removePoint = (index) => {
    if (formData.desc.length > 1) {
      const newDesc = formData.desc.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, desc: newDesc }));
    }
  };

  const resetForm = () => {
    setFormData({
      _id: null,
      title: "",
      exp: "",
      salary: "",
      location: "",
      desc: [""],
      status: "Active",
    });
    setIsEdit(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return showError("Title is required");

    // Clean empty points from desc
    const cleanDesc = formData.desc.filter((p) => p.trim() !== "");
    if (cleanDesc.length === 0)
      return showError("At least one description point is required");

    setIsSubmitting(true);
    const currentUserId = authUser?._id || authUser?.id || null;
    const dataToSend = {
      ...formData,
      desc: cleanDesc,
      user_id: currentUserId,
      created_by: isEdit
        ? formData.created_by?._id || formData.created_by
        : currentUserId,
      updated_by: currentUserId,
    };

    try {
      if (isEdit) {
        await dispatch(
          updateJob({ id: formData._id, formData: dataToSend }),
        ).unwrap();
        showSuccess("Job updated successfully");
      } else {
        await dispatch(createJob(dataToSend)).unwrap();
        showSuccess("Job added successfully");
      }
      dispatch(getJobs());
      resetForm();
      setCurrentPage(1);
    } catch (err) {
      showError("Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = (id) => {
    const currentUserId = authUser?._id || authUser?.id || null;
    if (window.confirm("Are you sure you want to delete this job?")) {
      dispatch(deleteJob({ id, user_id: currentUserId })).then(() => {
        showSuccess("Job deleted successfully");
        dispatch(getJobs());
      });
    }
  };

  /* ===== PAGINATION LOGIC ===== */
  const totalPages = Math.ceil((jobs?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = jobs?.slice(startIndex, startIndex + itemsPerPage) || [];

  return (
    <div className="">
      {/* HEADER */}
      <div className="relative overflow-hidden shadow-sm border border-gray-200 h-25 bg-gradient-to-r from-orange-400 via-cyan-400 to-blue-300">
        <div className="absolute inset-0 bg-white/10"></div>
        <div className="relative flex justify-center items-center px-6 py-4 h-25">
          <div className="flex flex-col text-center">
            <h2 className="text-xl font-semibold text-gray-700">
              Job Management
            </h2>
            <p className="text-sm text-gray-600">
              Add or update job openings and manage their status.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* FORM */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-base font-medium text-gray-800 mb-4">
            {isEdit ? "Update Job" : "Add New Job"}
          </h3>
          <form
            onSubmit={handleSubmit}
            className={`space-y-4 ${isFormDisabled ? "opacity-60 pointer-events-none" : ""}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. React Developer"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience
                </label>
                <input
                  type="text"
                  name="exp"
                  value={formData.exp}
                  onChange={handleChange}
                  placeholder="e.g. 2-4 Years"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salary
                </label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g. 5-8 LPA"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Noida, UP"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description Points <span className="text-red-500">*</span>
              </label>
              {formData.desc.map((point, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => handlePointChange(index, e.target.value)}
                    placeholder={`Point ${index + 1}`}
                    className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removePoint(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addPoint}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium pt-1"
              >
                <Plus size={16} /> Add Point
              </button>
            </div>

            <div className="flex justify-between items-end">
              <div className="w-1/4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-1.5 text-sm rounded text-white ${isEdit ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"} ${isSubmitting ? "opacity-50" : ""}`}
                >
                  {isSubmitting
                    ? "Processing..."
                    : isEdit
                      ? "Update Job"
                      : "Add Job"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* TABLE */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200  bg-gray-50">
            <h3 className="text-base font-medium text-gray-800">Job List</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 border-b border-gray-200 ">
                <tr>
                  <th className="px-4 py-3 font-medium">S.No</th>
                  <th className="px-4 py-3 font-medium">Job Title</th>
                  <th className="px-4 py-3 font-medium">Exp/Salary</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  {(canWrite || canDelete) && (
                    <th className="px-4 py-3 font-medium">Action</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading && jobs?.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : currentData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No jobs found
                    </td>
                  </tr>
                ) : (
                  currentData.map((item, index) => (
                    <tr
                      key={item._id}
                      className="border-b border-gray-200   hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">{startIndex + index + 1}.</td>
                      <td className="px-4 py-3 font-medium">{item.title}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {item.exp || "-"} / {item.salary || "-"}
                      </td>
                      <td className="px-4 py-3">{item.location || "-"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full font-medium ${item.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      {(canWrite || canDelete) && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {canWrite && (
                              <button
                                className="text-green-600 hover:underline"
                                onClick={() => {
                                  setFormData({ ...item });
                                  setIsEdit(true);
                                  window.scrollTo({
                                    top: 0,
                                    behavior: "smooth",
                                  });
                                }}
                              >
                                Edit
                              </button>
                            )}
                            {canDelete && (
                              <button
                                className="text-red-600 hover:underline"
                                onClick={() => handleDeleteJob(item._id)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-200  bg-gray-50 flex justify-between items-center text-sm text-gray-500">
            <span>
              Showing {startIndex + 1}–
              {Math.min(startIndex + itemsPerPage, jobs?.length || 0)} of{" "}
              {jobs?.length || 0}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Job;
