import React, { useState, useEffect, useCallback } from "react";
import TiptapEditor from "../../components/TiptapEditor";
import { useDispatch, useSelector } from "react-redux";
import useRoleRights from "../../hooks/useRoleRights";
import { PageNames } from "../../utils/constants";
import {
  createHero,
  getAllHeroes,
  updateHero,
  deleteHero,
} from "../../redux/slices/hero/heroSlice";
import { showSuccess, showError } from "../../utils/toastService";

const Hero = () => {
  const dispatch = useDispatch();
  const { heroes, loading } = useSelector((state) => state.hero);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const authUser = JSON.parse(localStorage.getItem("user"));

  const [form, setForm] = useState({
    _id: null,
    title: "",
    tag_line: "",
    description: "",
    link: "",
    image: null,
    imagePreview: "",
    alt_text: "",
    status: "Active",
  });

  // ✅ FIXED: Simple function to get plain text with line breaks
  const getPlainTextWithLineBreaks = (html, maxLength = 50) => {
    if (!html) return "";

    // Create temporary div
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Get text content (this automatically converts <p> and <br> to line breaks)
    let text = tempDiv.textContent || tempDiv.innerText || "";

    // Clean up extra spaces and line breaks
    text = text.replace(/\s+/g, " ").trim();

    // Truncate
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + "...";
    }

    return text;
  };

  const getPlainText = (html, maxLength = 50) => {
    if (!html) return "";

    const div = document.createElement("div");
    div.innerHTML = html;

    let text = div.textContent || "";

    if (text.length > maxLength) {
      text = text.slice(0, maxLength) + "...";
    }

    return text;
  };

  // Pagination
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(getAllHeroes());
  }, [dispatch]);

  const { canRead, canWrite, canDelete, isFormDisabled } = useRoleRights(
    PageNames.HERO_SECTION,
  );

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files?.[0]) {
      setForm((prev) => ({
        ...prev,
        image: files[0],
        imagePreview: URL.createObjectURL(files[0]),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setForm({
      _id: null,
      title: "",
      tag_line: "",
      description: "",
      link: "",
      image: null,
      imagePreview: "",
      alt_text: "",
      status: "Active",
    });
    setIsEdit(false);
  };

  const handleDelete = (id) => {
    const currentUserId = authUser?.id || null;
    dispatch(deleteHero({ id: id, user_id: currentUserId })).then(() => {
      showSuccess("Hero deleted successfully");
      dispatch(getAllHeroes());
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      showError("Title is required.");
      return;
    }
    if (!form.tag_line?.trim()) {
      showError("Tag Line is required.");
      return;
    }
    if (!isEdit && !form.image) {
      showError("Hero Image is required.");
      return;
    }

    setIsSubmitting(true);
    const dataToSend = new FormData();
    dataToSend.append("title", form.title);
    dataToSend.append("tag_line", form.tag_line);
    dataToSend.append("description", form.description);
    dataToSend.append("link", form.link);
    dataToSend.append("alt_text", form.alt_text);
    dataToSend.append("status", form.status);
    if (form.image instanceof File) {
      dataToSend.append("image", form.image);
    }

    const currentUserId = authUser?.id || null;
    const currentUserName = authUser?.username || "";

    try {
      if (isEdit) {
        dataToSend.append("updated_by", currentUserName);
        dataToSend.append("user_id", currentUserId);
        await dispatch(
          updateHero({ id: form._id, formData: dataToSend }),
        ).unwrap();
        showSuccess("Hero updated successfully");
      } else {
        dataToSend.append("created_by", currentUserName);
        dataToSend.append("updated_by", currentUserName);
        dataToSend.append("user_id", currentUserId);
        await dispatch(createHero(dataToSend)).unwrap();
        showSuccess("Hero added successfully");
      }
      await dispatch(getAllHeroes()).unwrap();
      resetForm();
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      showError("Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ===== PAGINATION LOGIC ===== */
  const totalPages = Math.ceil((heroes?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = heroes?.slice(startIndex, endIndex) || [];

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 3;

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      for (let i = 1; i <= maxVisible; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  // Handle edit
  const handleEdit = useCallback((item) => {
    setForm({
      _id: item._id,
      title: item.title,
      tag_line: item.tag_line,
      description: item.description,
      link: item.link,
      alt_text: item.alt_text,
      status: item.status,
      image: null,
      imagePreview: item.image,
    });
    setIsEdit(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div>
      {/* ================= HEADER ================= */}
      <div
        className="relative overflow-hidden shadow-sm border border-gray-200 h-25 
bg-gradient-to-r from-orange-400 via-cyan-400 to-blue-300"
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-white/10"></div>

        {/* Content */}
        <div className="relative flex justify-center items-center px-6 py-4 h-25">
          <div className="flex items-center gap-4">
            <div className="flex flex-col text-center">
              <h2 className="text-xl font-semibold text-gray-700 text-center">
                Hero Management
              </h2>
              <p className="text-sm text-blue-100">
                Add or update Hero content including reporting details.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-5">
        {/* ================= FORM ================= */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-medium text-gray-800 mb-2">
            {isEdit ? "Update Hero" : "Add New Hero"}
          </h3>

          <form
            onSubmit={handleSubmit}
            className={`grid grid-cols-1 md:grid-cols-3 gap-3 ${isFormDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title (H1) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                placeholder="Enter hero title"
                value={form.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tag Line <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tag_line"
                placeholder="Enter tag line"
                value={form.tag_line}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Redirect Link
              </label>
              <input
                type="text"
                name="link"
                placeholder="Enter link (optional)"
                value={form.link}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
              />
            </div>
            {/* IMAGE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hero Image <span>(size: 648x400)</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="w-full">
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  disabled={isFormDisabled}
                  className=" w-full text-sm  text-gray-600 border border-gray-300 rounded cursor-pointer  bg-gray-50
      file:mr-4 
      file:py-1 
      file:px-4
      file:rounded
      file:border-0
      file:text-sm
      file:font-semibold
      file:bg-blue-50
      file:text-blue-700
      hover:file:bg-blue-100
      disabled:opacity-50
    "
                />
              </div>
            </div>
            {/* ALT TEXT  */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image Alt
              </label>
              <input
                type="text"
                name="alt_text"
                placeholder="Enter image alt text (optional)"
                value={form.alt_text}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
              />
            </div>
            {/* STATUS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none"
                disabled={isFormDisabled}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 py-2 px-3 bg-gray-50 border-b">
                Description <span className="text-red-500">*</span>
              </label>
              <TiptapEditor
                value={form.description}
                onChange={(html) =>
                  setForm((prev) => ({ ...prev, description: html }))
                }
                isReadOnly={isFormDisabled}
              />
            </div>

            {/* ACTION BUTTONS */}
            <div className="md:col-span-3 flex justify-end gap-5 mt-6">
              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting || isFormDisabled}
                className={`px-5 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isFormDisabled}
                className={`px-6 py-1 text-sm rounded text-white ${
                  isEdit
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-green-600 hover:bg-green-700"
                } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isSubmitting
                  ? "Processing..."
                  : isEdit
                    ? "Update"
                    : "Add"}{" "}
              </button>
            </div>
          </form>
        </div>
        {/* ================= TABLE ================= */}
        <div className="relative overflow-x-auto bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-5 py-2 border-b bg-gray-200 border-gray-200">
            <h3 className="text-base font-medium text-gray-800">Hero List</h3>
          </div>

          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 border-b  border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium">S.No</th>
                <th className="px-4 py-3 font-medium">Hero Title</th>
                <th className="px-4 py-3 font-medium">Redirect Link</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Hero Image
                </th>{" "}
                <th className="px-4 py-3 font-medium">Image Alt</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {(canWrite || canDelete) && (
                  <th className="px-4 py-3 font-medium">Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading && heroes?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : (
                currentData.map((item, index) => (
                  <tr
                    key={item._id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">{startIndex + index + 1}.</td>
                    <td className="px-4 py-3 font-medium">{item?.title}</td>
                    <td className="px-4 py-3 text-blue-600 underline">
                      {item?.link}
                    </td>
                    {/* ✅ FIXED: Description cell with proper text */}
                    {getPlainText(item?.description, 50)}
                    <td className="px-4 py-3">
                      <img
                        src={item?.image || "/placeholder.png"}
                        alt={item?.alt_text || "Hero"}
                        className="h-10 w-14 object-fit rounded border border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">{item?.alt_text}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-medium
          ${
            item.status === "Active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
                      >
                        {item?.status}
                      </span>
                    </td>
                    {(canWrite || canDelete) && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-6">
                          {canWrite && (
                            <button
                              className="text-sm text-green-600 hover:underline"
                              onClick={() => handleEdit(item)}
                            >
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              className="text-sm text-red-600 hover:underline"
                              onClick={() => handleDelete(item._id)}
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

          {/* ================= PAGINATION ================= */}
          <div className="flex justify-between items-center p-4">
            <span className="text-sm text-gray-500">
              Showing {startIndex + 1}–{Math.min(endIndex, heroes?.length || 0)}{" "}
              of {heroes?.length || 0}
            </span>

            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 h-8 text-gray-600 border border-gray-300 hover:bg-gray-50 rounded-l-lg"
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
                    className={`px-3 h-8 border border-gray-300 hover:bg-gray-50 ${
                      currentPage === p
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : ""
                    }`}
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
                className="px-3 h-8 text-gray-600 border border-gray-300 hover:bg-gray-50 rounded-r-lg"
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

export default Hero;
