import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createSeoCode,
  updateSeoCode,
  getAllSeoCode,
  deleteSeoCode,
} from "../../redux/slices/seo/seoCodeSlice";
import { showSuccess, showError } from "../../utils/toastService";
import Swal from "sweetalert2";
import TiptapEditor from "../../components/TiptapEditor";

const AddSEOCode = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { seoCodeList, loading: reduxLoading } = useSelector(
    (state) => state.seoCode || {},
  );
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState({
    _id: null,
    seo_code: "",
    google_search_console: null,
    report: null,
    sitemap: null,
    status: "Active",
  });

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getAllSeoCode());
  }, [dispatch]);

  // Reset form
  const resetForm = useCallback(() => {
    setIsEdit(false);
    setFormData({
      _id: null,
      seo_code: "",
      google_search_console: null,
      report: null,
      sitemap: null,
      status: "Active",
    });
  }, []);

  // Handle edit
  const handleEdit = useCallback((item) => {
    setIsEdit(true);
    setFormData({
      _id: item._id,
      seo_code: item.seo_code || "",
      status: item.status || "Active",
      google_search_console: null,
      report: null,
      sitemap: null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Handle delete
  const handleDelete = useCallback(
    async (id) => {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        try {
          setLoading(true);
          const authUser = JSON.parse(localStorage.getItem("user"));
          await dispatch(
            deleteSeoCode({ id, user_id: authUser?._id }),
          ).unwrap();
          showSuccess("SEO Code deleted successfully!");
          await dispatch(getAllSeoCode());
        } catch (error) {
          showError(error?.message || "Failed to delete SEO Code");
        } finally {
          setLoading(false);
        }
      }
    },
    [dispatch],
  );

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const fileExt = file.name.split(".").pop().toLowerCase();

      if (
        name === "google_search_console" &&
        !["html", "htm"].includes(fileExt)
      ) {
        showError("Please select only HTML files");
        e.target.value = "";
        return;
      }
      if (name === "report" && fileExt !== "txt") {
        showError("Please select only TXT files");
        e.target.value = "";
        return;
      }
      if (name === "sitemap" && fileExt !== "xml") {
        showError("Please select only XML files");
        e.target.value = "";
        return;
      }

      setFormData((prev) => ({ ...prev, [name]: file }));
    }
  };

  const handleStatusChange = (e) => {
    setFormData((prev) => ({ ...prev, status: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.seo_code ||
      !formData.seo_code.trim() ||
      formData.seo_code === "<p></p>"
    ) {
      showError("SEO Code is required");
      return;
    }

    const submitData = new FormData();
    submitData.append("seo_code", formData.seo_code);
    submitData.append("status", formData.status);
    submitData.append("section", "SEO Code");
    submitData.append(
      "message",
      isEdit ? "Updated SEO Code" : "Added SEO Code",
    );

    const authUser = JSON.parse(localStorage.getItem("user"));
    const userId = authUser?._id || authUser?.id;
    if (userId) {
      submitData.append("user_id", userId);
    }

    if (formData.google_search_console) {
      submitData.append(
        "google_search_console",
        formData.google_search_console,
      );
    } else if (!isEdit) {
      showError("Google Search Console file is required");
      return;
    }

    if (formData.report) {
      submitData.append("report", formData.report);
    } else if (!isEdit) {
      showError("Report file is required");
      return;
    }

    if (formData.sitemap) {
      submitData.append("sitemap", formData.sitemap);
    } else if (!isEdit) {
      showError("Sitemap file is required");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await dispatch(
          updateSeoCode({ id: formData._id, formData: submitData }),
        ).unwrap();
        showSuccess("SEO Code updated successfully!");
      } else {
        await dispatch(createSeoCode(submitData)).unwrap();
        showSuccess("SEO Code added successfully!");
      }
      resetForm();
      await dispatch(getAllSeoCode());
    } catch (error) {
      showError(
        error?.message || `Failed to ${isEdit ? "update" : "add"} SEO Code`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 via-cyan-400 to-blue-300 border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-white">
              SEO Code Management
            </h2>
            <p className="text-sm text-blue-100">
              Add, update and view SEO code entries.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <h3 className="text-base font-medium text-gray-800 p-4 border-b border-gray-200">
            {isEdit ? "Update SEO Code" : "Add SEO Code"}
          </h3>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 pb-1">
                  Google Search Console (.html)
                  {!isEdit && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".html,.htm,text/html"
                    name="google_search_console"
                    onChange={handleFileChange}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 pb-1">
                  Robots (.txt)
                  {!isEdit && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type="file"
                  accept=".txt,text/plain"
                  name="report"
                  onChange={handleFileChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 pb-1">
                  Sitemap (.xml)
                  {!isEdit && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type="file"
                  accept=".xml,text/xml,application/xml"
                  name="sitemap"
                  onChange={handleFileChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 py-2 px-3 bg-gray-50 border-b">
                  Add SEO Code <span className="text-red-500">*</span>
                </label>
                <TiptapEditor
                  value={formData.seo_code}
                  onChange={(html) =>
                    setFormData((prev) => ({ ...prev, seo_code: html }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleStatusChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 md:col-span-1 md:col-start-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-all hover:border-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || reduxLoading}
                  className={`px-6 py-1.5 rounded-md text-white text-sm flex items-center gap-2 transition-all ${
                    loading || reduxLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 hover:shadow-md"
                  }`}
                >
                  {(loading || reduxLoading) && (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  )}
                  {loading || reduxLoading
                    ? "Saving..."
                    : isEdit
                      ? "Update"
                      : "Save"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-5 bg-gray-50 py-3 border-b border-gray-200">
            <h3 className="text-base font-medium text-gray-800">
              SEO Code List
            </h3>
          </div>

          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-700">
                <tr>
                  <th className="px-6 py-3">S.No</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Files</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reduxLoading && (!seoCodeList || seoCodeList.length === 0) ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5 text-blue-500"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        <span>Loading data...</span>
                      </div>
                    </td>
                  </tr>
                ) : seoCodeList && seoCodeList.length > 0 ? (
                  seoCodeList.map((item, index) => (
                    <tr
                      key={item._id}
                      className="bg-white border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">{index + 1}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="flex flex-col gap-1">
                          {item.google_search_console && (
                            <span className="text-blue-600 flex items-center gap-1">
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                              </svg>
                              GSC File
                            </span>
                          )}
                          {item.report && (
                            <span className="text-blue-600 flex items-center gap-1">
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                              </svg>
                              Report
                            </span>
                          )}
                          {item.sitemap && (
                            <span className="text-blue-600 flex items-center gap-1">
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                              </svg>
                              Sitemap
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center gap-1"
                            type="button"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-red-600 hover:text-red-800 font-medium transition-colors flex items-center gap-1"
                            type="button"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No SEO Codes found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSEOCode;
