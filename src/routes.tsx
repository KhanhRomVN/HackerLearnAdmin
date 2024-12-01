import MainLayout from "@/layout/MainLayout";
import DashboardPage from "@/pages/DashboardPage";
import MajorManagementPage from "@/pages/MajorManagementPage";
import SkillManagementPage from "@/pages/SkillManagementPage";
import CourseManagementPage from "@/pages/CourseManagementPage";
import MemberManagementPage from "@/pages/MemberManagementPage";
import SettingPage from "@/pages/SettingPage";
import FAQPage from "@/pages/FAQPage";
import LoginPage from "@/pages/LoginPage";
import MajorPage from "@/pages/MajorPage";
import CreateCoursePage from "@/pages/CreateCoursePage";
const publicRoutes = [
    {
        path: "/",
        element: <DashboardPage />,
        layout: MainLayout,
    },
    {
        path: "/major",
        element: <MajorManagementPage />,
        layout: MainLayout,
    },
    {
        path: "/skill",
        element: <SkillManagementPage />,
        layout: MainLayout,
    },
    {
        path: "/course",
        element: <CourseManagementPage />,
        layout: MainLayout,
    },
    {
        path: "/member",
        element: <MemberManagementPage />,
        layout: MainLayout,
    },
    {
        path: "/setting",
        element: <SettingPage />,
        layout: MainLayout,
    },
    {
        path: "/faq",
        element: <FAQPage />,
        layout: MainLayout,
    },
    {
        path: "/login",
        element: <LoginPage />,
        layout: MainLayout,
    },
    {
        path: "/major/:majorId",
        element: <MajorPage />,
        layout: MainLayout,
    },
    {
        path: "/create-course",
        element: <CreateCoursePage />,
        layout: MainLayout,
    },
];

export { publicRoutes };
