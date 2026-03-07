import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/Dashboard";
import PhotosGallery from "./pages/media/PhotosGallery";
import VideosGallery from "./pages/media/VideosGallery";
import HomeBanner from "./pages/home-banner/HomeBanner";
import AddOccupation from "./pages/add_by_admin/AddOccupation";
import AddOrganization from "./pages/add_by_admin/AddOrganization";
import Designation from "./pages/add_by_admin/Designation";
import Department from "./pages/add_by_admin/Department";
import Category from "./pages/add_by_admin/Category";
import Profession from "./pages/add_by_admin/Profession";
import Status from "./pages/add_by_admin/Status";
import University from "./pages/add_by_admin/University";
import Enquire from "./pages/add_by_admin/Enquire";
import Data from "./pages/add_by_admin/Data";
import CoordinatorStatus from "./pages/add_by_admin/CoordinatorStatus";
import Event from "./pages/add_by_admin/Event";
import Source from "./pages/add_by_admin/Source";
import Target from "./pages/add_by_admin/Target";
import Bank from "./pages/add_by_admin/Bank";
import ImageCategory from "./pages/add_by_admin/ImageCategory";
import User from "./pages/users/User";
import ListMember from "./pages/member/ListMember";
import AddMember from "./pages/member/AddMember";
import VolunteerOverview from "./pages/volunteer/VolunteerOverview";
import MemberOverview from "./pages/member/MemberOverview";
import AddVolunteer from "./pages/volunteer/AddVolunteer";
import ListVolunteer from "./pages/volunteer/ListVolunteer";
import ActivityLog from "./pages/users/ActivityLog";
import Initiatives from "./pages/initiatives/Initiatives";
import AddTrustBodies from "./pages/trust-bodies/AddTrustBodies";
import TrustBodiesList from "./pages/trust-bodies/TrustBodiesList";
import AddNewsUpdates from "./pages/news-updates/AddNewsUpdates";
import NewsUpdatesList from "./pages/news-updates/NewsUpdatesList";
import NewsLetters from "./pages/news-letters/NewsLetters";
import AddBlog from "./pages/blogs/AddBlog";
import BlogList from "./pages/blogs/BlogList";
import Faq from "./pages/faq/Faq";
import AddCollege from "./pages/colleges/AddCollege";
import CollegeList from "./pages/colleges/CollegeList";
import EnquiryList from "./pages/enquiry-list/EnquiryList";
import SupportList from "./pages/support-list/SupportList";
import AddDonation from "./pages/donation/AddDonation";
import DonationList from "./pages/donation/DonationList";
import WebEnquiry from "./pages/16th-ags-section/WebEnquiry";
import Delegates from "./pages/16th-ags-section/Delegates";
import NewData from "./pages/16th-ags-section/NewData";
import WarmData from "./pages/16th-ags-section/WarmData";
import HotData from "./pages/16th-ags-section/HotData";
import ColdData from "./pages/16th-ags-section/ColdData";
import MasterDelegateData from "./pages/16th-ags-section/MasterDelegateData";
import AGSAddData from "./pages/16th-ags-section/AGSAddData";
import AgsOverview from "./pages/16th-ags-section/AgsOverview";
import AGSEditData from "./pages/16th-ags-section/AGSEditData";
import AgsPayment from "./pages/16th-ags-section/AgsPayment";
import Receipt from "./pages/16th-ags-section/Receipt";
import AddNewContestants from "./pages/tgym/AddNewContestants";
import GeneralContestant from "./pages/tgym/GeneralContestant";
import TgymOverview from "./pages/tgym/TgymOverview";
import EditContestant from "./pages/tgym/EditContestant";
import TgymPayment from "./pages/tgym/TgymPayment";
import FollowUpContestant from "./pages/tgym/FollowUpContestant";
import HotContestant from "./pages/tgym/HotContestant";
import AuditionContestant from "./pages/tgym/AuditionContestant";
import VideoContestant from "./pages/tgym/VideoContestant";
import FinaleContestant from "./pages/tgym/FinaleContestant";
import MasterContestants from "./pages/tgym/MasterContestants";
import NotInterested from "./pages/tgym/NotInterested";
import AddRangshala from "./pages/baccho-ki-rangshala/AddRangshala";
import RangshalaList from "./pages/baccho-ki-rangshala/RangshalaList";
import PaintingList from "./pages/painting-competition/PaintingList";
import AddPainting from "./pages/painting-competition/AddPainting";
import AddNatak from "./pages/nukkad-natak/AddNatak";
import NatakList from "./pages/nukkad-natak/NatakList";
import Objective from "./pages/objective/Objective";
import Achievements from "./pages/achievements/Achievements";
import Testimonial from "./pages/testimonial/Testimonial";
import Login from "./pages/auth/Login";
import ProtectedRoute from "./layouts/ProtectedRoute";
import Published from "./pages/add_by_admin/Published";
import IP from "./pages/add_by_admin/IP";
import Role from "./pages/add_by_admin/Role";
import RoleRights from "./pages/role_rights/RoleRights";
import AddSidebar from "./pages/add_by_admin/AddSidebar";
import Overview from "./pages/overview/Overview";
import AGSEvent from "./pages/add_by_admin/AGSEvent";
import AddSEO from "./pages/seo/AddSEO";
import SEOList from "./pages/seo/SEOList";
import Notification from "./pages/notification/Notification";
import Hero from "./pages/hero/Hero";
import About from "./pages/about_us/About";
import AddSEOCode from "./pages/seo/AddSEOCode";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/home-banner" element={<HomeBanner />} />
            <Route path="/hero" element={<Hero />} />
            <Route path="/media/photos-gallery" element={<PhotosGallery />} />
            <Route path="/media/videos-gallery" element={<VideosGallery />} />
            <Route path="/notification" element={<Notification />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/add_by_admin/add-occupation"
              element={<AddOccupation />}
            />
            <Route
              path="/add_by_admin/organization"
              element={<AddOrganization />}
            />
            <Route path="/add_by_admin/designation" element={<Designation />} />
            <Route path="/add_by_admin/department" element={<Department />} />
            <Route path="/add_by_admin/category" element={<Category />} />
            <Route path="/add_by_admin/profession" element={<Profession />} />
            <Route path="/add_by_admin/university" element={<University />} />
            <Route path="/add_by_admin/status" element={<Status />} />
            <Route path="/add_by_admin/enquiry" element={<Enquire />} />
            <Route path="/add_by_admin/data" element={<Data />} />
            <Route
              path="/add_by_admin/coordinator"
              element={<CoordinatorStatus />}
            />
            <Route path="/add_by_admin/event" element={<Event />} />
            <Route path="/add_by_admin/add-ags_event" element={<AGSEvent />} />
            <Route path="/add_by_admin/source" element={<Source />} />
            <Route path="/add_by_admin/target" element={<Target />} />
            <Route path="/add_by_admin/bank" element={<Bank />} />
            <Route
              path="/add_by_admin/image-category"
              Add
              element={<ImageCategory />}
            />
            <Route path="/add_by_admin/published" element={<Published />} />
            <Route path="/add_by_admin/ip" element={<IP />} />
            <Route path="/add_by_admin/role" element={<Role />} />
            <Route path="/add_by_admin/add-sidebar" element={<AddSidebar />} />
            <Route path="/users" element={<User />} />
            <Route path="/users/user" element={<User />} />
            <Route path="/users/user/:id" element={<ActivityLog />} />
            {/* <Route path="/users/activity-log" element={<ActivityLog />} /> */}
            <Route path="/member/add-member" element={<AddMember />} />
            <Route path="/member/member-list" element={<ListMember />} />
            <Route
              path="/volunteer/volunteer-overview/:id"
              element={<VolunteerOverview />}
            />
            <Route
              path="/member/member-overview/:id"
              element={<MemberOverview />}
            />
            <Route path="/volunteer/add-volunteer" element={<AddVolunteer />} />
            <Route
              path="/volunteer/volunteer-list"
              element={<ListVolunteer />}
            />
            <Route path="/initiatives" element={<Initiatives />} />
            <Route
              path="/trust-bodies/add-trust-bodies"
              element={<AddTrustBodies />}
            />
            <Route
              path="/trust-bodies/trust-bodies-list"
              element={<TrustBodiesList />}
            />
            <Route path="/news/add-news-updates" element={<AddNewsUpdates />} />
            <Route
              path="/news/news-updates-list"
              element={<NewsUpdatesList />}
            />
            <Route path="/news-letters" element={<NewsLetters />} />
            <Route path="/blogs/add-blog" element={<AddBlog />} />
            <Route path="/blogs/blog-list" element={<BlogList />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/collage/add-college" element={<AddCollege />} />
            <Route path="/collage/college-list" element={<CollegeList />} />
            {/* <Route path="/settings/role-rights" element={<RoleRights />} /> */}
            <Route path="/role-rights" element={<RoleRights />} />
            <Route path="/enquiry/enquiry-list" element={<EnquiryList />} />
            <Route path="/support/support-list" element={<SupportList />} />
            <Route path="/overview/profile/:id" element={<Overview />} />
            <Route path="/donation/add-donation" element={<AddDonation />} />
            <Route path="/donation/donation-list" element={<DonationList />} />
            <Route
              path="/16th-ags-section/web-enquiry"
              element={<WebEnquiry />}
            />
            <Route
              path="/16th-ags-section/delegate-list"
              element={<Delegates />}
            />
            <Route path="/16th-ags-section/new-data" element={<NewData />} />
            <Route path="/16th-ags-section/warm-data" element={<WarmData />} />
            <Route path="/16th-ags-section/hot-data" element={<HotData />} />
            <Route path="/16th-ags-section/cold-data" element={<ColdData />} />
            <Route
              path="/16th-ags-section/master-delegate-data"
              element={<MasterDelegateData />}
            />
            <Route
              path="/16th-ags-section/ags-add-data"
              element={<AGSAddData />}
            />
            <Route
              path="/16th-ags-section/ags-edit-data/:id"
              element={<AGSEditData />}
            />
            <Route
              path="/16th-ags-section/ags-overview/:id"
              element={<AgsOverview />}
            />
            <Route
              path="/16th-ags-section/ags-payment/:id"
              element={<AgsPayment />}
            />
            <Route path="/16th-ags-section/receipt/:id" element={<Receipt />} />
            <Route
              path="/tgym/add-contestant"
              element={<AddNewContestants />}
            />
            <Route path="/tgym/edit-contestant" element={<EditContestant />} />
            <Route
              path="/tgym/general-contestant"
              element={<GeneralContestant />}
            />
            <Route path="/tgym/tgym-overview" element={<TgymOverview />} />
            <Route path="/tgym/tgym-payment" element={<TgymPayment />} />
            <Route
              path="/tgym/follow-up-contestant"
              element={<FollowUpContestant />}
            />
            <Route path="/tgym/hot-contestant" element={<HotContestant />} />
            <Route
              path="/tgym/audition-contestant"
              element={<AuditionContestant />}
            />
            <Route
              path="/tgym/video-contestant"
              element={<VideoContestant />}
            />
            <Route
              path="/tgym/finale-contestant"
              element={<FinaleContestant />}
            />
            <Route
              path="/tgym/master-contestant"
              element={<MasterContestants />}
            />
            <Route
              path="/tgym/not-intr-contestant"
              element={<NotInterested />}
            />
            <Route
              path="/baccho-ki-rangshala/add-rangshala"
              element={<AddRangshala />}
            />
            <Route
              path="/baccho-ki-rangshala/rangshala-list"
              element={<RangshalaList />}
            />
            <Route
              path="/painting-competition/add-painting"
              element={<AddPainting />}
            />
            <Route
              path="/painting-competition/painting-list"
              element={<PaintingList />}
            />
            <Route path="/nukkad-natak/add-natak" element={<AddNatak />} />
            <Route path="/nukkad-natak/natak-list" element={<NatakList />} />
            <Route path="/objective" element={<Objective />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/testimonial" element={<Testimonial />} />

            <Route path="/seo/add-seo" element={<AddSEO />} />
            <Route path="/seo/seo-list" element={<SEOList />} />
            <Route path="/seo/add-seo-code" element={<AddSEOCode />} />
          </Route>
        </Route>
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
