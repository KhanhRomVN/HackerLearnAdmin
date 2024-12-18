import MainLayout from "@/layout/MainLayout";
import CoursePage from "@/pages/Course";
import ChapterPage from "@/pages/Chapter";
import MetricPage from "@/pages/Metric";
import SettingPage from "@/pages/Setting";
import LessonPage from "@/pages/Lesson";
import FlashcardPage from "@/pages/Flashcard";
const publicRoutes = [
    {
        path: "/",
        element: <MetricPage />,
        layout: MainLayout,
    },
    {
        path: "/courses",
        element: <CoursePage />,
        layout: MainLayout,
    },
    {
        path: "/chapter/:id",
        element: <ChapterPage />,
        layout: MainLayout,
    },
    {
        path: "/lesson/:id",
        element: <LessonPage />,
        layout: MainLayout,
    },
    {
        path: "/settings",
        element: <SettingPage />,
        layout: MainLayout,
    },
    {
        path: "/flashcard/:id",
        element: <FlashcardPage />,
        layout: MainLayout,
    }
];

export { publicRoutes };
