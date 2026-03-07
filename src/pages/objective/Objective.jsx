import React, { useState, useEffect } from "react";
import TiptapEditor from "../../components/TiptapEditor";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchObjectives,
  createObjectiveThunk,
  updateObjectiveThunk,
  deleteObjectiveThunk,
} from "../../redux/slices/objective/objectiveSlice";
import { showSuccess, showError } from "../../utils/toastService";
import useRoleRights from "../../hooks/useRoleRights";
import { PageNames } from "../../utils/constants";

const Objective = () => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    _id: null,
    title: "",
    slug: "",
    image: null,
    imagePreview: "",
    logo: null,
    logoPreview: "",
    meta_keywords: "",
    meta_desc: "",
    desc: "",
    image_alt: "",
    logo_alt: "",
    created_by: "",
    updated_by: "",
    status: "Active",
  });

  // redux logic
  const { data, loading } = useSelector((state) => state.objectives);
  const [isEdit, setIsEdit] = useState(false);
  const authUser = JSON.parse(localStorage.getItem("user"));
  // const currentUserId = authUser?.id || null;
  // const currentUserName = authUser?.username || "";

  /* ===== PAGINATION STATE ===== */
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

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

  /* ===== FETCH DATA ===== */
  useEffect(() => {
    dispatch(fetchObjectives());
  }, [dispatch]);

  // Get permissions for the current user on "Objective" page
  const { canRead, canWrite, canDelete, isFormDisabled } = useRoleRights(
    PageNames.OBJECTIVE,
  );

  /* ===== HANDLERS ===== */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "title") {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({ ...prev, title: value, slug: slug }));
    } else if (files) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
        [`Preview`]: URL.createObjectURL(files[0]),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
    }
  };
  const resetForm = () => {
    setFormData({
      _id: null,
      title: "",
      slug: "",
      image: null,
      imagePreview: "",
      logo: null,
      logoPreview: "",
      meta_keywords: "",
      meta_desc: "",
      desc: "",
      image_alt: "",
      logo_alt: "",
      created_by: "",
      updated_by: "",
      status: "Active",
    });

    setIsEdit(false);
  };

  const handleCancel = () => {
    resetForm();
  };

  const handleDelete = (id) => {
    const currentUserId = authUser?.id || null;
    dispatch(deleteObjectiveThunk({ id: id, user_id: currentUserId })).then(
      () => {
        showSuccess("Objective deleted successfully ");
        dispatch(fetchObjectives());
      },
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      showError("Title is required.");
      return;
    }

    if (!formData.slug?.trim()) {
      showError("Slug is required.");
      return;
    }

    if (!formData.desc || formData.desc === "<p><br></p>") {
      showError("Description is required.");
      return;
    }

    if (!isEdit && (!formData.image || !formData.logo)) {
      showError("Image and Logo are required.");
      return;
    }

    setIsSubmitting(true);

    const dataToSend = new FormData();
    dataToSend.append("title", formData.title);
    dataToSend.append("slug", formData.slug);
    dataToSend.append("status", formData.status);
    dataToSend.append("meta_keywords", formData.meta_keywords);
    dataToSend.append("meta_desc", formData.meta_desc);
    dataToSend.append("desc", formData?.desc);

    if (formData.image instanceof File) {
      dataToSend.append("image", formData.image);
    }
    if (formData.logo instanceof File) {
      dataToSend.append("logo", formData.logo);
    }

    dataToSend.append("image_alt", formData.image_alt);
    dataToSend.append("logo_alt", formData.logo_alt);

    // const currentUserId = "66ec23d89309636c42738591";
    const currentUserId = authUser?.id || null;
    const currentUserName = authUser?.username || "";
    try {
      if (isEdit) {
        dataToSend.append("updated_by", currentUserName);
        dataToSend.append("user_id", currentUserId);

        await dispatch(
          updateObjectiveThunk({ id: formData._id, formData: dataToSend }),
        ).unwrap();

        showSuccess("Objective updated successfully");
      } else {
        dataToSend.append("created_by", currentUserName);
        dataToSend.append("updated_by", currentUserName);
        dataToSend.append("user_id", currentUserId);
        await dispatch(createObjectiveThunk(dataToSend)).unwrap();
        showSuccess("Objective added successfully");
      }

      await dispatch(fetchObjectives()).unwrap();
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
  const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

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
    <div className="">
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
                {" "}
                Objective Management
              </h2>
              <p className="text-sm text-blue-100">
                Add or update Objective content including title, slug,
                description and status.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-3 p-5">
        {/* ================= FORM ================= */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-base font-medium text-gray-800 mb-4">
            {isEdit ? "Update Objective" : "Add New Objective"}
          </h3>

          <form
            onSubmit={handleSubmit}
            className={`grid grid-cols-1 md:grid-cols-3 gap-3 ${isFormDisabled ? "opacity-60 pointer-events-none" : ""}`}
          >
            {/* TITLE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Objective Title (H1) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter objective title"
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
                required
              />
            </div>
            {/* SLUG */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="Enter slug"
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
                required
              />
            </div>

            {/* IMAGE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image (size:1440x250)
              </label>
              <input
                key={formData._id || "new"}
                type="file"
                name="image"
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
              />
              {formData.imagePreview && (
                <div className="mt-2">
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="h-20 w-auto object-cover rounded border border-gray-300"
                  />
                </div>
              )}
            </div>
            {/* IMAGE ALT TEXT  */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image Alt
              </label>
              <input
                type="text"
                name="image_alt"
                value={formData.image_alt}
                onChange={handleChange}
                placeholder="Enter image alt text"
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
                required
              />
            </div>

            {/* LOGO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo (size: 90x90)
              </label>
              <input
                key={formData._id || "new"}
                type="file"
                name="logo"
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
              />
              {formData.logoPreview && (
                <div className="mt-2">
                  <img
                    src={formData.logoPreview}
                    alt="Logo Preview"
                    className="h-20 w-auto object-cover rounded border border-gray-300"
                  />
                </div>
              )}
            </div>
            {/* LOGO ALT TEXT  */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo Alt
              </label>
              <input
                type="text"
                name="logo_alt"
                value={formData.logo_alt}
                onChange={handleChange}
                placeholder="Enter logo alt text"
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
                required
              />
            </div>

            {/* STATUS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
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
            {/* META KEYWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Keyword
              </label>
              <input
                type="text"
                name="meta_keywords"
                value={formData.meta_keywords}
                onChange={handleChange}
                placeholder="Enter meta keywords"
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
              />
            </div>

            {/* DESCRIPTION */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>

              <TiptapEditor
                value={formData.desc}
                onChange={(html) =>
                  setFormData((prev) => ({ ...prev, desc: html }))
                }
                isReadOnly={isFormDisabled}
              />
            </div>
            {/* META DESCRIPTION */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <textarea
                name="meta_desc"
                value={formData.meta_desc}
                onChange={handleChange}
                placeholder="Enter meta description"
                rows={2}
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
              />
            </div>

            {/* ACTION BUTTONS */}
            <div className="md:col-span-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
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
                    ? "Update Objective"
                    : "Add Objective"}{" "}
              </button>
            </div>
          </form>
        </div>

        {/* ================= TABLE ================= */}
        <div className="relative overflow-x-auto bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-5 py-2 border-b bg-gray-200 border-gray-200">
            <h3 className="text-base font-medium text-gray-800">
              Objective List
            </h3>
          </div>

          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 border-b  border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium">S.No</th>
                <th className="px-4 py-3 font-medium">Objective Title</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Logo</th>
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {(canWrite || canDelete) && (
                  <th className="px-4 py-3 font-medium">Action</th>
                )}
              </tr>
            </thead>

            <tbody>
              {loading && data?.length === 0 ? (
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
                    <td className="px-4 py-3 font-medium">{item.title}</td>
                    <td className="px-4 py-3 text-gray-500">{item.slug}</td>
                    <td className="px-4 py-3">{getPlainText(item.desc, 50)}</td>
                    <td className="px-4 py-3">
                      <img
                        src={item.logo || "/placeholder.png"}
                        alt={item.logo_alt || "Objective Logo"}
                        className="h-10 w-20 object-cover rounded border border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <img
                        src={item.image || "/placeholder.png"}
                        alt={item.image_alt || "Objective"}
                        className="h-10 w-20 object-cover rounded border border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-medium
          ${
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
                              className="relative text-sm text-green-600 transition
after:absolute after:left-0 after:-bottom-0.5
after:h-[1.5px] after:w-0 after:bg-green-600
after:transition-all after:duration-300
hover:after:w-full"
                              onClick={() => {
                                setFormData({
                                  _id: item._id,
                                  title: item.title,
                                  slug: item.slug,
                                  image: item.image,
                                  imagePreview: item.image,
                                  logo: item.logo,
                                  logoPreview: item.logo,
                                  meta_keywords: item.meta_keywords,
                                  meta_desc: item.meta_desc,
                                  desc: item.desc,
                                  image_alt: item.image_alt || "",
                                  logo_alt: item.logo_alt || "",
                                  created_by: item.created_by,
                                  updated_by: item.updated_by,
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
                              className="relative text-sm text-red-600 transition
after:absolute after:left-0 after:-bottom-0.5
after:h-[1.5px] after:w-0 after:bg-red-600
after:transition-all after:duration-300
hover:after:w-full"
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
              Showing {startIndex + 1}–{Math.min(endIndex, data.length)} of{" "}
              {data?.length || 0}
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

export default Objective;
