import React, { useState, useEffect } from "react";
import TiptapEditor from "../../components/TiptapEditor";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAbouts,
  createAboutThunk,
  updateAboutThunk,
  deleteAboutThunk,
} from "../../redux/slices/about_us/aboutSlice";
import { showSuccess, showError } from "../../utils/toastService";
import useRoleRights from "../../hooks/useRoleRights";
import { PageNames } from "../../utils/constants";

const About = () => {
  const dispatch = useDispatch();
  // Assuming your slice is named 'about' and the data array is 'abouts' or 'data'
  // Adjust 'state.about' and 'abouts' based on your actual slice structure
  const { data: abouts, loading } = useSelector((state) => state.about);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const authUser = JSON.parse(localStorage.getItem("user"));

  const [form, setForm] = useState({
    _id: null,
    title: "",
    desc: "",
    image: null,
    imagePreview: "",
    image_alt: "",
    link: "",
    status: "Active",
  });

  // Pagination
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Role Rights - Using "About" as the page name, adjust if you have a constant for it
  const { canRead, canWrite, canDelete, isFormDisabled } = useRoleRights(
    PageNames.ABOUT_US,
  );

  useEffect(() => {
    dispatch(fetchAbouts());
  }, [dispatch]);

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
      desc: "",
      image: null,
      imagePreview: "",
      image_alt: "",
      link: "",
      status: "Active",
    });
    setIsEdit(false);
  };

  const handleDelete = (id) => {
    const currentUserId = authUser?.id || null;
    if (window.confirm("Are you sure you want to delete this item?")) {
      dispatch(deleteAboutThunk({ id: id, user_id: currentUserId })).then(
        () => {
          showSuccess("About entry deleted successfully");
          dispatch(fetchAbouts());
        },
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      showError("Title is required.");
      return;
    }
    if (!form.desc || form.desc === "<p><br></p>" || form.desc === "<p></p>") {
      showError("Description is required.");
      return;
    }
    if (!isEdit && !form.image) {
      showError("Image is required.");
      return;
    }

    setIsSubmitting(true);
    const dataToSend = new FormData();
    dataToSend.append("title", form.title);
    dataToSend.append("desc", form.desc);
    dataToSend.append("image_alt", form.image_alt);
    dataToSend.append("link", form.link);
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
          updateAboutThunk({ id: form._id, formData: dataToSend }),
        ).unwrap();
        showSuccess("About entry updated successfully");
      } else {
        dataToSend.append("created_by", currentUserName);
        dataToSend.append("updated_by", currentUserName);
        dataToSend.append("user_id", currentUserId);
        await dispatch(createAboutThunk(dataToSend)).unwrap();
        showSuccess("About entry added successfully");
      }
      await dispatch(fetchAbouts()).unwrap();
      resetForm();
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      showError("Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
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

  /* ===== PAGINATION LOGIC ===== */
  const totalPages = Math.ceil((abouts?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = abouts?.slice(startIndex, endIndex) || [];

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
                About Us Management
              </h2>
              <p className="text-sm text-blue-100">
                Add or update About Us content including title, description, and
                images.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-5">
        {/* ================= FORM ================= */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-medium text-gray-800 mb-2">
            {isEdit ? "Update About Entry" : "Add New About Entry"}
          </h3>

          <form
            onSubmit={handleSubmit}
            className={`grid grid-cols-1 md:grid-cols-3 gap-3 ${
              isFormDisabled ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {/* TITLE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title (H1) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                placeholder="Enter title"
                value={form.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
                required
              />
            </div>

            {/* LINK */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link
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
                Image (size:652x340) <span className="text-red-500">*</span>
              </label>
              <div className="w-full">
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  disabled={isFormDisabled}
                  className="w-full text-sm text-gray-600 border border-gray-300 rounded cursor-pointer bg-gray-50 file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                />
              </div>
              {/* {form.imagePreview && (
                <div className="mt-2">
                  <img
                    src={form.imagePreview}
                    alt="Preview"
                    className="h-20 w-auto object-cover rounded border border-gray-300"
                  />
                </div>
              )} */}
            </div>

            {/* IMAGE ALT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image Alt Text
              </label>
              <input
                type="text"
                name="image_alt"
                placeholder="Enter image alt text"
                value={form.image_alt}
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
            {/* DESCRIPTION */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <TiptapEditor
                value={form.desc}
                onChange={(html) =>
                  setForm((prev) => ({ ...prev, desc: html }))
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
            <h3 className="text-base font-medium text-gray-800">About List</h3>
          </div>

          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium">S.No</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {(canWrite || canDelete) && (
                  <th className="px-4 py-3 font-medium">Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading && (!abouts || abouts.length === 0) ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
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
                    <td className="px-4 py-3 font-medium">{item.title}</td>
                    <td className="px-4 py-3">
                      <img
                        src={item.image || "/placeholder.png"}
                        alt={item.image_alt || "About"}
                        className="h-10 w-14 object-cover rounded border border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">{getPlainText(item.desc, 50)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-medium ${
                          item.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    {(canWrite || canDelete) && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-4">
                          {canWrite && (
                            <button
                              className="text-sm text-green-600 hover:underline"
                              onClick={() => {
                                setForm({
                                  _id: item._id,
                                  title: item.title,
                                  desc: item.desc,
                                  image: null,
                                  imagePreview: item.image,
                                  image_alt: item.image_alt || "",
                                  link: item.link || "",
                                  status: item.status,
                                });
                                setIsEdit(true);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
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
              Showing {startIndex + 1}–{Math.min(endIndex, abouts?.length || 0)}{" "}
              of {abouts?.length || 0}
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

export default About;
