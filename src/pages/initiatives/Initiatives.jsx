import React, { useState, useEffect, useRef } from "react";
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
    pages_images: [],
    pagesImagesPreviews: [], // [{ url, alt, isNew }]
    desc: "",
    page_description: "",
    created_by: "",
    updated_by: "",
    objectiveCategory: "",
    status: "Active",
  });

  const [isEdit, setIsEdit] = useState(false);
  const fileInputRef = useRef(null);
  const authUser = JSON.parse(sessionStorage.getItem("user"));

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
      const file = files[0];
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        showError("Image size must be less than 10MB");
        e.target.value = "";
        setFormData((prev) => ({ ...prev, image: null, imagePreview: "" }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        image: files[0],
        imagePreview: URL.createObjectURL(files[0]),
      }));
    } else if (name === "pages_images" && files) {
      const selectedFiles = Array.from(files);
      const maxSize = 10 * 1024 * 1024;
      const currentCount = formData.pagesImagesPreviews.length;
      if (currentCount + selectedFiles.length > 4) {
        showError("You can only upload a maximum of 4 page images.");
        return;
      }
      const validFiles = [];
      const newPreviews = [];
      selectedFiles.forEach((file) => {
        if (file.size <= maxSize) {
          validFiles.push(file);
          newPreviews.push({
            url: URL.createObjectURL(file),
            alt: formData.image_alt || "",
            isNew: true,
          });
        }
      });
      setFormData((prev) => ({
        ...prev,
        pages_images: [...prev.pages_images, ...validFiles],
        pagesImagesPreviews: [...prev.pagesImagesPreviews, ...newPreviews],
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

  const handleUpdatePageImageAlt = (index, newAlt) => {
    const updated = [...formData.pagesImagesPreviews];
    updated[index] = { ...updated[index], alt: newAlt };
    setFormData((prev) => ({ ...prev, pagesImagesPreviews: updated }));
  };

  const handleRemovePageImage = (index) => {
    const imageToRemove = formData.pagesImagesPreviews[index];
    const updatedPreviews = formData.pagesImagesPreviews.filter((_, i) => i !== index);
    let updatedFiles = [...formData.pages_images];
    if (imageToRemove.isNew) {
      const newFilesIndex = formData.pagesImagesPreviews.slice(0, index).filter(p => p.isNew).length;
      updatedFiles = formData.pages_images.filter((_, i) => i !== newFilesIndex);
    }
    setFormData((prev) => ({ ...prev, pagesImagesPreviews: updatedPreviews, pages_images: updatedFiles }));
  };

  const resetForm = () => {
    setFormData({
      _id: null,
      title: "",
      link: "",
      slug: "",
      image: null,
      imagePreview: "", // Clear image preview
      image_alt: "",
      pages_images: [],
      pagesImagesPreviews: [],
      desc: "",
      page_description: "",
      created_by: "",
      updated_by: "",
      objectiveCategory: "",
      status: "Active",
    });
    setIsEdit(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
    dataToSend.append("desc", formData.desc);
    dataToSend.append("page_description", formData.page_description);
    dataToSend.append("objective_catagory", formData.objectiveCategory);

    if (formData.image instanceof File) {
      dataToSend.append("image", formData.image);
    }

    // Supplemental Images
    const newSupplementalAlts = [];
    formData.pagesImagesPreviews.forEach((preview) => {
      if (preview.isNew) {
        newSupplementalAlts.push(preview.alt);
      }
    });
    dataToSend.append("new_pages_images_alts", JSON.stringify(newSupplementalAlts));

    if (formData.pages_images && formData.pages_images.length > 0) {
      formData.pages_images.forEach((file) => {
        dataToSend.append("pages_images", file);
      });
    }

    const currentUserId = authUser?.id || null;
    const currentUserName = authUser?.username || "";

    try {
      if (isEdit) {
        // Handle existing images for update
        const existingToKeep = formData.pagesImagesPreviews
          .filter((p) => !p.isNew)
          .map((p) => ({ url: p.url, alt: p.alt }));
        dataToSend.append("existing_pages_images", JSON.stringify(existingToKeep));

        dataToSend.append("updated_by", currentUserName);
        dataToSend.append("user_id", currentUserId);
        await dispatch(
          updateInitiative({ id: formData._id, formData: dataToSend }),
        ).unwrap();
        showSuccess("Initiative updated successfully");
      } else {
        // Initial creation alts
        dataToSend.append("pages_images_alts", JSON.stringify(newSupplementalAlts));
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
            className={`grid grid-cols-1 md:grid-cols-4 gap-3 ${isFormDisabled ? "opacity-60 cursor-not-allowed" : ""
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
                Link
              </label>
              <input
                type="text"
                name="link"
                value={formData.link}
                onChange={handleChange}
                placeholder="Enter link"
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
              />
            </div>

            {/* IMAGE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image (Size: 120x120) <span className="text-red-500">*</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                name="image"
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
                accept="image/*"
                required={!isEdit}
              />
              {/* Image Preview Section */}
              {formData.imagePreview && (
                <div className="mt-3 p-1 border rounded bg-gray-50 inline-block shadow-sm">
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="h-24 w-auto object-cover rounded"
                  />
                </div>
              )}
            </div>
            {/* IMAGE Alt Text*/}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image Alt
              </label>
              <input
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
            {/* Bulk Images */}
            <div className="md:col-span-4 mt-4">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-tight mb-2 ml-1">
                Page Images (Max 4 Images)
              </label>
              <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-blue-50/30 transition-colors duration-300">
                <input
                  type="file"
                  name="pages_images"
                  multiple
                  onChange={handleChange}
                  disabled={isFormDisabled || formData.pagesImagesPreviews.length >= 4}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer disabled:opacity-50"
                  accept="image/*"
                />
              </div>

              {formData.pagesImagesPreviews.length > 0 && (
                <div className="mt-6 p-6 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-x-auto custom-scrollbar">
                  <div className="flex gap-6 pb-2 min-w-max">
                    {formData.pagesImagesPreviews.map((p, i) => (
                      <div key={i} className="group relative flex flex-col gap-3 animate-fadeIn w-40 shrink-0">
                        <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-100 shadow-md transform transition-transform duration-300 group-hover:scale-[1.02]">
                          <img src={p.url} className="w-full h-full object-cover" alt="preview" />
                          <button
                            type="button"
                            onClick={() => handleRemovePageImage(i)}
                            className="absolute inset-0 bg-red-600/80 text-white text-[10px] font-black opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-[2px]"
                          >
                            REMOVE PHOTO
                          </button>
                        </div>
                        <input
                          type="text"
                          value={p.alt}
                          onChange={(e) => handleUpdatePageImageAlt(i, e.target.value)}
                          placeholder="Add Alt Text..."
                          className="w-full text-xs border border-gray-200 rounded-lg py-2 px-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-300 shadow-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Desc  */}
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Description
              </label>
              <TiptapEditor
                value={formData.desc}
                onChange={(html) =>
                  setFormData((prev) => ({ ...prev, desc: html }))
                }
                isReadOnly={isFormDisabled}
              />
            </div>

            {/* Page Description  */}
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Page Detailed Description
              </label>
              <TiptapEditor
                value={formData.page_description}
                onChange={(html) =>
                  setFormData((prev) => ({ ...prev, page_description: html }))
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
                className={`px-5 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 ${isSubmitting || isFormDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : ""
                  }`}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isFormDisabled}
                className={`px-6 py-1 text-sm rounded text-white ${isEdit
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-green-600 hover:bg-green-700"
                  } ${isSubmitting || isFormDisabled
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
                        className={`px-3 py-1 text-xs rounded-full font-medium ${item.status === "Active"
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

                                  desc: item.desc,
                                  page_description: item.page_description || "",
                                  pages_images: [],
                                  pagesImagesPreviews: (item.pages_images || []).map((img) => ({
                                    url: img.url,
                                    alt: img.alt,
                                    isNew: false,
                                  })),
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
                    className={`px-3 h-8 border border-gray-300 hover:bg-gray-50 ${currentPage === p
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
