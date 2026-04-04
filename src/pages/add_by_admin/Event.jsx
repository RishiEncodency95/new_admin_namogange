import React, { useState, useEffect, useRef } from "react";
import TiptapEditor from "../../components/TiptapEditor";
import { useDispatch, useSelector } from "react-redux";
import { showSuccess, showError } from "../../utils/toastService";
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../../redux/slices/add_by_admin/eventSlice";
import useRoleRights from "../../hooks/useRoleRights";
import { PageNames } from "../../utils/constants";

const Event = () => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    _id: null,
    name: "",
    start_date: "",
    end_date: "",
    reporting_point: "",
    coordinator_contact: "",
    reporting_time: "",
    HSN_code: "",
    link: "",
    image: null,
    imagePreview: "",
    image_alt: "",
    description: "",
    status: "Active",
  });

  const [isEdit, setIsEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const { events, loading } = useSelector((state) => state.event);
  console.log("EVENTS..", events);
  const authUser = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    dispatch(getAllEvents());
  }, [dispatch]);

  const { canRead, canWrite, canDelete, isFormDisabled } = useRoleRights(
    PageNames.ADD_EVENT,
  );

  /* ===== PAGINATION STATE ===== */
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  /* ===== HANDLERS ===== */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files?.[0]) {
      const file = files[0];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (file.size > maxSize) {
        showError("Image size must be less than 10MB");
        e.target.value = ""; // Input UI clear karne ke liye
        setForm({ ...form, image: null, imagePreview: "" });
        return;
      }

      setForm({
        ...form,
        image: file,
        imagePreview: URL.createObjectURL(file),
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };
  const resetForm = () => {
    setForm({
      _id: null,
      name: "",
      start_date: "",
      end_date: "",
      reporting_point: "",
      coordinator_contact: "",
      reporting_time: "",
      HSN_code: "",
      link: "",
      image: null,
      imagePreview: "",
      image_alt: "",
      description: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    const currentUserId = authUser?.id || null;
    const currentUserName = authUser?.username || "";

    const dataToSend = new FormData();
    dataToSend.append("name", form.name);
    dataToSend.append("start_date", form.start_date);
    dataToSend.append("end_date", form.end_date);
    dataToSend.append("reporting_point", form.reporting_point);
    dataToSend.append("coordinator_contact", form.coordinator_contact);
    dataToSend.append("reporting_time", form.reporting_time);
    dataToSend.append("HSN_code", form.HSN_code);
    dataToSend.append("link", form.link);
    dataToSend.append("description", form.description);
    dataToSend.append("status", form.status);
    dataToSend.append("image_alt", form.image_alt);
    if (form.image instanceof File) {
      dataToSend.append("image", form.image);
    }
    console.log(dataToSend, "DATA TO SEND", form);

    try {
      if (isEdit) {
        dataToSend.append("updated_by", currentUserName);
        dataToSend.append("user_id", currentUserId);
        await dispatch(
          updateEvent({ id: form._id, data: dataToSend }),
        ).unwrap();
        showSuccess("Event updated successfully ✅");
      } else {
        dataToSend.append("created_by", currentUserName);
        dataToSend.append("user_id", currentUserId);
        await dispatch(createEvent(dataToSend)).unwrap();
        showSuccess("Event added successfully ✅");
      }
      dispatch(getAllEvents());
      resetForm();
      setCurrentPage(1);
    } catch (err) {
      console.log(err);
      showError(err || "Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async (id) => {
    const currentUserId = authUser?.id || null;
    try {
      await dispatch(deleteEvent({ id, user_id: currentUserId })).unwrap();
      showSuccess("Event deleted successfully");
      dispatch(getAllEvents());
    } catch (error) {
      showError("Failed to delete event", error);
    }
  };
  /* ===== PAGINATION LOGIC ===== */
  const totalPages = Math.ceil((events?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = events?.slice(startIndex, endIndex) || [];

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
                Event Management
              </h2>
              <p className="text-sm text-blue-100">
                Add or update Event content including reporting details.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-3 p-5">
        {/* ================= FORM ================= */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-base font-medium text-gray-800 mb-4">
            {isEdit ? "Update Event" : "Add New Event"}
          </h3>

          <form
            onSubmit={handleSubmit}
            className={`grid grid-cols-1 md:grid-cols-3 gap-3 ${isFormDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                type="text"
                placeholder="Event Name"
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                min={form.start_date || new Date().toISOString().split("T")[0]}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                name="reporting_point"
                value={form.reporting_point}
                onChange={handleChange}
                type="text"
                placeholder="Location"
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coordinator Contact
              </label>

              <input
                name="coordinator_contact"
                type="tel"
                placeholder="Coordinator Contact"
                value={form.coordinator_contact}
                maxLength={10}
                inputMode="numeric"
                pattern="[0-9]{10}"
                onChange={(e) => {
                  const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
                  if (onlyNumbers.length <= 10) {
                    handleChange({
                      target: {
                        name: "coordinator_contact",
                        value: onlyNumbers,
                      },
                    });
                  }
                }}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reporting Time
              </label>

              <input
                type="text"
                name="reporting_time"
                placeholder="HH:MM"
                value={form.reporting_time}
                maxLength={5}
                onChange={(e) => {
                  let value = e.target.value;

                  // allow only digits and :
                  value = value.replace(/[^0-9:]/g, "");

                  // prevent multiple :
                  if ((value.match(/:/g) || []).length > 1) return;

                  setForm((prev) => ({
                    ...prev,
                    reporting_time: value,
                  }));
                }}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HSN Code
              </label>
              <input
                name="HSN_code"
                type="text"
                value={form.HSN_code}
                onChange={handleChange}
                placeholder="HSN Code"
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Link
              </label>
              <input
                type="url"
                name="link"
                value={form.link}
                onChange={handleChange}
                placeholder="Event Link"
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image (size: 641x641) {!isEdit && <span className="text-red-500">*</span>}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                name="image"
                accept="image/*"
                required={!isEdit}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
              />
              {/* Image Preview Section */}
              {form.imagePreview && (
                <div className="mt-3 p-1 border rounded bg-gray-50 inline-block shadow-sm">
                  <img
                    src={form.imagePreview}
                    alt="Preview"
                    className="h-24 w-auto object-cover rounded"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image Alt
              </label>
              <input
                type="text"
                name="image_alt"
                value={form.image_alt}
                placeholder="Image Alt"
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                required
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isFormDisabled}
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>

            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>

              <TiptapEditor
                value={form.description}
                onChange={(html) =>
                  setForm((prev) => ({ ...prev, description: html }))
                }
                isReadOnly={isFormDisabled}
              />
            </div>

            <div className="md:col-span-4 flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting || isFormDisabled}
                className={`px-5 py-1.5 border text-sm rounded hover:bg-gray-100 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isFormDisabled}
                className={`px-6 py-1.5 text-sm rounded text-white ${isEdit ? "bg-blue-600" : "bg-green-600"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isSubmitting
                  ? "Processing..."
                  : isEdit
                    ? "Update Event"
                    : "Add Event"}{" "}
              </button>
            </div>
          </form>
        </div>

        {/* ================= TABLE ================= */}
        <div className="relative overflow-x-auto bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-5 py-2 border-b bg-gray-200 border-gray-200">
            <h3 className="text-base font-medium text-gray-800">Events List</h3>
          </div>
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 border-b  border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium">S.No</th>
                <th className="px-4 py-3 font-medium">Event Name</th>
                <th className="px-4 py-3 font-medium">Start Date</th>
                <th className="px-4 py-3 font-medium">End Date</th>
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {(canWrite || canDelete) && (
                  <th className="px-4 py-3 font-medium">Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading && events?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : (
                currentData.map((item, i) => (
                  <tr
                    key={item._id || i}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">{startIndex + i + 1}.</td>
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3">
                      {item.start_date
                        ? new Date(item.start_date).toLocaleDateString()
                        : ""}
                    </td>
                    <td className="px-4 py-3">
                      {item.end_date
                        ? new Date(item.end_date).toLocaleDateString()
                        : ""}
                    </td>
                    <td className="px-4 py-3">
                      <img
                        src={item.image || "/placeholder.png"}
                        alt="Initiative"
                        className="h-10 w-20 object-cover rounded border border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-medium
          ${item.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                          }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    {(canWrite || canDelete) && (
                      <td className="px-4 py-3">
                        {canWrite && (
                          <button
                            className="text-green-600 mr-3"
                            onClick={() => {
                              setForm({
                                ...item,
                                start_date: item.start_date
                                  ? item.start_date.split("T")[0]
                                  : "",
                                end_date: item.end_date
                                  ? item.end_date.split("T")[0]
                                  : "",
                                image: null,
                                imagePreview: item.image,
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
                            className="text-red-600"
                            onClick={() => {
                              handleDelete(item._id);
                            }}
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
              Showing {startIndex + 1}–{Math.min(endIndex, events?.length || 0)}{" "}
              of {events?.length || 0}
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

export default Event;
