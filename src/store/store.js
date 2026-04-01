import { configureStore } from "@reduxjs/toolkit";
import adminReducer from "../redux/slices/adminSlice";
import bannerReducer from "../redux/slices/home-banner/bannerSlice";
import initiativeReducer from "../redux/slices/initiativeSlice";
import galleryReducer from "../redux/slices/mediaImageSlice";
import galleryVideoReducer from "../redux/slices/galleryVideoSlice";
import categoryImageReducer from "../redux/slices/add_by_admin/categoryImageSlice";
import categoryVideoReducer from "../redux/slices/add_by_admin/categoryVideoSlice";
import blogReducer from "../redux/slices/blog/blogSlice";
import categoryReducer from "../redux/slices/add_by_admin/categorySlice";
import occupationReducer from "../redux/slices/add_by_admin/occupationSlice";
import designationReducer from "../redux/slices/add_by_admin/designationSlice";
import departmentReducer from "../redux/slices/add_by_admin/departmentSlice";
import professionReducer from "../redux/slices/add_by_admin/professionSlice";
import universityReducer from "../redux/slices/add_by_admin/universitySlice";
import enquiryReducer from "../redux/slices/add_by_admin/enquirySlice";
import dataReducer from "../redux/slices/add_by_admin/dataSlice";
import objectiveReducer from "../redux/slices/objective/objectiveSlice";
import activityLogReducer from "../redux/slices/activityLog/activityLogSlice";
import organizationReducer from "../redux/slices/add_by_admin/organizationSlice";
import authReducer from "../redux/slices/auth/authSlice";
import userReducer from "../redux/slices/user/userSlice";
import eventReducer from "../redux/slices/add_by_admin/eventSlice";
import statusOptionReducer from "../redux/slices/add_by_admin/statusOptionSlice";
import sourceReducer from "../redux/slices/add_by_admin/sourceSlice";
import callTargetReducer from "../redux/slices/add_by_admin/callTargetSlice";
import coordinatorStatusReducer from "../redux/slices/add_by_admin/coordinatorStatusSlice";
import bankReducer from "../redux/slices/add_by_admin/bankSlice";
import testimonialReducer from "../redux/slices/testimonial/testimonialSlice";
import trustBodyReducer from "../redux/slices/trustbody/trustBodySlice";
import publishedReducer from "../redux/slices/add_by_admin/publishedSlice";
import recentUpdateReducer from "../redux/slices/recentUpdate/recentUpdateSlice";
import newsLetterReducer from "../redux/slices/newsletter/newsLetterSlice";
import faqReducer from "../redux/slices/faq/faqSlice";
import enquiryListReducer from "../redux/slices/enquiry-list/enquiryListSlice";
import achievementReducer from "../redux/slices/achievements/achievementSlice";
import supportReducer from "../redux/slices/support/supportSlice";
import ipReducer from "../redux/slices/add_by_admin/ipSlice";
import roleReducer from "../redux/slices/add_by_admin/roleSlice";
import roleRightsReducer from "../redux/slices/role_rights/roleRightsSlice";
import sidebarReducer from "../redux/slices/add_by_admin/addSidebarSlice";
import memberReducer from "../redux/slices/membership/memberSlice";
import volunteerReducer from "../redux/slices/volunteer/volunteerSlice";
import agsDelegateReducer from "../redux/slices/ags/agsDelegateSlice";
import agsEventReducer from "../redux/slices/add_by_admin/agsEventSlice";
import collegeReducer from "../redux/slices/college/collegeSlice";
import clientStatusReducer from "../redux/slices/ags/clientStatusSlice";
import paymentsReducer from "../redux/slices/ags/agsPaymentSlice";
import seoReducer from "../redux/slices/seo/seoSlice";
import heroReducer from "../redux/slices/hero/heroSlice";
import aboutReducer from "../redux/slices/about_us/aboutSlice";
import seoCodeReducer from "../redux/slices/seo/seoCodeSlice";
import socialMediaReducer from "../redux/slices/seo/socialMediaSlice";
import jobReducer from "../redux/slices/job/jobSlice";
import jobApplyReducer from "../redux/slices/job/jobApplySlice";  


const store = configureStore({
  reducer: {
    admin: adminReducer,
    banner: bannerReducer,
    initiative: initiativeReducer,
    gallery: galleryReducer,
    galleryVideo: galleryVideoReducer,
    categoryImage: categoryImageReducer,
    categoryVideo: categoryVideoReducer,
    blog: blogReducer,
    category: categoryReducer,
    occupation: occupationReducer,
    designation: designationReducer,
    department: departmentReducer,
    profession: professionReducer,
    university: universityReducer,
    enquiry: enquiryReducer,
    data: dataReducer,
    objectives: objectiveReducer,
    activityLog: activityLogReducer,
    organization: organizationReducer,
    auth: authReducer,
    user: userReducer,
    event: eventReducer,
    statusOption: statusOptionReducer,
    source: sourceReducer,
    callTarget: callTargetReducer,
    coordinatorStatus: coordinatorStatusReducer,
    bank: bankReducer,
    testimonials: testimonialReducer,
    trustBody: trustBodyReducer,
    published: publishedReducer,
    recentUpdate: recentUpdateReducer,
    newsletter: newsLetterReducer,
    faq: faqReducer,
    enquiryList: enquiryListReducer,
    achievements: achievementReducer,
    support: supportReducer,
    ip: ipReducer,
    role: roleReducer,
    roleRights: roleRightsReducer,
    sidebar: sidebarReducer,
    member: memberReducer,
    volunteer: volunteerReducer,
    agsDelegate: agsDelegateReducer,
    agsEvent: agsEventReducer,
    college: collegeReducer,
    clientStatus: clientStatusReducer,
    payments: paymentsReducer,
    seo: seoReducer,
    hero: heroReducer,
    about: aboutReducer,
    seoCode: seoCodeReducer,
    socialMedia: socialMediaReducer,
    job: jobReducer,
    jobApply: jobApplyReducer,
  },
});

export default store;
