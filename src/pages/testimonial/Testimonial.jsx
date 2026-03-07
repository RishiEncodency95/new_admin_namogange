import React, { useState, useEffect } from "react";
import TiptapEditor from "../../components/TiptapEditor";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTestimonials,
  createTestimonialThunk,
  updateTestimonialThunk,
  deleteTestimonialThunk,
} from "../../redux/slices/testimonial/testimonialSlice";
import { showSuccess, showError } from "../../utils/toastService";
import useRoleRights from "../../hooks/useRoleRights";
import { PageNames } from "../../utils/constants";

const Testimonial = () => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    _id: null,
    name: "",
    image: null,
    imagePreview: "",
    image_alt: "",
    desc: "",
    created_by: "",
    updated_by: "",
    status: "Active",
  });

  // redux logic
  const { data, loading } = useSelector((state) => state.testimonials);
  const [isEdit, setIsEdit] = useState(false);
  const authUser = JSON.parse(localStorage.getItem("user"));

  /* ===== PAGINATION STATE ===== */
  const itemsPerPage = 5;
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
    dispatch(fetchTestimonials());
  }, [dispatch]);
  const { canRead, canWrite, canDelete, isFormDisabled } = useRoleRights(
    PageNames.TESTIMONIAL,
  );
  /* ===== HANDLERS ===== */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files[0]) {
      setFormData({
        ...formData,
        image: files[0],
        imagePreview: URL.createObjectURL(files[0]),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  const resetForm = () => {
    setFormData({
      _id: null,
      name: "",
      image: null,
      imagePreview: "",
      image_alt: "",
      desc: "",
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
    dispatch(deleteTestimonialThunk({ id: id, user_id: currentUserId })).then(
      () => {
        showSuccess("Testimonial deleted successfully ");
        dispatch(fetchTestimonials());
      },
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      showError("Name is required.");
      return;
    }

    if (
      !formData.desc ||
      formData.desc === "<p><br></p>" ||
      formData.desc === "<p></p>"
    ) {
      showError("Description is required.");
      return;
    }

    if (!isEdit && !formData.image) {
      showError("Image is required.");
      return;
    }

    setIsSubmitting(true);

    const dataToSend = new FormData();
    dataToSend.append("name", formData.name);
    dataToSend.append("status", formData.status);
    dataToSend.append("desc", formData.desc);
    dataToSend.append("image_alt", formData.image_alt);

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
          updateTestimonialThunk({ id: formData._id, formData: dataToSend }),
        ).unwrap();

        showSuccess("Testimonial updated successfully");
      } else {
        dataToSend.append("created_by", currentUserName);
        dataToSend.append("updated_by", currentUserName);
        dataToSend.append("user_id", currentUserId);
        await dispatch(createTestimonialThunk(dataToSend)).unwrap();
        showSuccess("Testimonial added successfully");
      }

      await dispatch(fetchTestimonials()).unwrap();
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
  const currentData = data?.slice(startIndex, endIndex);

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
                Testimonial Management
              </h2>
              <p className="text-sm text-blue-100">
                Add or update Testimonial content including name, image,
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
            {isEdit ? "Update Testimonial" : "Add New Testimonial"}
          </h3>

          <form
            onSubmit={handleSubmit}
            className={`grid grid-cols-1 md:grid-cols-4 gap-3 ${isFormDisabled ? "opacity-60 pointer-events-none" : ""}`}
          >
            {/* NAME */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter name"
                disabled={isFormDisabled}
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            {/* IMAGE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image (Size: 219x224) <span className="text-red-500">*</span>
              </label>
              <input
                key={formData._id || "new"}
                type="file"
                name="image"
                onChange={handleChange}
                disabled={isFormDisabled}
                required={!isEdit}
                accept="image/*"
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
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

            {/* IMAGE ALT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image Alt
              </label>
              <input
                type="text"
                name="image_alt"
                value={formData.image_alt}
                onChange={handleChange}
                placeholder="Enter image alt"
                disabled={isFormDisabled}
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
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
                disabled={isFormDisabled}
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* DESCRIPTION */}
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

            {/* ACTION BUTTONS */}
            <div className="md:col-span-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting || isFormDisabled}
                className={`px-5 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""} ${isFormDisabled ? "opacity-60 pointer-events-none" : ""}`}
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
                } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""} ${isFormDisabled ? "opacity-60 pointer-events-none" : ""}`}
              >
                {isSubmitting
                  ? "Processing..."
                  : isEdit
                    ? "Update Testimonial"
                    : "Add Testimonial"}{" "}
              </button>
            </div>
          </form>
        </div>

        {/* ================= TABLE ================= */}
        <div className="relative overflow-x-auto bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-5 py-2 border-b bg-gray-200 border-gray-200">
            <h3 className="text-base font-medium text-gray-800">
              Testimonial List
            </h3>
          </div>

          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 border-b  border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium">S.No</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Description</th>
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
                  <td colSpan="6" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : (
                currentData?.map((item, index) => (
                  <tr
                    key={item._id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-sm"
                  >
                    <td className="px-4 py-3">{startIndex + index + 1}.</td>
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {getPlainText(item.desc, 50)}
                    </td>
                    <td className="px-4 py-3">
                      <img
                        src={item.image || "/placeholder.png"}
                        alt={item.image_alt || "Testimonial"}
                        className="h-10 w-10 object-cover rounded-full border border-gray-300"
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
                                  name: item.name,
                                  image: null,
                                  imagePreview: item.image,
                                  image_alt: item.image_alt || "",
                                  desc: item.desc,
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
              Showing {startIndex + 1}–{Math.min(endIndex, data?.length || 0)}{" "}
              of {data?.length || 0}
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

export default Testimonial;
