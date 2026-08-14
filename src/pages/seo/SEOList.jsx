import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllSeo, deleteSeo } from "../../redux/slices/seo/seoSlice";
import { showSuccess, showError } from "../../utils/toastService";
import useRoleRights from "../../hooks/useRoleRights";
import { PageNames } from "../../utils/constants";
import Swal from "sweetalert2";

const SEOList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { seoList, loading, error } = useSelector((state) => state.seo || {});
  const authUser = JSON.parse(sessionStorage.getItem("user"));
  const currentUserId = authUser?._id || authUser?.id;

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState("");

  const {
    canRead: canAdd,
    canWrite,
    canDelete,
  } = useRoleRights(PageNames.SEO || "SEO");

  useEffect(() => {
    dispatch(getAllSeo());
  }, [dispatch]);

  // useEffect(() => {
  //   if (error) {
  //     const msg = error?.message || error?.data?.message || error;
  //     if (msg === "Invalid token") {
  //       sessionStorage.removeItem("user");
  //       sessionStorage.removeItem("token");
  //       navigate("/");
  //     } else {
  //       showError(msg);
  //     }
  //   }
  // }, [error, navigate]);

  /* ===== FILTER DATA ===== */
  const filteredData = (seoList || []).filter(
    (item) =>
      item.page_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.metaTitle?.toLowerCase().includes(search.toLowerCase()),
  );

  /* ===== PAGINATION LOGIC ===== */
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

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

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteSeo({ id, user_id: currentUserId })).unwrap();
      showSuccess("SEO record deleted successfully.");
      dispatch(getAllSeo());
    } catch (error) {
      showError(error?.message || "Failed to delete SEO record.");
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
              <h2 className="text-xl font-semibold text-white">
                SEO Management
              </h2>
              <p className="text-sm text-blue-100">
                Add or update SEO meta tags for website pages.
              </p>
            </div>
          </div>
          <div>
            {/* {canAdd && ( */}
            <button
              onClick={() => navigate("/seo/add-seo")}
              className="bg-blue-500 hover:bg-blue-600 text-sm text-white font-medium py-1 px-4 rounded"
            >
              {" "}
              Add SEO
            </button>
            {/* )} */}
          </div>
        </div>
      </div>

      <div className="space-y-3 p-5">
        {/* ================= TABLE ================= */}
        <div className="relative overflow-x-auto bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-5 bg-gray-200  py-2 border-b border-gray-200 flex flex-wrap gap-4 justify-between">
            <h3 className="text-base font-medium text-gray-800">SEO List</h3>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="
    border border-gray-300
    ring-0 ring-gray-300
    rounded-md
    bg-gray-50
    px-2 py-0
    text-sm
    shadow-sm
    focus:outline-none
    focus:ring-0 focus:ring-blue-500
    focus:border-blue-500
  "
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
              className="
    border border-gray-300
    ring-0 ring-gray-300
    rounded-md
    bg-white
    px-2 py-1
    text-sm
    shadow-sm
    focus:outline-none
    focus:ring-0 focus:ring-blue-500
    focus:border-blue-500
  "
            />
          </div>

          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 border-b  border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium">S.No</th>
                <th className="px-4 py-3 font-medium">Page Name</th>
                <th className="px-4 py-3 font-medium">Meta Title</th>
                <th className="px-4 py-3 font-medium">OG</th>
                <th className="px-4 py-3 font-medium">Twitter</th>
                <th className="px-4 py-3 font-medium">Robots</th>
                <th className="px-4 py-3 font-medium">Canonical</th>
                <th className="px-4 py-3 font-medium">Banner </th>
                <th className="px-4 py-3 font-medium">Status</th>
                {(canWrite || canDelete) && (
                  <th className="px-4 py-3 font-medium">Action</th>
                )}
              </tr>
            </thead>

            <tbody>
              {loading && (!seoList || seoList.length === 0) ? (
                <tr>
                  <td colSpan="11" className="text-center py-4">
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
                    <td className="px-4 py-3 font-medium">{item.page_name}</td>
                    <td className="px-4 py-3">{item.metaTitle}</td>
                    <td className="px-4 py-3">
                      {item.og_title || item.og_description ? (
                        <span
                          className="px-3 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-700"
                          title={item.og_description || "OG Title set"}
                        >
                          {item.og_title || "OG Description"}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Auto</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600">
                        {item.twitter_card || "summary_large_image"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-medium ${
                          item.robots_index === "noindex" ||
                          item.robots_follow === "nofollow"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.robots_index || "index"},{" "}
                        {item.robots_follow || "follow"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.canonical_url ? (
                        <a
                          href={item.canonical_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline max-w-[200px] truncate inline-block align-bottom"
                        >
                          {item.canonical_url}
                        </a>
                      ) : (
                        <span className="text-gray-400">Auto</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <img
                        src={item?.page_banner || "/placeholder.png"}
                        alt={item?.image_alt || "Objective"}
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
                                navigate("/seo/add-seo", {
                                  state: item,
                                });
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
              Showing {startIndex + 1}–{Math.min(endIndex, filteredData.length)}{" "}
              of {filteredData.length}
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

export default SEOList;
