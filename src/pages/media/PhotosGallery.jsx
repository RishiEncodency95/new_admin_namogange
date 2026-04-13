import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createGallery,
  getAllGallery,
  updateGallery,
  deleteGallery,
} from "../../redux/slices/mediaImageSlice";
import { showSuccess, showError } from "../../utils/toastService";
import { getAllCategoryImages } from "../../redux/slices/add_by_admin/categoryImageSlice";
import useRoleRights from "../../hooks/useRoleRights";
import { PageNames } from "../../utils/constants";

const PhotosGallery = () => {
  const dispatch = useDispatch();
  const { gallery, loading } = useSelector((state) => state.gallery);
  const { categoryImages } = useSelector((state) => state.categoryImage);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const authUser = JSON.parse(sessionStorage.getItem("user"));
  const fileInputRef = useRef(null);

  /* ===== STATE ===== */
  const [formData, setFormData] = useState({
    _id: null,
    category: "",
    images: [],
    imagePreviews: [], // [{ url, alt, isNew }]
    image_alt: "",
    status: "Active",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [selectedGalleryForMedia, setSelectedGalleryForMedia] = useState(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  // Modal media management
  const [modalMedia, setModalMedia] = useState([]);
  const [isUploadingInModal, setIsUploadingInModal] = useState(false);

  const { canWrite, canDelete, isFormDisabled } = useRoleRights(
    PageNames.PHOTOS_GALLERY,
  );

  /* ===== FETCH DATA ===== */
  useEffect(() => {
    dispatch(getAllGallery());
    dispatch(getAllCategoryImages());
  }, [dispatch]);

  /* ===== PAGINATION & FILTER STATE ===== */
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("All");

  /* ===== HELPERS ===== */
  const filteredGallery = React.useMemo(() => {
    if (!gallery) return [];
    return categoryFilter === "All"
      ? gallery
      : gallery.filter(item => item.category === categoryFilter);
  }, [gallery, categoryFilter]);

  const totalPages = Math.ceil((filteredGallery.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredGallery.slice(startIndex, endIndex) || [];

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

  /* ===== HANDLERS ===== */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images" && files) {
      const selectedFiles = Array.from(files);
      const maxSize = 10 * 1024 * 1024;
      const validFiles = [];
      const newPreviews = [];

      selectedFiles.forEach((file) => {
        if (file.size <= maxSize) {
          validFiles.push(file);
          newPreviews.push({
            url: URL.createObjectURL(file),
            alt: formData.image_alt,
            isNew: true
          });
        }
      });

      setFormData({
        ...formData,
        images: [...formData.images, ...validFiles],
        imagePreviews: [...formData.imagePreviews, ...newPreviews],
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const applyCommonAltToAll = () => {
    setFormData({
      ...formData,
      imagePreviews: formData.imagePreviews.map(p => ({ ...p, alt: formData.image_alt }))
    });
    showSuccess("Updated all image alts in preview");
  };

  const handleUpdateSingleAlt = (index, newAlt) => {
    const updated = [...formData.imagePreviews];
    updated[index] = { ...updated[index], alt: newAlt };
    setFormData({ ...formData, imagePreviews: updated });
  };

  const handleRemoveImage = (index) => {
    const imageToRemove = formData.imagePreviews[index];
    const updatedPreviews = formData.imagePreviews.filter((_, i) => i !== index);
    let updatedImages = [...formData.images];
    if (imageToRemove.isNew) {
      const newFilesIndex = formData.imagePreviews.slice(0, index).filter(p => p.isNew).length;
      updatedImages = formData.images.filter((_, i) => i !== newFilesIndex);
    }
    setFormData({ ...formData, imagePreviews: updatedPreviews, images: updatedImages });
  };

  const resetForm = () => {
    setFormData({ _id: null, category: "", images: [], imagePreviews: [], image_alt: "", status: "Active" });
    setIsEdit(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isFormDisabled) return;
    setIsSubmitting(true);
    try {
      const dataToSend = new FormData();
      dataToSend.append("category", formData.category);
      dataToSend.append("status", formData.status);
      dataToSend.append("image_alt", formData.image_alt);
      dataToSend.append("user_id", authUser?.id);

      if (isEdit) {
        const existingToKeep = formData.imagePreviews
          .filter(p => !p.isNew)
          .map(p => ({ url: p.url, alt: p.alt }));

        dataToSend.append("existing_images", JSON.stringify(existingToKeep));
        formData.images.forEach(f => dataToSend.append("images", f));

        await dispatch(updateGallery({ id: formData._id, formData: dataToSend })).unwrap();
        showSuccess("Photo Gallery updated successfully");
      } else {
        if (formData.images.length === 0) return showError("Please select images");
        formData.images.forEach(f => dataToSend.append("images", f));
        await dispatch(createGallery(dataToSend)).unwrap();
        showSuccess("Photo Gallery added successfully");
      }
      resetForm();
      dispatch(getAllGallery());
    } catch (err) {
      showError("Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ===== MODAL HANDLERS ===== */
  const openMediaModal = (item) => {
    setSelectedGalleryForMedia(item);
    setModalMedia(item.images || []);
    setIsMediaModalOpen(true);
  };

  const handleUpdateModalAlt = (index, newAlt) => {
    const updated = [...modalMedia];
    updated[index] = { ...updated[index], alt: newAlt };
    setModalMedia(updated);
  };

  const saveModalChanges = async () => {
    try {
      const data = new FormData();
      data.append("user_id", authUser?.id);
      data.append("existing_images", JSON.stringify(modalMedia));
      await dispatch(updateGallery({ id: selectedGalleryForMedia._id, formData: data })).unwrap();
      showSuccess("Gallery captions updated successfully");
      dispatch(getAllGallery());
      setIsMediaModalOpen(false);
    } catch (err) {
      showError("Something went wrong!");
    }
  };

  const handleModalUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setIsUploadingInModal(true);
    try {
      const data = new FormData();
      data.append("user_id", authUser?.id);
      data.append("existing_images", JSON.stringify(modalMedia));
      files.forEach(f => data.append("images", f));
      const updated = await dispatch(updateGallery({ id: selectedGalleryForMedia._id, formData: data })).unwrap();
      setModalMedia(updated.images);
      setSelectedGalleryForMedia(updated);
      showSuccess("Photos added successfully");
    } catch (err) {
      showError("Something went wrong!");
    } finally {
      setIsUploadingInModal(false);
    }
  };

  const handleModalDelete = async (url) => {
    if (!window.confirm("Delete this photo?")) return;
    try {
      const remaining = modalMedia.filter(img => img.url !== url);
      const data = new FormData();
      data.append("user_id", authUser?.id);
      data.append("existing_images", JSON.stringify(remaining));
      const updated = await dispatch(updateGallery({ id: selectedGalleryForMedia._id, formData: data })).unwrap();
      setModalMedia(updated.images);
      setSelectedGalleryForMedia(updated);
      showSuccess("Photo removed successfully");
    } catch (err) {
      showError("Something went wrong!");
    }
  };

  return (
    <div className="">
      {/* ================= HEADER ================= */}
      <div className="relative overflow-hidden shadow-sm border border-gray-200 h-25 bg-gradient-to-r from-orange-400 via-cyan-400 to-blue-300">
        <div className="absolute inset-0 bg-white/10"></div>
        <div className="relative flex justify-center items-center px-6 py-4 h-25">
          <div className="flex flex-col text-center">
            <h2 className="text-xl font-semibold text-gray-700 text-center">Photos Gallery Management</h2>
            <p className="text-sm text-blue-100">Add or update photos gallery content including category, images, alt text and status.</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-5">
        {/* ================= FORM ================= */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-medium text-gray-800">
              {isEdit ? "Update Photo Gallery" : "Add Photo Gallery"}
            </h3>
            {isEdit && (
              <button
                type="button"
                onClick={applyCommonAltToAll}
                className="text-xs text-blue-600 font-medium hover:underline"
              >
                Apply Common Alt to All
              </button>
            )}
          </div>
          <form onSubmit={handleFormSubmit} className={`grid grid-cols-1 md:grid-cols-3 gap-3 ${isFormDisabled ? "opacity-60 cursor-not-allowed" : ""}`}>
            {/* CATEGORY */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image Category <span className="text-red-500">*</span></label>
              <select name="category" value={formData.category} onChange={handleChange} required disabled={isFormDisabled} className="w-full border border-gray-300 rounded px-3 py-1 text-sm bg-white">
                <option value="">Select Category</option>
                {categoryImages?.map(cat => <option key={cat._id} value={cat.title}>{cat.title}</option>)}
              </select>
            </div>
            {/* IMAGE INPUT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image (size: 294x294) <span className="text-red-500">*</span></label>
              <input type="file" name="images" multiple ref={fileInputRef} onChange={handleChange} disabled={isFormDisabled} className="w-full border border-gray-300 rounded px-3 py-[3px] text-sm bg-white" />
            </div>
            {/* COMMON ALT TEXT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Common Alt</label>
              <input type="text" name="image_alt" value={formData.image_alt} onChange={handleChange} placeholder="Common alt text" disabled={isFormDisabled} className="w-full border border-gray-300 rounded px-3 py-1 text-sm" />
            </div>
            {/* STATUS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} disabled={isFormDisabled} className="w-full border border-gray-300 rounded px-3 py-1 text-sm bg-white">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* PREVIEWS AREA */}
            {formData.imagePreviews.length > 0 && (
              <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-6 gap-3 mt-4 p-2 bg-gray-50 rounded border border-gray-100">
                {formData.imagePreviews.map((p, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="relative group w-full aspect-square rounded border border-gray-200 overflow-hidden bg-white shadow-sm">
                      <img src={p.url} className="w-full h-full object-cover" alt="preview" />
                      <button type="button" onClick={() => handleRemoveImage(i)} className="absolute inset-0 bg-red-600/60 text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center">X</button>
                    </div>
                    <input
                      type="text"
                      value={p.alt}
                      onChange={(e) => handleUpdateSingleAlt(i, e.target.value)}
                      placeholder="Alt Text"
                      className="w-full text-xs border rounded py-1 px-2 focus:border-blue-400 outline-none"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="md:col-span-1 flex justify-end gap-3 mt-6">
              <button type="button" onClick={resetForm} disabled={isSubmitting || isFormDisabled} className="px-5 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 transition">Cancel</button>
              <button type="submit" disabled={isSubmitting || isFormDisabled} className={`px-6 py-1 text-sm rounded text-white transition ${isEdit ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"} disabled:opacity-50`}>
                {isSubmitting ? "Processing..." : isEdit ? "Update Photo" : "Add Photo"}
              </button>
            </div>
          </form>
        </div>

        {/* ================= TABLE ================= */}
        <div className="relative overflow-x-auto bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-5 py-2 border-b bg-gray-200 border-gray-200 flex justify-between items-center">
            <h3 className="text-base font-medium text-gray-800">Photo Gallery List</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium tracking-tight">Filter:</span>
              <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1) }} className="border border-gray-300 rounded px-2 py-0.5 text-xs bg-white outline-none">
                <option value="All">All Categories</option>
                {categoryImages?.map(cat => <option key={cat._id} value={cat.title}>{cat.title}</option>)}
              </select>
            </div>
          </div>

          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 font-medium">
              <tr>
                <th className="px-4 py-3">S.No</th>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-center">Manage Media</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="">
              {loading && filteredGallery.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
              ) : (
                currentData.map((item, idx) => (
                  <tr key={item._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-400">{startIndex + idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="w-14 h-9 rounded border border-gray-200 overflow-hidden bg-gray-50 shadow-sm relative group">
                        <img src={typeof item.images?.[0] === 'string' ? item.images[0] : item.images?.[0]?.url || "/placeholder.png"} className="w-full h-full object-cover" alt="" />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{item.category}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => openMediaModal(item)} className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium hover:bg-green-100 transition shadow-sm">
                        {item.images?.length || 0} Media
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 text-xs rounded-full inline-block ${item.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700 text-center"}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        {canWrite && <button className="text-green-600 hover:underline" onClick={() => {
                          setFormData({
                            _id: item._id,
                            category: item.category,
                            images: [],
                            imagePreviews: (item.images || []).map(img => ({
                              url: typeof img === 'string' ? img : img.url,
                              alt: typeof img === 'object' ? img.alt : item.image_alt || "",
                              isNew: false
                            })),
                            image_alt: item.image_alt || "",
                            status: item.status,
                          });
                          setIsEdit(true);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}>Edit</button>}
                        {canDelete && <button className="text-red-600 hover:underline" onClick={() => { dispatch(deleteGallery({ id: item._id, user_id: authUser?.id })); showSuccess("Deleted successfully"); }}>Delete</button>}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* ================= PAGINATION ================= */}
          <div className="flex justify-between items-center p-4">
            <span className="text-sm text-gray-500">
              Showing {startIndex + 1}–{Math.min(endIndex, filteredGallery.length)} of {filteredGallery.length}
            </span>
            <div className="flex space-x-1">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} className="px-3 h-8 text-gray-600 border border-gray-300 hover:bg-gray-50 rounded-l-lg disabled:opacity-30">Prev</button>
              {getPageNumbers().map((p, i) => (
                <button key={i} onClick={() => typeof p === 'number' && setCurrentPage(p)} className={`px-3 h-8 border border-gray-300 hover:bg-gray-50 ${currentPage === p ? "bg-blue-50 text-blue-600 font-semibold" : ""}`}>{p}</button>
              ))}
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} className="px-3 h-8 text-gray-600 border border-gray-300 hover:bg-gray-50 rounded-r-lg disabled:opacity-30">Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* MEDIA MODAL */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-base font-bold text-gray-800 uppercase tracking-tight">Manage Gallery: {selectedGalleryForMedia?.category}</h2>
              <button onClick={() => setIsMediaModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 font-bold transition">×</button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="w-1/4 bg-gray-50 p-6 border-r border-gray-100 flex flex-col items-center">
                <p className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Bulk Upload</p>
                <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer p-4 text-center">
                  <div className="text-blue-500 mb-2">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  </div>
                  <span className="text-xs font-bold text-gray-600 leading-tight">
                    {isUploadingInModal ? "..." : "Add Photos"}
                  </span>
                  <input type="file" multiple className="hidden" onChange={handleModalUpload} disabled={isUploadingInModal} />
                </label>
              </div>

              <div className="flex-1 p-8 overflow-y-auto bg-white">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {modalMedia.map((img, i) => (
                    <div key={i} className="flex flex-col gap-2 relative bg-gray-50 p-1 rounded-lg border border-gray-100 group shadow-sm">
                      <div className="relative aspect-square rounded overflow-hidden">
                        <img src={img.url} className="w-full h-full object-cover transition" alt="gallery" />
                        <div className="absolute inset-0 bg-red-600/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg">
                          <button onClick={() => handleModalDelete(img.url)} className="px-4 py-2 bg-white text-red-600 rounded text-xs font-bold hover:bg-red-600 hover:text-white transition uppercase">Delete</button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={img.alt}
                        onChange={(e) => handleUpdateModalAlt(i, e.target.value)}
                        placeholder="Caption"
                        className="w-full text-xs border rounded py-1 px-2 focus:border-blue-400 outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsMediaModalOpen(false)} className="px-8 py-1.5 border border-gray-300 rounded font-medium text-sm">Cancel</button>
              <button
                onClick={saveModalChanges}
                className="px-10 py-1.5 bg-gray-800 text-white rounded font-medium text-sm hover:bg-black transition shadow-lg"
              >Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotosGallery;
