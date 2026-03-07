import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllSidebars } from "../redux/slices/add_by_admin/addSidebarSlice";
import { getAllRoleRights } from "../redux/slices/role_rights/roleRightsSlice";
import {
  MdDashboard,
  MdPeople,
  MdLogout,
  MdCorporateFare,
  MdVerified,
  MdSupportAgent,
  MdArticle,
  MdQuestionAnswer,
  MdCategory,
  MdCardMembership,
  MdOutlineVolunteerActivism,
} from "react-icons/md";
import { FaChevronDown, FaChevronUp, FaRegBuilding } from "react-icons/fa";
import { GoPersonFill } from "react-icons/go";
import { FiSliders, FiSettings, FiImage, FiMail } from "react-icons/fi";
import { BiSolidInstitution } from "react-icons/bi";
import { AiFillHome } from "react-icons/ai";
import { SiOpenapiinitiative } from "react-icons/si";
import { FaDatabase, FaRegUser } from "react-icons/fa6";
import { IoNewspaper } from "react-icons/io5";
import { PiNewspaperBold } from "react-icons/pi";
import { FaDonate } from "react-icons/fa";
import { HiTrendingUp } from "react-icons/hi";
import { FaChild } from "react-icons/fa";
import { FaPalette } from "react-icons/fa";
import { FaTheaterMasks } from "react-icons/fa";
import { IoIosInformationCircle } from "react-icons/io";
import { SlSupport } from "react-icons/sl";

// Icon Mapping
const iconMap = {
  MdDashboard,
  MdPeople,
  MdLogout,
  MdCorporateFare,
  MdVerified,
  MdSupportAgent,
  MdArticle,
  MdQuestionAnswer,
  MdCategory,
  MdCardMembership,
  MdOutlineVolunteerActivism,
  FaChevronDown,
  FaChevronUp,
  FaRegBuilding,
  GoPersonFill,
  FiSliders,
  FiSettings,
  FiImage,
  FiMail,
  BiSolidInstitution,
  AiFillHome,
  SiOpenapiinitiative,
  FaDatabase,
  FaRegUser,
  IoNewspaper,
  PiNewspaperBold,
  FaDonate,
  HiTrendingUp,
  FaChild,
  FaPalette,
  FaTheaterMasks,
  IoIosInformationCircle,
  SlSupport,
};

