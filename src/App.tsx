import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { publicRoutes } from "@/routes";

function App() {
  return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Router>
      <Routes>
        {publicRoutes.map((route, idx) => (
          <Route key={idx} path={route.path} element={<route.layout>{route.element}</route.layout>} />
        ))}
          </Routes>
        </Router>
      </ThemeProvider>
  );
}

export default App;
