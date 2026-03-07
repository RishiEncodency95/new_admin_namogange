import React, { useState, useEffect } from "react";
import TiptapEditor from "../../components/TiptapEditor";
import { useDispatch, useSelector } from "react-redux";
import {
  createInitiative,
  getAllInitiatives,
  updateInitiative,
  deleteInitiative,
} from "../../redux/slices/initiativeSlice";
import { showSuccess, showError } from "../../utils/toastService";
import { fetchObjectives } from "../../redux/slices/objective/objectiveSlice";
import useRoleRights from "../../hooks/useRoleRights";
import { PageNames } from "../../utils/constants";

const Initiatives = () => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    _id: null,
    title: "",
    link: "",
    slug: "",
    image: null,
    imagePreview: "",
    image_alt: "",
    meta_keywords: "",
    meta_desc: "",
    desc: "",
    created_by: "",
    updated_by: "",
    objectiveCategory: "",
    status: "Active",
  });

  const [isEdit, setIsEdit] = useState(false);
  const authUser = JSON.parse(localStorage.getItem("user"));

  // redux logic
  const { initiatives, loading } = useSelector((state) => state.initiative);
  const { data: allObjectiveCategories } = useSelector(
    (state) => state.objectives,
  );
  const objectiveCategory = allObjectiveCategories?.filter(
    (cat) => cat.status === "Active",
  );
  console.log("initiatives..", initiatives);

  const { canWrite, canDelete, isFormDisabled } = useRoleRights(
    PageNames.INITIATIVES,
  );

  /* ===== FETCH DATA ===== */
  useEffect(() => {
    dispatch(getAllInitiatives());
    dispatch(fetchObjectives());
  }, [dispatch]);

  /* ===== PAGINATION STATE ===== */
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // utility to strip HTML and truncate for table display
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

  /* ===== HANDLERS ===== */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files?.[0]) {
      setFormData((prev) => ({
        ...prev,
        image: files[0],
        imagePreview: URL.createObjectURL(files[0]),
      }));
    } else if (name === "title") {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({ ...prev, title: value, slug: slug }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      _id: null,
      title: "",
      link: "",
      slug: "",
      image: null,
      imagePreview: "",
      image_alt: "",
      meta_keywords: "",
      meta_desc: "",
      desc: "",
      created_by: "",
      updated_by: "",
      objectiveCategory: "",
      status: "Active",
    });
    setIsEdit(false);
  };

  const handleCancel = () => {
    resetForm();
  };

  const handleDelete = (id) => {
    const currentUserId = authUser?.id || null;
    dispatch(deleteInitiative({ id: id, user_id: currentUserId })).then(() => {
      showSuccess("Initiative deleted successfully");
      dispatch(getAllInitiatives());
    });
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

    setIsSubmitting(true);

    const dataToSend = new FormData();
    dataToSend.append("title", formData.title);
    dataToSend.append("slug", formData.slug);
    dataToSend.append("link", formData.link);
    dataToSend.append("image_alt", formData.image_alt);
    dataToSend.append("status", formData.status);
    dataToSend.append("meta_keywords", formData.meta_keywords);
    dataToSend.append("meta_desc", formData.meta_desc);
    dataToSend.append("desc", formData.desc);
    dataToSend.append("objective_catagory", formData.objectiveCategory);
    console.log("formData", formData);

    if (formData.image instanceof File) {
      dataToSend.append("image", formData.image);
    }

    const currentUserId = authUser?.id || null;
    const currentUserName = authUser?.username || "";

    try {
      if (isEdit) {
        dataToSend.append("updated_by", currentUserName);
        dataToSend.append("user_id", currentUserId);
        await dispatch(
          updateInitiative({ id: formData._id, formData: dataToSend }),
        ).unwrap();
        showSuccess("Initiative updated successfully");
      } else {
        dataToSend.append("created_by", currentUserName);
        dataToSend.append("updated_by", currentUserName);
        dataToSend.append("user_id", currentUserId);
        await dispatch(createInitiative(dataToSend)).unwrap();
        showSuccess("Initiative added successfully");
      }

      await dispatch(getAllInitiatives()).unwrap();
      resetForm();
      setCurrentPage(1);
    } catch (err) {
      console.log(err);
      showError("Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ===== PAGINATION LOGIC ===== */
  const totalPages = Math.ceil(initiatives?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = initiatives?.slice(startIndex, endIndex);

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
                Initiatives Management
              </h2>
              <p className="text-sm text-blue-100">
                Add or update Initiatives content including title, link,
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
            {isEdit ? "Update Initiatives" : "Add New Initiatives"}
          </h3>

          <form
            onSubmit={handleSubmit}
            className={`grid grid-cols-1 md:grid-cols-4 gap-3 ${
              isFormDisabled ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {/* TITLE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initiatives Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter banner title"
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                required
                disabled={isFormDisabled}
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
                required
                disabled={isFormDisabled}
              />
            </div>
            {/* LINK */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="link"
                value={formData.link}
                onChange={handleChange}
                placeholder="Enter link"
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                required
                disabled={isFormDisabled}
              />
            </div>

            {/* IMAGE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image (Size: 120x120) <span className="text-red-500">*</span>
              </label>
              <input
                key={formData._id || "new"}
                type="file"
                name="image"
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
                accept="image/*"
                required={!isEdit}
              />
            </div>
            {/* IMAGE Alt Text*/}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image Alt
              </label>
              <input
                key={formData._id || "new"}
                type="text"
                name="image_alt"
                value={formData.image_alt}
                placeholder="Enter image alt text"
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
              />
            </div>
            {/* CATEGORY */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Objective Category
              </label>
              <select
                name="objectiveCategory"
                value={formData.objectiveCategory}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm"
                disabled={isFormDisabled}
              >
                <option value="">Select Category</option>
                {objectiveCategory?.map((cat) => (
                  <option key={cat._id} value={cat.title}>
                    {cat.title}
                  </option>
                ))}
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
            {/* META DESCRIPTION */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <textarea
                name="meta_desc"
                value={formData.meta_desc}
                onChange={handleChange}
                placeholder="Enter meta description"
                rows={1}
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
              />
            </div>

            {/* Desc  */}
            <div className="md:col-span-4">
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

            {/* ACTION BUTTONS */}
            <div className="md:col-span-3 flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting || isFormDisabled}
                className={`px-5 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 ${
                  isSubmitting || isFormDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : ""
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
                } ${
                  isSubmitting || isFormDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {isSubmitting
                  ? "Processing..."
                  : isEdit
                    ? "Update Initiatives"
                    : "Add Initiatives"}
              </button>
            </div>
          </form>
        </div>

        {/* ================= TABLE ================= */}
        <div className="relative overflow-x-auto bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-5 py-2 border-b bg-gray-200 border-gray-200">
            <h3 className="text-base font-medium text-gray-800">
              Initiatives List
            </h3>
          </div>

          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 border-b  border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium">S.No</th>
                <th className="px-4 py-3 font-medium">Initiatives Title</th>
                <th className="px-4 py-3 font-medium">Link</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Objective Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {(canWrite || canDelete) && (
                  <th className="px-4 py-3 font-medium">Action</th>
                )}
              </tr>
            </thead>

            <tbody>
              {loading && initiatives?.length === 0 ? (
                <tr>
                  <td
                    colSpan={canWrite || canDelete ? 8 : 7}
                    className="text-center py-4"
                  >
                    Loading...
                  </td>
                </tr>
              ) : (
                currentData?.map((item, index) => (
                  <tr
                    key={item._id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">{startIndex + index + 1}.</td>
                    <td className="px-4 py-3 font-medium">{item.title}</td>
                    <td className="px-4 py-3 text-blue-600 underline">
                      {item.link}
                    </td>
                    <td className="px-4 py-3">{getPlainText(item.desc, 50)}</td>
                    <td className="px-4 py-3">
                      <img
                        src={item.image || "/placeholder.png"}
                        alt="Initiative"
                        className="h-10 w-20 object-cover rounded border border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">{item.objective_catagory}</td>
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
                              className="relative text-sm text-green-600 transition
after:absolute after:left-0 after:-bottom-0.5
after:h-[1.5px] after:w-0 after:bg-green-600
after:transition-all after:duration-300
hover:after:w-full"
                              onClick={() => {
                                setFormData({
                                  _id: item._id,
                                  title: item.title,
                                  link: item.link,
                                  slug: item.slug,
                                  image: null,
                                  imagePreview: item.image,
                                  image_alt: item.image_alt,
                                  meta_keywords: item.meta_keywords,
                                  meta_desc: item.meta_desc,
                                  desc: item.desc,
                                  objectiveCategory: item.objective_catagory,
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
              Showing {startIndex + 1}–
              {Math.min(endIndex, initiatives?.length || 0)} of{" "}
              {initiatives?.length || 0}
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

export default Initiatives;