const SECTION_ORDER = [
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

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [openMenu, setOpenMenu] = useState("Drivers");
  const { sidebars } = useSelector((state) => state.sidebar || {});
  const { roleRightsList } = useSelector((state) => state.roleRights || {});

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };
  /* ======================
     SIDEBAR CONFIG (JSON)
  ====================== */
  // const sidebarData1 = [
  //   {
  //     section: "MAIN",
  //     items: [
  //       { label: "Dashboard", path: "/dashboard", icon: MdDashboard },
  //       {
  //         label: "Home Banner",
  //         icon: FiSliders,
  //         path: "/home-banner",
  //       },
  //       { label: "Objective", path: "/objective", icon: MdCorporateFare },
  //       { label: "Testimonial", path: "/testimonial", icon: MdCorporateFare },
  //       { label: "Initiatives", path: "/initiatives", icon: MdCorporateFare },
  //       { label: "Achievements", path: "/achievements", icon: MdCorporateFare },
  //       {
  //         label: "Media",
  //         icon: FiImage,
  //         children: [
  //           { label: "Photos Gallery", path: "/media/photos-gallery" },
  //           { label: "Videos Gallery", path: "/media/videos-gallery" },
  //         ],
  //       },
  //       {
  //         label: "Trust Bodies",
  //         icon: FiImage,
  //         children: [
  //           {
  //             label: "Add Trust Bodies",
  //             path: "/trust-bodies/add-trust-bodies",
  //           },
  //           {
  //             label: "Trust Bodies List",
  //             path: "/trust-bodies/trust-bodies-list",
  //           },
  //         ],
  //       },
  //       {
  //         label: "Resent Updates",
  //         icon: FaRegBuilding,
  //         children: [
  //           { label: "Add News Updates", path: "/news/add-news-updates" },
  //           { label: "News Updates List", path: "/news/news-updates-list" },
  //         ],
  //       },
  //       { label: "News Letters", path: "/news-letters", icon: PiNewspaperBold },
  //       {
  //         label: "Blogs",
  //         icon: MdArticle,
  //         children: [
  //           { label: "Add Blog", path: "/blogs/add-blog" },
  //           { label: "Blog List", path: "/blogs/blog-list" },
  //         ],
  //       },
  //       { label: "FAQ", path: "/faq", icon: MdQuestionAnswer },
  //       {
  //         label: "Enquiry List",
  //         path: "/enquiry/enquiry-list",
  //         icon: IoIosInformationCircle,
  //       },
  //       {
  //         label: "Support List",
  //         path: "/support/support-list",
  //         icon: SlSupport,
  //       },
  //     ],
  //   },
  //   {
  //     section: "PARTNER SECTION",
  //     items: [
  //       {
  //         label: "Member",
  //         icon: MdCardMembership,
  //         children: [
  //           { label: "Add Member", path: "/member/add-member" },
  //           { label: "Member List", path: "/member/member-list" },
  //         ],
  //       },
  //       {
  //         label: "Volunteer",
  //         icon: MdOutlineVolunteerActivism,
  //         children: [
  //           { label: "Add Volunteer", path: "/volunteer/add-volunteer" },
  //           { label: "Volunteer List", path: "/volunteer/volunteer-list" },
  //         ],
  //       },
  //       {
  //         label: "Donation",
  //         icon: FaDonate,
  //         children: [
  //           { label: "Add Donation", path: "/donation/add-donation" },
  //           { label: "Donation List", path: "/donation/donation-list" },
  //         ],
  //       },
  //     ],
  //   },
  //   {
  //     section: "EVENT SECTION",
  //     items: [
  //       {
  //         label: "16th AGS Section",
  //         icon: GoPersonFill,
  //         children: [
  //           { label: "Web Enquiry", path: "/16th-ags-section/web-enquiry" },
  //           { label: "Delegates", path: "/16th-ags-section/delegate-list" },
  //           { label: "New Data", path: "/16th-ags-section/new-data" },
  //           { label: "Warm Data", path: "/16th-ags-section/warm-data" },
  //           { label: "Hot Data", path: "/16th-ags-section/hot-data" },
  //           { label: "Cold Data", path: "/16th-ags-section/cold-data" },
  //           {
  //             label: "Master Delegate Data",
  //             path: "/16th-ags-section/master-delegate-data",
  //           },
  //         ],
  //       },
  //       {
  //         label: "TGMY",
  //         icon: HiTrendingUp,
  //         children: [
  //           { label: "Add New Contestants", path: "/tgym/add-contestant" },
  //           { label: "General Contestants", path: "/tgym/general-contestant" },
  //           {
  //             label: "Follow UP Contestants",
  //             path: "/tgym/follow-up-contestant",
  //           },
  //           { label: "Hot Contestants", path: "/tgym/hot-contestant" },
  //           {
  //             label: "Audition Contestants",
  //             path: "/tgym/audition-contestant",
  //           },
  //           { label: "Video Contestants", path: "/tgym/video-contestant" },
  //           { label: "Finale Contestants", path: "/tgym/finale-contestant" },
  //           { label: "Master Contestants", path: "/tgym/master-contestant" },
  //           {
  //             label: "Not Intr. Contestants",
  //             path: "/tgym/not-intr-contestant",
  //           },
  //         ],
  //       },
  //       {
  //         label: "Baccho Ki Rangshala",
  //         icon: FaChild,
  //         children: [
  //           {
  //             label: "Add Rangshala",
  //             path: "/baccho-ki-rangshala/add-rangshala",
  //           },
  //           {
  //             label: "Rangshala List",
  //             path: "/baccho-ki-rangshala/rangshala-list",
  //           },
  //         ],
  //       },
  //       {
  //         label: "Painting Competition",
  //         icon: FaPalette,
  //         children: [
  //           {
  //             label: "Add Painting",
  //             path: "/painting-competition/add-painting",
  //           },
  //           {
  //             label: "Painting List",
  //             path: "/painting-competition/painting-list",
  //           },
  //         ],
  //       },
  //       {
  //         label: "Nukkad Natak",
  //         icon: FaTheaterMasks,
  //         children: [
  //           { label: "Add Natak", path: "/nukkad-natak/add-natak" },
  //           { label: "Natak List", path: "/nukkad-natak/natak-list" },
  //         ],
  //       },
  //     ],
  //   },

  //   {
  //     section: "ADMIN MANAGEMENT",
  //     items: [
  //       {
  //         label: "Add By Admin",
  //         icon: FaDatabase,
  //         children: [
  //           { label: "Add Occupation", path: "/add_by_admin/add-occupation" },
  //           {
  //             label: "Add Organization",
  //             path: "/add_by_admin/organization ",
  //           },
  //           { label: "Add Designation", path: "/add_by_admin/designation" },
  //           { label: "Add Department", path: "/add_by_admin/department" },
  //           { label: "Add Category", path: "/add_by_admin/category" },
  //           { label: "Add Profession", path: "/add_by_admin/profession" },
  //           { label: "Add Event", path: "/add_by_admin/event" },
  //           { label: "Add Status", path: "/add_by_admin/status" },
  //           { label: "Add University", path: "/add_by_admin/university" },
  //           { label: "Add Source", path: "/add_by_admin/source" },
  //           { label: "Add Enquiry", path: "/add_by_admin/enquiry" },
  //           { label: "Add Data", path: "/add_by_admin/data" },
  //           { label: "Add Target", path: "/add_by_admin/target" },
  //           { label: "Add Published", path: "/add_by_admin/published" },
  //           {
  //             label: "Add Coordinator Status",
  //             path: "/add_by_admin/coordinator",
  //           },
  //           { label: "Add Bank", path: "/add_by_admin/bank" },
  //           { label: "Image Category", path: "/add_by_admin/image-category" },
  //           { label: "Add IP", path: "/add_by_admin/ip" },
  //           { label: "Add Role", path: "/add_by_admin/role" },
  //         ],
  //       },

  //       {
  //         label: "Users",
  //         icon: FaRegUser,
  //         children: [
  //           { label: "Add User", path: "/users/user" },
  //           // { label: "Activity Log", path: "/users/activity-log" },
  //         ],
  //       },
  //       {
  //         label: "Colleges",
  //         icon: BiSolidInstitution,
  //         children: [
  //           { label: "Add College", path: "/collage/add-college" },
  //           { label: "College List", path: "/collage/college-list" },
  //         ],
  //       },
  //       { label: "Role Rights", icon: PiNewspaperBold, path: "/role-rights" },
  //     ],
  //   },

  //   // {
  //   //   section: "CONTENT",
  //   //   items: [{ label: "FAQ", path: "/faq", icon: MdQuestionAnswer }],
  //   // },
  // ];

  useEffect(() => {
    dispatch(getAllSidebars());
    dispatch(getAllRoleRights());
  }, [dispatch]);

  /* ======================
     TRANSFORM DATA
  ====================== */

  const processSidebarData = () => {
    if (!sidebars || sidebars.length === 0) return [];

    const user = JSON.parse(localStorage.getItem("user"));
    const userRole = user?.role;

    let allowedPages = null;
    if (roleRightsList && userRole) {
      const roleRights = roleRightsList.find((r) => r.role === userRole);
      if (roleRights) {
        allowedPages = roleRights.permissions
          .filter((p) => p.read)
          .map((p) => p.page);
      }
    }

    // 1. Group by Section
    // Sort sidebars by order first so children and parents are processed in order
    const sortedSidebars = [...sidebars].sort(
      (a, b) => (a.order_by || 0) - (b.order_by || 0),
    );

    const sections = {};
    const rootItems = [];
    const childItems = {};

    // Separate root items and children
    sortedSidebars.forEach((item) => {
      if (item.status !== "Active") return;

      if (allowedPages && !allowedPages.includes(item.label)) {
        return;
      }

      // Trim strings to ensure matching works even with accidental spaces
      const parent = item.parent_menu ? item.parent_menu.trim() : null;
      if (parent) {
        if (!childItems[parent]) childItems[parent] = [];
        childItems[parent].push(item);
        // rootItems.push(item);
      } else {
        rootItems.push(item);
      }
    });

    // Build structure
    rootItems.forEach((item) => {
      if (!sections[item.section]) sections[item.section] = [];

      const label = item.label ? item.label.trim() : "";
      const children = childItems[label];

      sections[item.section].push({
        ...item,
        children: children && children.length > 0 ? children : undefined,
      });
    });

    // Convert to array format expected by render
    return Object.keys(sections)
      .sort((a, b) => {
        const indexA = SECTION_ORDER.indexOf(a);
        const indexB = SECTION_ORDER.indexOf(b);
        // If both are in the list, sort by index
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        // If only a is in list, it comes first
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return 0;
      })
      .map((sectionName) => ({
        section: sectionName,
        items: sections[sectionName],
      }));
  };

  const sidebarData = processSidebarData();

  return (
    <aside className="relative w-64 shrink-0 bg-white shadow-md h-screen flex flex-col">
      <div className="pointer-events-none absolute top-0 right-0 w-[3px] h-full bg-gradient-to-b from-orange-200 via-cyan-200 to-blue-300 z-50"></div>

      {/* LOGO */}
      <div className="h-15 px-4 flex justify-center items-center shadow-md bg-gradient-to-r from-orange-50 via-cyan-50 to-blue-50">
        <img
          src="/namo_gange.png"
          alt="Namo Gange"
          className="h-14 w-auto object-contain"
        />
      </div>

      {/* MENU */}
      <div className="flex-1 overflow-y-auto px-1.5 py-3">
        {sidebarData.map((section) => (
          <div key={section.section} className="mb-4">
            <p className="text-xs text-gray-500 font-medium px-3 mb-1">
              {section.section}
            </p>

            {section.items.map((item) => {
              const Icon = iconMap[item.icon] || MdDashboard;
              // const Icon = item.icon;
              /* ===== NESTED MENU ===== */
              if (item.children) {
                const isOpen = openMenu === item.label;

                return (
                  <div key={item.label}>
                    <div
                      onClick={() => setOpenMenu(isOpen ? "" : item.label)}
                      className="flex items-center justify-between px-4 py-1.5 rounded cursor-pointer text-sm text-gray-700 hover:bg-gradient-to-r from-orange-100 via-cyan-50 to-blue-100"
                    >
                      <div className="flex items-center gap-4">
                        <Icon />
                        {item.label}
                      </div>
                      {isOpen ? (
                        <FaChevronUp size={12} />
                      ) : (
                        <FaChevronDown size={12} />
                      )}
                    </div>

                    {isOpen && (
                      <div className="ml-6 mt-1 space-y-0.5">
                        {item.children.map((child) => {
                          const ChildIcon = iconMap[child.icon];
                          // const ChildIcon = child.icon;
                          return (
                            <div
                              key={child.path}
                              onClick={() => navigate(child.path)}
                              className={`flex items-center gap-3 px-4 py-1 rounded cursor-pointer text-[13px]
                                ${
                                  isActive(child.path)
                                    ? "bg-gradient-to-r from-orange-100 via-cyan-50 to-blue-100 text-[#0C55A0] font-medium"
                                    : "text-gray-700 hover:bg-gradient-to-r from-orange-100 via-cyan-50 to-blue-100"
                                }`}
                            >
                              {/* <ChildIcon size={14} /> */}
                              {child.label}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              /* ===== NORMAL MENU ===== */
              return (
                <div
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-3 px-4 py-1.5 rounded cursor-pointer text-sm
                    ${
                      isActive(item.path)
                        ? "bg-gradient-to-r from-orange-100 via-cyan-50 to-blue-100 text-[#0C55A0] font-medium"
                        : "text-gray-700 hover:bg-gradient-to-r from-orange-100 via-cyan-50 to-blue-100"
                    }`}
                >
                  <Icon />
                  {item.label}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* LOGOUT */}
      <div className="p-4 border-t-3 border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-1.5 rounded-md text-sm"
        >
          {" "}
          <MdLogout />
          Logout
        </button>
      </div>
    </aside>
  );
}
