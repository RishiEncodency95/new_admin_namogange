// c:\Projects\NamoGange\new_admin_namogange\src\pages\add_by_admin\AddSidebar.jsx

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createSidebar,
  getAllSidebars,
  updateSidebar,
  deleteSidebar,
} from "../../redux/slices/add_by_admin/addSidebarSlice";
import { showSuccess, showError } from "../../utils/toastService";
import adminBanner from "../../assets/banners/bg.jpg";
import useRoleRights from "../../hooks/useRoleRights";
import { PageNames } from "../../utils/constants";

const ICON_OPTIONS = [
  "MdDashboard",
  "MdPeople",
  "MdLogout",
  "MdCorporateFare",
  "MdVerified",
  "MdSupportAgent",
  "MdArticle",
  "MdQuestionAnswer",
  "MdCategory",
  "MdCardMembership",
  "MdOutlineVolunteerActivism",
  "FaChevronDown",
  "FaChevronUp",
  "FaRegBuilding",
  "GoPersonFill",
  "FiSliders",
  "FiSettings",
  "FiImage",
  "FiMail",
  "BiSolidInstitution",
  "AiFillHome",
  "SiOpenapiinitiative",
  "FaDatabase",
  "FaRegUser",
  "IoNewspaper",
  "PiNewspaperBold",
  "FaDonate",
  "HiTrendingUp",
  "FaChild",
  "FaPalette",
  "FaTheaterMasks",
  "IoIosInformationCircle",
  "SlSupport",
];

const SECTIONS = [
  "MAIN",
  "ABOUT SECTION",
  "INITIATIVES SECTION",
  "NGT EVENT SECTION",
  "UPDATE SECTION",
  "MEDIA SECTION",
  "SUPPORT SECTION",
  "CAREER SECTION",
  "CONTACT SECTION",
  "PARTNER SECTION",
  "ALL EVENT SECTION",
  "SEO MANAGEMENT",
  "ADMIN MANAGEMENT",
  "CONTENT SECTION",
];

