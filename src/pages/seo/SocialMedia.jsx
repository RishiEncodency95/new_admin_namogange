import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getSocialMedia,
  upsertSocialMedia,
  deleteSocialMedia,
} from "../../redux/slices/seo/socialMediaSlice";
import { showSuccess, showError } from "../../utils/toastService";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Phone,
  MessageCircle,
  Save,
  Loader2,
  Share2,
  X,
  Edit,
  Trash2,
  Mail,
  MapPin,
} from "lucide-react";

const SocialMedia = () => {
  const dispatch = useDispatch();
  const { socialData, loading } = useSelector(
    (state) => state.socialMedia || {},
  );

  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    _id: null,
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    youtube: "",
    whatsappNumber: "",
    whatsappMessage: "",
    callNumber: "",
    callNumber2: "",
    mail: "",
    mail2: "",
    address: "",
    status: "Active",
  });

  const authUser = JSON.parse(sessionStorage.getItem("user") || "{}");
  const currentUserId = authUser?._id || authUser?.id || null;

  useEffect(() => {
    dispatch(getSocialMedia());
  }, [dispatch]);
  console.log("socialDatas", socialData);

  useEffect(() => {
    const data = Array.isArray(socialData) ? socialData[0] : socialData;
    if (data && data._id) {
      setFormData({
        _id: data._id,
        facebook: data.facebook || "",
        instagram: data.instagram || "",
        twitter: data.twitter || "",
        linkedin: data.linkedin || "",
        youtube: data.youtube || "",
        whatsappNumber: data.whatsappNumber || "",
        whatsappMessage: data.whatsappMessage || "",
        callNumber: data.callNumber || "",
        callNumber2: data.callNumber2 || "",
        mail: data.mail || "",
        mail2: data.mail2 || "",
        address: data.address || "",
        status: data.status || "Active",
      });
      setIsEdit(true); // 🔥 auto edit mode
    }
  }, [socialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      _id: null,
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
      youtube: "",
      whatsappNumber: "",
      whatsappMessage: "",
      callNumber: "",
      callNumber2: "",
      mail: "",
      mail2: "",
      address: "",
      status: "Active",
    });
    setIsEdit(false);
  };

  const handleEdit = (item) => {
    setFormData({
      _id: item._id,
      facebook: item.facebook || "",
      instagram: item.instagram || "",
      twitter: item.twitter || "",
      linkedin: item.linkedin || "",
      youtube: item.youtube || "",
      whatsappNumber: item.whatsappNumber || "",
      whatsappMessage: item.whatsappMessage || "",
      callNumber: item.callNumber || "",
      callNumber2: item.callNumber2 || "",
      mail: item.mail || "",
      mail2: item.mail2 || "",
      address: item.address || "",
      status: item.status || "Active",
    });
    setIsEdit(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteSocialMedia({ user_id: currentUserId })).unwrap();

      showSuccess("Configuration deleted successfully");

      resetForm(); // 🔥 important
    } catch (err) {
      showError(err?.message || "Failed to delete");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = { ...formData, user_id: currentUserId };

    try {
      await dispatch(upsertSocialMedia(dataToSend)).unwrap();

      showSuccess("Social Media saved successfully ✅");

      dispatch(getSocialMedia());
    } catch (error) {
      showError(error?.message || "Something went wrong!");
    }
  };

  //   if (fetching) {
  //     return (
  //       <div className="flex items-center justify-center min-h-[60vh]">
  //         <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
  //       </div>
  //     );
  //   }

  return (
    <div className="bg-white min-h-screen">
      {/* HEADER */}
      <div
        className="relative overflow-hidden shadow-sm border border-gray-200 h-25 
bg-gradient-to-r from-orange-400 via-cyan-400 to-blue-300"
      >
        <div className="absolute inset-0 bg-white/10"></div>
        <div className="relative flex justify-center items-center px-6 py-4 h-25">
          <div className="flex items-center gap-4">
            <div className="flex flex-col text-center">
              <h2 className="text-xl font-semibold text-gray-700 text-center">
                Social Media Management
              </h2>
              <p className="text-sm text-blue-100">
                Configure your contact information and social network profiles.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-5">
        {/* ================= FORM ================= */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-medium text-gray-800">
            {isEdit
              ? "Update Social Settings"
              : "Social Media & Contact Settings"}
          </h3>
          <div className="bg-gray-50 border-b my-2 border-gray-200" />
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
          >
            {/* WHATSAPP NUMBER */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <MessageCircle size={14} className="text-[#25D366]" /> WhatsApp
                Number
              </label>
              <input
                type="text"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleChange}
                placeholder="e.g. 919876543210"
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* CALL NUMBER */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Phone size={14} className="text-blue-600" /> Call Number
              </label>
              <input
                type="text"
                name="callNumber"
                value={formData.callNumber}
                onChange={handleChange}
                placeholder="+919876543210"
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* CALL NUMBER 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Phone size={14} className="text-blue-600" /> Call Number 2 (Optional)
              </label>
              <input
                type="text"
                name="callNumber2"
                value={formData.callNumber2}
                onChange={handleChange}
                placeholder="+919876543210"
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* WHATSAPP MESSAGE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Default Message
              </label>
              <input
                type="text"
                name="whatsappMessage"
                value={formData.whatsappMessage}
                onChange={handleChange}
                placeholder="Hello Namo Gange..."
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* FACEBOOK */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Facebook size={14} className="text-[#1877F2]" /> Facebook URL
              </label>
              <input
                type="url"
                name="facebook"
                value={formData.facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/..."
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* INSTAGRAM */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Instagram size={14} className="text-[#E4405F]" /> Instagram URL
              </label>
              <input
                type="url"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/..."
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* TWITTER */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Twitter size={14} className="text-sky-500" /> Twitter URL
              </label>
              <input
                type="url"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/..."
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* LINKEDIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Linkedin size={14} className="text-[#0A66C2]" /> LinkedIn URL
              </label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/..."
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* MAIL ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Mail size={14} className="text-[#FF0000]" /> Mail ID
              </label>
              <input
                type="email"
                name="mail"
                value={formData.mail}
                onChange={handleChange}
                placeholder="5zOyI@example.com"
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* MAIL ID 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Mail size={14} className="text-[#FF0000]" /> Mail ID 2 (Optional)
              </label>
              <input
                type="email"
                name="mail2"
                value={formData.mail2}
                onChange={handleChange}
                placeholder="optional@example.com"
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Address  */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <MapPin size={14} className="text-[#FF0000]" /> Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* YOUTUBE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Youtube size={14} className="text-[#FF0000]" /> YouTube URL
              </label>
              <input
                type="url"
                name="youtube"
                value={formData.youtube}
                onChange={handleChange}
                placeholder="https://youtube.com/..."
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* STATUS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* ACTION BUTTONS */}
            <div className="md:col-span-3 flex justify-end gap-3 mt-4">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-1 text-sm rounded text-white ${isEdit
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-green-600 hover:bg-green-700"
                  } flex items-center gap-2`}
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {isEdit ? "Update Configuration" : "Save Configuration"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 flex items-center gap-2"
              >
                <X size={14} /> Cancel
              </button>
            </div>
          </form>
        </div>

        {/* ================= TABLE ================= */}
        <div className="relative overflow-x-auto bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-5 py-2 border-b bg-gray-200 border-gray-200">
            <h3 className="text-base font-medium text-gray-800">
              Configuration List
            </h3>
          </div>

          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium">S.No</th>
                <th className="px-4 py-3 font-medium">WhatsApp</th>
                <th className="px-4 py-3 font-medium">Call</th>
                <th className="px-4 py-3 font-medium">Social Links</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {!socialData ||
                (Array.isArray(socialData) && socialData.length === 0) ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-400">
                    No configuration saved yet.
                  </td>
                </tr>
              ) : (
                (Array.isArray(socialData) ? socialData : [socialData]).map(
                  (item, index) => (
                    <tr
                      key={item._id || index}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">{index + 1}.</td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {item.whatsappNumber}
                      </td>
                      <td className="px-4 py-3">{item.callNumber}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {item.facebook && (
                            <Facebook size={14} className="text-blue-600" />
                          )}
                          {item.instagram && (
                            <Instagram size={14} className="text-pink-600" />
                          )}
                          {item.youtube && (
                            <Youtube size={14} className="text-red-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${item.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                            }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-4">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                          >
                            <Edit size={14} /> Edit
                          </button>
                          <button
                            onClick={handleDelete}
                            className="text-red-600 hover:text-red-800 font-medium inline-flex items-center gap-1"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SocialMedia;
