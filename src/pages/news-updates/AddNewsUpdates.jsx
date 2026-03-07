import React, { useState, useEffect } from "react";
import TiptapEditor from "../../components/TiptapEditor";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import adminBanner from "../../assets/banners/bg.jpg";
import { showSuccess, showError } from "../../utils/toastService";
import { getAllPublished } from "../../redux/slices/add_by_admin/publishedSlice";
import {
  createRecentUpdate,
  updateRecentUpdate,
} from "../../redux/slices/recentUpdate/recentUpdateSlice";
import useRoleRights from "../../hooks/useRoleRights";
import { PageNames } from "../../utils/constants";

const AddNewsUpdates = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    _id: null,
    title: "",
    published_by: "",
    date: "",
    image: null,
    imagePreview: "",
    image_alt: "",
    status: "Active",
    description: "",
  });

  const dispatch = useDispatch();
  const { list } = useSelector((state) => state.published || {});
  const { recentUpdates, loading } = useSelector(
    (state) => state.recentUpdate || {},
  );
  console.log("recentUpdates...", recentUpdates);
  const authUser = JSON.parse(localStorage.getItem("user"));
  const [isEdit, setIsEdit] = useState(false);

  const { isFormDisabled } = useRoleRights(PageNames.ADD_NEWS_UPDATES);

  useEffect(() => {
    dispatch(getAllPublished());
  }, [dispatch]);

  useEffect(() => {
    if (location.state) {
      const item = location.state;

      setIsEdit(true);
      setFormData({
        _id: item._id,
        title: item.title || "",
        published_by: item.published_by || "",
        date: item.date ? new Date(item.date).toISOString().split("T")[0] : "",
        image: null,
        imagePreview: item.image || "",
        image_alt: item.image_alt || "",
        status: location.state.status || "Active",
        description: location.state.description || "",
      });
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files[0]) {
      setFormData({
        ...formData,
        image: files[0],
        imagePreview: URL.createObjectURL(files[0]),
      });
    } else {
      setFormData({ ...formData, [name]: files ? files[0] : value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentUserId = authUser?.id;
    const currentUserName = authUser?.username;

    const data = new FormData();
    data.append("title", formData.title);
    data.append("published_by", formData.published_by);
    data.append("date", formData.date);
    data.append("status", formData.status);
    data.append("image_alt", formData.image_alt);
    data.append("description", formData.description || "");
    if (formData.image instanceof File) {
      data.append("image", formData.image);
    }
    if (currentUserId) data.append("user_id", currentUserId);
    if (currentUserName) {
      data.append(isEdit ? "updated_by" : "created_by", currentUserName);
    }

    try {
      if (isEdit) {
        await dispatch(updateRecentUpdate({ id: formData._id, data })).unwrap();
        showSuccess("News Updates updated successfully ✅");
      } else {
        await dispatch(createRecentUpdate(data)).unwrap();
        showSuccess("News Updates added successfully ✅");
      }
      navigate("/news/news-updates-list");
    } catch (err) {
      console.error(err);
      showError(err?.message || "Something went wrong");
    }
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
        <div className="relative flex justify-between items-center px-6 py-4 h-25">
          <div className="flex items-center gap-4">
            <div className="flex flex-col ">
              <h2 className="text-xl font-semibold text-white ">
                Updates Management
              </h2>
              <p className="text-sm text-blue-100">
                Add or update Trust Bodies content including title, image, link
                and status.{" "}
              </p>
            </div>
          </div>
          <div>
            <button
              onClick={() => navigate("/news/news-updates-list")}
              className="bg-blue-500 hover:bg-blue-600 text-sm text-white font-medium py-1 px-4 rounded"
            >
              {" "}
              News Updates List
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-3 p-5">
        {/* ================= FORM ================= */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-base font-medium text-gray-800 mb-4">
            {isEdit ? "Update  News Updates" : "Add New News Updates"}
          </h3>

          <form
            onSubmit={handleSubmit}
            className={`grid grid-cols-1 md:grid-cols-3 gap-3 ${isFormDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {/* TITLE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter title"
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                required
                disabled={isFormDisabled}
              />
            </div>
            {/* PUBLISHED BY */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Published By <span className="text-red-500">*</span>
              </label>

              <select
                name="published_by"
                value={formData.published_by}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                required
                disabled={isFormDisabled}
              >
                <option value="">Select Publisher</option>
                {list?.map((u) => (
                  <option key={u._id} value={u.name}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            {/* DATE */}{" "}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                required
                disabled={isFormDisabled}
              />
            </div>
            {/* IMAGE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image (size: 432x180) <span className="text-red-500">*</span>
              </label>
              <input
                key={formData._id || "new"}
                type="file"
                name="image"
                onChange={handleChange}
                accept="image/*"
                required={!isEdit}
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
            {/* Image Alt  */}
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
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            {/* DESCRIPTION */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>

              <TiptapEditor
                value={formData.description}
                onChange={(html) =>
                  setFormData((prev) => ({ ...prev, description: html }))
                }
                isReadOnly={isFormDisabled}
              />
            </div>
            {/* ACTION BUTTONS */}
            <div className="md:col-span-3 flex justify-end gap-3 mt-2">
              <button
                type="button"
                disabled={loading || isFormDisabled}
                onClick={() => {
                  setFormData({
                    _id: null,
                    title: "",
                    published_by: "",
                    date: "",
                    image: null,
                    imagePreview: "",
                    image_alt: "",
                    status: "Active",
                    description: "",
                  });
                  setIsEdit(false);
                }}
                className="px-5 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || isFormDisabled}
                className={`px-6 py-1 text-sm rounded text-white ${
                  isEdit
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-green-600 hover:bg-green-700"
                } ${loading || isFormDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {loading ? "Processing..." : isEdit ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddNewsUpdates;
