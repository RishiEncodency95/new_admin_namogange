import React, { useState, useEffect } from "react";
import TiptapEditor from "../../components/TiptapEditor";
import { showSuccess, showError } from "../../utils/toastService";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createSeo, updateSeo } from "../../redux/slices/seo/seoSlice";
import { getAllBlogs } from "../../redux/slices/blog/blogSlice";
import { fetchObjectives } from "../../redux/slices/objective/objectiveSlice";
import { getAllInitiatives } from "../../redux/slices/initiativeSlice";
import { PAGES_LIST } from "../../utils/pagesList";

const SITE_URL =
  import.meta.env.VITE_SITE_URL || "https://namogange.org";

const AddSEO = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.seo || {});
  const { blogs } = useSelector((state) => state.blog || { blogs: [] });
  const { data: objectives } = useSelector((state) => state.objectives || { data: [] });
  const { initiatives } = useSelector((state) => state.initiative || { initiatives: [] });

  const [isEdit, setIsEdit] = useState(false);
  const [showHomeFields, setShowHomeFields] = useState(false);
  const [formData, setFormData] = useState({
    page_name: "",
    page_path: "",
    h1tag: "",
    page_banner: null,
    page_banner_preview: "",
    metaTitle: "",
    metaKeywords: "",
    metaDescription: "",
    banner_alt: "",
    open_graph: null,
    open_graph_preview: "",
    og_title: "",
    og_description: "",
    twitter_card: "summary_large_image",
    openGraphTags: "",
    schemaMarkup: "",
    canonical_url: "",
    use_custom_canonical: false,
    robots_index: "index",
    robots_follow: "follow",
    status: "Active",
  });

  const authUser = JSON.parse(sessionStorage.getItem("user") || "{}");
  const currentUserId = authUser?._id || authUser?.id || null;
  const currentUserName = authUser?.username || "";

  useEffect(() => {
    dispatch(getAllBlogs());
    dispatch(fetchObjectives());
    dispatch(getAllInitiatives());
  }, [dispatch]);

  const combinedPages = [
    ...PAGES_LIST,
    ...(blogs || [])
      .filter((blog) => blog.status === "Active")
      .map((blog) => ({
        name: `Blog: ${blog.title}`,
        path: `/communication/blog/${blog.slug}`,
      })),
    ...(objectives || [])
      .filter((obj) => obj && obj.status === "Active")
      .map((obj) => ({
        name: `Objective: ${obj.title}`,
        path: `/objectives/${obj.slug}`,
      })),
    ...(initiatives || [])
      .filter((initiative) => initiative && initiative.status === "Active"
        // && (initiative?.page_description && initiative?.page_description !== "")
      )
      .map((initiative) => ({
        name: `Initiative: ${initiative.title}`,
        path: `/initiatives/${initiative.slug}`,
      })),
  ];

  useEffect(() => {
    if (state) {
      setIsEdit(true);
      setFormData({
        page_name: state.page_name || "",
        page_path: state.page_path || "",
        h1tag: state.h1tag || "",
        page_banner: null,
        page_banner_preview: state.page_banner || "",
        metaTitle: state.metaTitle || "",
        metaKeywords: state.metaKeywords || "",
        metaDescription: state.metaDescription || "",
        banner_alt: state.banner_alt || "",
        open_graph: null,
        open_graph_preview: state.open_graph || "",
        og_title: state.og_title || "",
        og_description: state.og_description || "",
        twitter_card: state.twitter_card || "summary_large_image",
        openGraphTags: state.openGraphTags || "",
        schemaMarkup: state.schemaMarkup || "",
        canonical_url: state.canonical_url || "",
        use_custom_canonical: Boolean(state.canonical_url),
        robots_index: state.robots_index || "index",
        robots_follow: state.robots_follow || "follow",
        status: state.status || "Active",
      });
      setShowHomeFields(state.page_path === "/");
    }
  }, [state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
        [`${name}_preview`]: URL.createObjectURL(files[0]),
      }));
    }
  };

  const validateForm = () => {
    if (!formData.page_path) {
      showError("Please select a page to continue.");
      return false;
    }

    if (!formData.metaTitle.trim()) {
      showError("Meta title is required.");
      return false;
    }
    if (formData.metaTitle.length > 65) {
      showError("Meta title should not exceed 65 characters.");
      return false;
    }

    if (!formData.metaKeywords.trim()) {
      showError("Meta keywords are required.");
      return false;
    }

    if (!formData.metaDescription.trim()) {
      showError("Meta description is required.");
      return false;
    }
    if (formData.metaDescription.length > 155) {
      showError("Meta description should not exceed 155 characters.");
      return false;
    }

    if (!showHomeFields) {
      if (!formData.h1tag.trim()) {
        showError("H1 Tag is required.");
        return false;
      }
      if (!isEdit && !formData.page_banner) {
        showError("Page banner is required.");
        return false;
      }
    }

    if (!formData.banner_alt.trim()) {
      showError("Banner Img Alt is required.");
      return false;
    }

    if (!isEdit && !formData.open_graph) {
      showError("Open Graph image is required.");
      return false;
    }

    if (
      !formData.openGraphTags.trim() ||
      formData.openGraphTags === "<p></p>"
    ) {
      showError("Open Graph tags are required.");
      return false;
    }

    if (!formData.schemaMarkup.trim() || formData.schemaMarkup === "<p></p>") {
      showError("Schema markup is required.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = new FormData();

    submitData.append("page_name", formData.page_name);
    submitData.append("page_path", formData.page_path);
    submitData.append("h1tag", formData.h1tag || "");
    submitData.append("metaTitle", formData.metaTitle);
    submitData.append("metaKeywords", formData.metaKeywords);
    submitData.append("metaDescription", formData.metaDescription);
    submitData.append("banner_alt", formData.banner_alt);
    submitData.append("og_title", formData.og_title || "");
    submitData.append("og_description", formData.og_description || "");
    submitData.append("twitter_card", formData.twitter_card || "summary_large_image");
    submitData.append("openGraphTags", formData.openGraphTags);
    submitData.append("schemaMarkup", formData.schemaMarkup);
    submitData.append("canonical_url", formData.canonical_url || "");
    submitData.append("robots_index", formData.robots_index || "index");
    submitData.append("robots_follow", formData.robots_follow || "follow");
    submitData.append("status", formData.status);
    submitData.append("user_id", currentUserId);
    submitData.append("user_name", currentUserName);

    if (formData.page_banner && formData.page_banner instanceof File) {
      submitData.append("page_banner", formData.page_banner);
    }

    if (formData.open_graph && formData.open_graph instanceof File) {
      submitData.append("open_graph", formData.open_graph);
    }

    try {
      if (isEdit) {
        await dispatch(
          updateSeo({ id: state._id, formData: submitData }),
        ).unwrap();
        showSuccess("SEO updated successfully!");
      } else {
        await dispatch(createSeo(submitData)).unwrap();
        showSuccess("SEO added successfully!");
      }
      navigate("/seo/seo-list");
    } catch (error) {
      showError(error?.message || "Failed to save data");
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 via-cyan-400 to-blue-300 border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-white">SEO Management</h2>
            <p className="text-sm text-blue-100">
              Add or update SEO meta tags for website pages.
            </p>
          </div>
          <button
            onClick={() => navigate("/seo/seo-list")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded text-sm transition-all hover:scale-105"
          >
            SEO List
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base font-medium text-gray-800 p-4 border-b">
            SEO Information
          </h3>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Row 1: Page Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Page <span className="text-red-500">*</span>
                </label>
                <select
                  name="page_path"
                  value={formData.page_path}
                  onChange={(e) => {
                    const selected = combinedPages.find(
                      (p) => p.path === e.target.value,
                    );
                    const isHome = e.target.value === "/";
                    setShowHomeFields(isHome);
                    setFormData((prev) => ({
                      ...prev,
                      page_name: selected?.name || "",
                      page_path: selected?.path || "",
                      canonical_url:
                        prev.use_custom_canonical && prev.canonical_url
                          ? prev.canonical_url
                          : `${SITE_URL}${selected?.path || ""}`,
                    }));
                  }}
                  className={inputClass}
                  required
                  disabled={isEdit}
                >
                  <option value="">Select Page</option>
                  {combinedPages.map((p) => (
                    <option key={p.path} value={p.path}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {!showHomeFields && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      H1 Tag <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="h1tag"
                      value={formData.h1tag}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Enter H1 Tag"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Page Banner <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      name="page_banner"
                      onChange={handleFileChange}
                      className={inputClass}
                      required={!isEdit && !showHomeFields}
                    />
                    {formData.page_banner_preview && (
                      <div className="mt-2">
                        <img
                          src={formData.page_banner_preview}
                          alt="Banner Preview"
                          className="h-16 w-auto rounded border"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Row 2: Meta Fields */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banner Img Alt <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="banner_alt"
                  value={formData.banner_alt}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter Banner Img Alt"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({formData.metaTitle.length}/65)
                  </span>
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleChange}
                  className={`${inputClass} ${formData.metaTitle.length > 65 ? "border-red-500" : ""}`}
                  placeholder="Enter Meta Title"
                  maxLength={65}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Keywords <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="metaKeywords"
                  value={formData.metaKeywords}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter Meta Keywords"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Row 3: OG Image & Meta Description */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Open Graph Image <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  name="open_graph"
                  onChange={handleFileChange}
                  className={inputClass}
                  required={!isEdit}
                />
                {formData.open_graph_preview && (
                  <div className="mt-2">
                    <img
                      src={formData.open_graph_preview}
                      alt="Open Graph Preview"
                      className="h-16 w-auto rounded border"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OG Title
                </label>
                <input
                  type="text"
                  name="og_title"
                  value={formData.og_title}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter OG title (defaults to meta title)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OG Description
                </label>
                <textarea
                  name="og_description"
                  value={formData.og_description}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter OG description (defaults to meta description)"
                  rows="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({formData.metaDescription.length}/155)
                  </span>
                </label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  className={`${inputClass} ${formData.metaDescription.length > 155 ? "border-red-500" : ""}`}
                  placeholder="Enter meta description"
                  rows="1"
                  maxLength={155}
                  required
                />
              </div>
            </div>

            {/* Row: Twitter Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Twitter Card Type
                </label>
                <select
                  name="twitter_card"
                  value={formData.twitter_card}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="summary_large_image">summary_large_image (recommended)</option>
                  <option value="summary">summary</option>
                  <option value="app">app</option>
                  <option value="player">player</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Twitter/X par card kaise dikhega
                </p>
              </div>
            </div>

            {/* Row: Canonical & Robots */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Canonical URL
                  <span className="text-xs text-gray-500 ml-2">
                    (auto-generated)
                  </span>
                </label>
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    id="use_custom_canonical"
                    checked={formData.use_custom_canonical}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData((prev) => ({
                        ...prev,
                        use_custom_canonical: checked,
                        canonical_url: checked
                          ? prev.canonical_url
                          : `${SITE_URL}${prev.page_path}`,
                      }));
                    }}
                    className="h-4 w-4"
                  />
                  <label
                    htmlFor="use_custom_canonical"
                    className="text-xs text-gray-600"
                  >
                    Custom canonical
                  </label>
                </div>
                <input
                  type="text"
                  name="canonical_url"
                  value={formData.canonical_url}
                  onChange={handleChange}
                  readOnly={!formData.use_custom_canonical}
                  className={`${inputClass} ${
                    !formData.use_custom_canonical
                      ? "bg-gray-100 cursor-not-allowed"
                      : ""
                  }`}
                  placeholder="https://namogange.org/about"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Robots Index <span className="text-red-500">*</span>
                </label>
                <select
                  name="robots_index"
                  value={formData.robots_index}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="index">index</option>
                  <option value="noindex">noindex</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  noindex = Google par ye page nahi dikhega
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Robots Follow <span className="text-red-500">*</span>
                </label>
                <select
                  name="robots_follow"
                  value={formData.robots_follow}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="follow">follow</option>
                  <option value="nofollow">nofollow</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  nofollow = links follow nahi honge
                </p>
              </div>
            </div>

            {/* Row 4: Open Graph Tags Editor */}
            <div>
              <label className="block text-sm font-bold text-gray-700 p-3 bg-gray-50 border-b">
                Open Graph Tags <span className="text-red-500">*</span>
              </label>
              <TiptapEditor
                value={formData.openGraphTags}
                onChange={(html) =>
                  setFormData((prev) => ({ ...prev, openGraphTags: html }))
                }
              />
            </div>

            {/* Row 5: Schema Markup Editor */}
            <div>
              <label className="block text-sm font-bold text-gray-700 p-3 bg-gray-50 border-b">
                Schema Markup <span className="text-red-500">*</span>
              </label>
              <TiptapEditor
                value={formData.schemaMarkup}
                onChange={(html) =>
                  setFormData((prev) => ({ ...prev, schemaMarkup: html }))
                }
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate("/seo/seo-list")}
                className="px-5 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-1 rounded text-white text-sm flex items-center gap-2 transition ${loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
                  }`}
              >
                {loading && (
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
                {loading ? "Saving..." : isEdit ? "Update SEO" : "Add SEO"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSEO;