const AddSidebar = () => {
  const dispatch = useDispatch();
  const { sidebars, loading } = useSelector((state) => state.sidebar || {});
  const authUser = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    _id: null,
    label: "",
    path: "",
    icon: "",
    section: "MAIN",
    parent_menu: "", // For nested items
    status: "Active",
    order_by: 0,
  });
  const [search, setSearch] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isEdit, setIsEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  /* ===== PAGINATION STATE ===== */
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    dispatch(getAllSidebars());
  }, [dispatch]);

  const { canRead, canWrite, canDelete, isFormDisabled } = useRoleRights(
    PageNames.ADD_SIDEBAR,
  );

  const filteredData = (sidebars || []).filter(
    (item) =>
      (item.label || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.section || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.parent_menu || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.action || "").toLowerCase().includes(search.toLowerCase()),
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const resetForm = () => {
    setFormData({
      _id: null,
      label: "",
      path: "",
      icon: "",
      section: "MAIN",
      parent_menu: "",
      status: "Active",
      order_by: 0,
    });
    setIsEdit(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.label) {
      showError("Label is required");
      return;
    }

    setIsSubmitting(true);
    const currentUserId = authUser?.id || null;
    const currentUserName = authUser?.username || "";

    try {
      const payload = {
        ...formData,
        user_id: currentUserId,
      };

      if (isEdit) {
        await dispatch(
          updateSidebar({
            id: formData._id,
            data: { ...payload, updated_by: currentUserId },
          }),
        ).unwrap();
        showSuccess("Sidebar item updated successfully");
      } else {
        await dispatch(
          createSidebar({ ...payload, created_by: currentUserId }),
        ).unwrap();
        showSuccess("Sidebar item added successfully");
      }
      dispatch(getAllSidebars());
      resetForm();
    } catch (err) {
      // console.error(err);
      showError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    const currentUserId = authUser?.id || null;
    if (window.confirm("Are you sure you want to delete this item?")) {
      dispatch(deleteSidebar({ id, user_id: currentUserId })).then(() => {
        showSuccess("Sidebar item deleted successfully");
        dispatch(getAllSidebars());
      });
    }
  };
  /* ===== PAGINATION LOGIC ===== */
  const totalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData?.slice(startIndex, endIndex) || [];

  const handleEdit = (item) => {
    setFormData({
      _id: item._id,
      label: item.label,
      path: item.path || "",
      icon: item.icon || "",
      section: item.section || "MAIN",
      parent_menu: item.parent_menu || "",
      status: item.status || "Active",
      order_by: item.order_by || 0,
    });
    setIsEdit(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter potential parents (items that are not children themselves)
  const parentOptions = sidebars?.filter((item) => !item.parent_menu) || [];
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
                Sidebar Management
              </h2>
              <p className="text-sm text-blue-100">
                Configure dynamic sidebar menu items.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-5">
        {/* FORM */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-base font-medium text-gray-800 mb-4">
            {isEdit ? "Update Sidebar Item" : "Add New Sidebar Item"}
          </h3>

          <form
            onSubmit={handleSubmit}
            className={`grid grid-cols-1 md:grid-cols-3 gap-3 ${
              isFormDisabled ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label <span className="text-red-500">*</span>
              </label>
              <input
                name="label"
                value={formData.label}
                onChange={handleChange}
                placeholder="Menu Label"
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Path
              </label>
              <input
                name="path"
                value={formData.path}
                onChange={handleChange}
                placeholder="/route-path"
                // required
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section <span className="text-red-500">*</span>
              </label>
              <select
                name="section"
                value={formData.section}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
              >
                {SECTIONS.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon
              </label>
              <select
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
              >
                <option value="">-- Select Icon --</option>
                {ICON_OPTIONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Menu (Optional)
              </label>
              {/* <input
                                name="parent_menu"
                                value={formData.parent_menu}
                                onChange={handleChange}
                                placeholder="parent"
                                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                            /> */}
              <select
                name="parent_menu"
                value={formData.parent_menu}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
              >
                <option value="">-- None (Root Item) --</option>
                {parentOptions.map((item) => (
                  <option key={item._id} value={item.label}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order By
              </label>
              <input
                type="number"
                name="order_by"
                value={formData.order_by}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="md:col-span-4 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting || isFormDisabled}
                className="px-5 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isFormDisabled}
                className={`px-6 py-1.5 text-sm rounded text-white ${
                  isEdit
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isSubmitting
                  ? "Processing..."
                  : isEdit
                    ? "Update Item"
                    : "Add Item"}
              </button>
            </div>
          </form>
        </div>

        {/* LIST */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200  flex flex-wrap gap-4 justify-between">
            <h3 className="text-base font-medium text-gray-800">
              Sidebar Items
            </h3>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 shadow-md rounded px-2 py-1 text-sm"
            >
              {[5, 10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  Show {n} Entries
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 shadow-md rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-medium">S.No</th>
                  <th className="px-4 py-3 font-medium">Label</th>
                  <th className="px-4 py-3 font-medium">Path</th>
                  <th className="px-4 py-3 font-medium">Section</th>
                  <th className="px-4 py-3 font-medium">Parent</th>
                  <th className="px-4 py-3 font-medium">Icon</th>
                  <th className="px-4 py-3 font-medium">Order By</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  {(canWrite || canDelete) && (
                    <th className="px-4 py-3 font-medium">Action</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading && (!sidebars || sidebars.length === 0) ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
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
                      <td className="px-4 py-3 font-medium">{item.label}</td>
                      <td className="px-4 py-3">{item.path || "-"}</td>
                      <td className="px-4 py-3">{item.section}</td>
                      <td className="px-4 py-3">{item.parent_menu || "-"}</td>
                      <td className="px-4 py-3">{item.icon || "-"}</td>
                      <td className="px-4 py-3">{item.order_by || 0}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            item.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      {(canWrite || canDelete) && (
                        <td className="px-4 py-3 flex gap-3">
                          {canWrite && (
                            <button
                              className="text-green-600 hover:underline"
                              onClick={() => handleEdit(item)}
                            >
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              className="text-red-600 hover:underline"
                              onClick={() => handleDelete(item._id)}
                            >
                              Delete
                            </button>
                          )}
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
                {Math.min(endIndex, filteredData?.length || 0)} of{" "}
                {filteredData?.length || 0}
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
                    <span key={`ellipsis-${i}`} className="px-3 h-8 border">
                      …
                    </span>
                  ) : (
                    <button
                      // key={p}
                      key={`page-${p}-${i}`}
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
    </div>
  );
};

export default AddSidebar;
