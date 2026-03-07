import React, { useState, useEffect } from "react";
import TiptapEditor from "../../components/TiptapEditor";
import { useDispatch, useSelector } from "react-redux";
import {
  createFaq,
  getAllFaqs,
  updateFaq,
  deleteFaq,
  toggleFaqStatus,
} from "../../redux/slices/faq/faqSlice";
import { showSuccess, showError } from "../../utils/toastService";
import adminBanner from "../../assets/banners/bg.jpg";
import useRoleRights from "../../hooks/useRoleRights";
import { PageNames } from "../../utils/constants";

const Faq = () => {
  const dispatch = useDispatch();
  const { faqs, loading } = useSelector((state) => state.faq);
  const authUser = JSON.parse(localStorage.getItem("user"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState({
    _id: null,
    question: "",
    answer: "",
    category: "General", // Default category
    status: "Active",
  });

  const { canWrite, canDelete, isFormDisabled } = useRoleRights(PageNames.FAQ);

  useEffect(() => {
    dispatch(getAllFaqs());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const resetForm = () => {
    setFormData({
      _id: null,
      question: "",
      answer: "",
      category: "General",
      status: "Active",
    });
    setIsEdit(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.question.trim() ||
      !formData.answer.trim() ||
      formData.answer === "<p><br></p>"
    ) {
      showError("Question and Answer are required.");
      return;
    }
    setIsSubmitting(true);
    const dataToSend = { ...formData, user_id: authUser?.id };

    try {
      if (isEdit) {
        await dispatch(
          updateFaq({ id: formData._id, data: dataToSend }),
        ).unwrap();
        showSuccess("FAQ updated successfully");
      } else {
        await dispatch(createFaq(dataToSend)).unwrap();
        showSuccess("FAQ created successfully");
      }
      resetForm();
    } catch (err) {
      showError("An error occurred.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (faq) => {
    setFormData({
      _id: faq._id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      status: faq.status,
    });
    setIsEdit(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this FAQ?")) {
      dispatch(deleteFaq({ id, user_id: authUser?.id })).then(() => {
        showSuccess("FAQ deleted successfully");
      });
    }
  };

  const handleToggleStatus = (id) => {
    dispatch(toggleFaqStatus({ id, user_id: authUser?.id })).then(() => {
      showSuccess("FAQ status toggled successfully");
    });
  };

  // Pagination logic
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil((faqs?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = faqs?.slice(startIndex, endIndex) || [];

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 3;
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 2) pages.push("...");
      if (currentPage > 1 && currentPage < totalPages) pages.push(currentPage);
      if (currentPage < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="">
      <div
        className="relative overflow-hidden shadow-sm border border-gray-200 h-25 
bg-gradient-to-r from-orange-400 via-cyan-400 to-blue-300"
      >
        <div className="absolute inset-0 bg-white/10"></div>
        <div className="relative flex justify-center items-center px-6 py-4 h-25">
          <div className="flex flex-col text-center">
            <h2 className="text-xl font-semibold text-gray-700 text-center">
              FAQ Management
            </h2>
            <p className="text-sm text-blue-100">
              Add or update Frequently Asked Questions.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-5">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-base font-medium text-gray-800 mb-2">
            {isEdit ? "Update FAQ" : "Add New FAQ"}
          </h3>
          <form
            onSubmit={handleSubmit}
            className={`grid grid-cols-1 gap-6 ${isFormDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question
              </label>
              <textarea
                name="question"
                value={formData.question}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                required
                disabled={isFormDisabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Answer
              </label>
              <TiptapEditor
                value={formData.answer}
                onChange={(html) =>
                  setFormData((prev) => ({ ...prev, answer: html }))
                }
                isReadOnly={isFormDisabled}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={isFormDisabled}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none"
                  disabled={isFormDisabled}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end mt-6 gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting || isFormDisabled}
                  className={`px-5 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 ${isSubmitting || isFormDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isFormDisabled}
                  className={`px-6 py-1 text-sm rounded text-white ${isEdit ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"} ${isSubmitting || isFormDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isSubmitting
                    ? "Processing..."
                    : isEdit
                      ? "Update FAQ"
                      : "Add FAQ"}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="relative overflow-x-auto bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-5 py-2 border-b bg-gray-200 border-gray-200">
            <h3 className="text-base font-medium text-gray-800">FAQ List</h3>
          </div>
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium">S.No</th>
                <th className="px-4 py-3 font-medium">Question</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {(canWrite || canDelete) && (
                  <th className="px-4 py-3 font-medium">Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading && faqs?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : (
                currentData.map((faq, index) => (
                  <tr
                    key={faq._id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">{startIndex + index + 1}.</td>
                    <td className="px-4 py-3 font-medium">{faq.question}</td>
                    <td className="px-4 py-3">{faq.category}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStatus(faq._id)}
                        disabled={!canWrite}
                      >
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-medium ${faq.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {faq.status}
                        </span>
                      </button>
                    </td>
                    {(canWrite || canDelete) && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-4">
                          {canWrite && (
                            <button
                              onClick={() => handleEdit(faq)}
                              className="text-green-600"
                            >
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(faq._id)}
                              className="text-red-600"
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
          <div className="flex justify-between items-center p-4">
            <span className="text-sm text-gray-500">
              Showing {startIndex + 1}–{Math.min(endIndex, faqs?.length || 0)}{" "}
              of {faqs?.length || 0}
            </span>
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 h-8 text-gray-600 border border-gray-300 rounded-l-lg"
              >
                Prev
              </button>
              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={i} className="px-3 h-8 border">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`px-3 h-8 border ${currentPage === p ? "bg-blue-50 text-blue-600" : ""}`}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 h-8 text-gray-600 border border-gray-300 rounded-r-lg"
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

export default Faq;
