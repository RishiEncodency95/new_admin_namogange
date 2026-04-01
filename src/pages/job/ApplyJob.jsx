import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// Assuming you have a jobApplicationSlice with these actions
import {
  createJobApplication,
  getJobApplications,
  updateJobApplication,
  deleteJobApplication,
} from "../../redux/slices/job/jobApplySlice";
import { showSuccess, showError } from "../../utils/toastService";
import useRoleRights from "../../hooks/useRoleRights";
import { PageNames } from "../../utils/constants"; // Assuming PageNames is defined here
import { Plus, Trash2 } from "lucide-react";

const ApplyJob = () => {
  const dispatch = useDispatch();
  const { applicationList: jobApplications, loading } = useSelector(
    (state) => state.jobApply,
  ) || {
    applicationList: [],
    loading: false,
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const authUser = JSON.parse(sessionStorage.getItem("user"));

  const [formData, setFormData] = useState({
    _id: null,
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    currentLocation: "",
    role: "",
    message: "",
    status: "Pending", // Default status
  });

  /* ===== PAGINATION STATE ===== */
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(getJobApplications());
  }, [dispatch]);

  // Assuming PageNames.JOB_APPLICATION is defined in your constants
  const { canWrite, canDelete, isFormDisabled } = useRoleRights(
    PageNames.APPLY_JOB,
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      _id: null,
      name: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      currentLocation: "",
      role: "",
      message: "",
      status: "Pending",
    });
    setIsEdit(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      return showError("Name and Email are required");
    }

    setIsSubmitting(true);
    const currentUserId = authUser?._id || authUser?.id || null;
    const dataToSend = {
      ...formData,
      user_id: currentUserId,
      created_by: isEdit
        ? formData.created_by?._id || formData.created_by
        : currentUserId,
      updated_by: currentUserId,
    };

    try {
      if (isEdit) {
        await dispatch(
          updateJobApplication({ id: formData._id, formData: dataToSend }),
        ).unwrap();
        showSuccess("Job Application updated successfully");
      } else {
        await dispatch(createJobApplication(dataToSend)).unwrap();
        showSuccess("Job Application added successfully");
      }
      dispatch(getJobApplications());
      resetForm();
      setCurrentPage(1);
    } catch (err) {
      showError("Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJobApplication = (id) => {
    const currentUserId = authUser?._id || authUser?.id || null;
    if (
      window.confirm("Are you sure you want to delete this job application?")
    ) {
      dispatch(deleteJobApplication({ id, user_id: currentUserId })).then(
        () => {
          showSuccess("Job Application deleted successfully");
          dispatch(getJobApplications());
        },
      );
    }
  };

  /* ===== PAGINATION LOGIC ===== */
  const totalPages = Math.ceil((jobApplications?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData =
    jobApplications?.slice(startIndex, startIndex + itemsPerPage) || [];

  return (
    <div className="">
      {/* HEADER */}
      <div className="relative overflow-hidden shadow-sm border border-gray-200 h-25 bg-gradient-to-r from-orange-400 via-cyan-400 to-blue-300">
        <div className="absolute inset-0 bg-white/10"></div>
        <div className="relative flex justify-center items-center px-6 py-4 h-25">
          <div className="flex flex-col text-center">
            <h2 className="text-xl font-semibold text-gray-700">
              Job Application Management
            </h2>
            <p className="text-sm text-gray-600">
              Manage job applications received.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* FORM */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-base font-medium text-gray-800 mb-4">
            {isEdit ? "Update Job Application" : "Add New Job Application"}
          </h3>
          <form
            onSubmit={handleSubmit}
            className={`space-y-4 ${isFormDisabled ? "opacity-60 pointer-events-none" : ""}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Applicant Name"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="applicant@example.com"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91-9876543210"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Noida"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Uttar Pradesh"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Location
                </label>
                <input
                  type="text"
                  name="currentLocation"
                  value={formData.currentLocation}
                  onChange={handleChange}
                  placeholder="e.g. Sector 62, Noida"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Applied Role
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="e.g. React Developer"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Any additional message..."
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Reviewed">Reviewed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
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
                    ? "Update Application"
                    : "Add Application"}
              </button>
            </div>
          </form>
        </div>

        {/* TABLE */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-base font-medium text-gray-800">
              Job Applications List
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-medium">S.No</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  {(canWrite || canDelete) && (
                    <th className="px-4 py-3 font-medium">Action</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading && jobApplications?.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : currentData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      No job applications found
                    </td>
                  </tr>
                ) : (
                  currentData.map((item, index) => (
                    <tr
                      key={item._id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">{startIndex + index + 1}.</td>
                      <td className="px-4 py-3 font-medium">{item.name}</td>
                      <td className="px-4 py-3">{item.email}</td>
                      <td className="px-4 py-3">{item.phone || "-"}</td>
                      <td className="px-4 py-3">
                        {item.city && item.state
                          ? `${item.city}, ${item.state}`
                          : item.city || item.state || "-"}
                      </td>
                      <td className="px-4 py-3">{item.role || "-"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                            item.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : item.status === "Reviewed"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                          }`}
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
                                onClick={() =>
                                  handleDeleteJobApplication(item._id)
                                }
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
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-sm text-gray-500">
            <span>
              Showing {startIndex + 1}–
              {Math.min(
                startIndex + itemsPerPage,
                jobApplications?.length || 0,
              )}{" "}
              of {jobApplications?.length || 0}
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

export default ApplyJob;
