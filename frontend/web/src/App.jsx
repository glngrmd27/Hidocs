import {
  useEffect,
} from "react";



import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// =========================================
// AUTH PAGES
// =========================================

import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import SelectMode from "./pages/SelectMode";

// =========================================
// USER PAGES
// =========================================

import Dashboard from "./pages/Dashboard";
import UserForms from "./pages/UserForms";
import History from "./pages/History";
import Profile from "./pages/Profile";
import FormDetails from "./pages/FormDetails";
import FillForm from "./pages/FillForm";
import SubmitSuccess from "./pages/SubmitSuccess";
import FormResult from "./pages/FormResult";

// =========================================
// CREATOR PAGES
// =========================================

import CreatorDashboard from "./pages/CreatorDashboard";
import CreatorFormDetails from "./pages/CreatorFormDetails";
import CreatorResults from "./pages/CreatorResults";
import ManageForms from "./pages/ManageForms";
import CreateForm from "./pages/CreateForm";
import EditForm from "./pages/EditForm";
import ImportWord from "./pages/ImportWord";
import CreatorProfile from "./pages/CreatorProfile";

// =========================================
// ADMIN PAGES
// =========================================

import AdminDashboard from "./pages/AdminDashboard";
import AdminCreators from "./pages/AdminCreators";
import AdminForms from "./pages/AdminForms";
import AdminMonitoring from "./pages/AdminMonitoring";
import AdminProfile from "./pages/AdminProfile";

// =========================================================
// SCROLL MANAGER
// Menghapus pengunci scroll setiap berpindah halaman
// =========================================================

function ScrollManager() {

  const location =
    useLocation();

  useEffect(() => {

    const html =
      document.documentElement;

    const body =
      document.body;

    const root =
      document.getElementById(
        "root"
      );

    body.classList.remove(
      "modal-open",
      "offcanvas-open"
    );

    html.style.removeProperty(
      "overflow"
    );

    html.style.removeProperty(
      "height"
    );

    html.style.removeProperty(
      "position"
    );

    body.style.removeProperty(
      "overflow"
    );

    body.style.removeProperty(
      "overflow-x"
    );

    body.style.removeProperty(
      "overflow-y"
    );

    body.style.removeProperty(
      "height"
    );

    body.style.removeProperty(
      "max-height"
    );

    body.style.removeProperty(
      "position"
    );

    body.style.removeProperty(
      "padding-right"
    );

    if (root) {

      root.style.removeProperty(
        "overflow"
      );

      root.style.removeProperty(
        "height"
      );

      root.style.removeProperty(
        "max-height"
      );

      root.style.removeProperty(
        "position"
      );

    }

    html.style.overflowX =
      "hidden";

    html.style.overflowY =
      "auto";

    html.style.height =
      "auto";

    html.style.minHeight =
      "100%";

    body.style.overflowX =
      "hidden";

    body.style.overflowY =
      "auto";

    body.style.height =
      "auto";

    body.style.minHeight =
      "100vh";

    if (root) {

      root.style.width =
        "100%";

      root.style.minHeight =
        "100vh";

      root.style.height =
        "auto";

      root.style.overflow =
        "visible";

    }

    window.scrollTo(
      0,
      0
    );

    document
      .querySelectorAll(
        ".modal-backdrop, .offcanvas-backdrop"
      )
      .forEach(
        (element) => {
          element.remove();
        }
      );

  }, [
    location.pathname,
  ]);

  return null;

}

// =========================================================
// APPLICATION ROUTES
// =========================================================

function AppRoutes() {

  return (

    <>

      <ScrollManager />

      <Routes>

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/verify-otp"
          element={<VerifyOtp />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
        path="/select-mode"
          element={<SelectMode />} />
          
        <Route
          path="/forms"
          element={<UserForms />}
        />

        <Route
          path="/history"
          element={<History />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/form-details/:id"
          element={<FormDetails />}
        />

        <Route
          path="/fill-form/:id"
          element={<FillForm />}
        />

        <Route
          path="/submit-success"
          element={<SubmitSuccess />}
        />

        {/* =========================================
            CREATOR PAGES
        ========================================= */}
        <Route
          path="/creator"
          element={<CreatorDashboard />}
        />
        <Route
          path="/creator/profile"
          element={<CreatorProfile />}
        />
        <Route
          path="/creator/forms"
          element={<ManageForms />}
        />
        <Route
          path="/creator/create-form"
          element={<CreateForm />}
        />
        <Route
          path="/creator/import-word"
          element={<ImportWord />}
        />
        <Route
          path="/creator/forms/:id/edit"
          element={<EditForm />}
        />
        <Route
          path="/creator/forms/:id/results"
          element={<CreatorResults />}
        />
        <Route
          path="/creator/forms/:id"
          element={<CreatorFormDetails />}
        />

        {/* =========================================
            ADMIN PAGES
        ========================================= */}
        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/profile"
          element={<AdminProfile />}
        />

        <Route
          path="/admin/creators"
          element={<AdminCreators />}
        />

        <Route
          path="/admin/forms"
          element={<AdminForms />}
        />

        <Route
          path="/admin/monitoring"
          element={<AdminMonitoring />}
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>

    </>

  );

}

// =========================================================
// APP
// =========================================================

function App() {

  return (

    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>

  );

}

export default App;