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
// ADMIN PAGES
// =========================================

import AdminDashboard from "./pages/AdminDashboard";
import AdminFormDetails from "./pages/AdminFormDetails";
import AdminResults from "./pages/AdminResults";
import ManageForms from "./pages/ManageForms";
import CreateForm from "./pages/CreateForm";
import ImportWord from "./pages/ImportWord";
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


    // =====================================================
    // HAPUS CLASS BOOTSTRAP YANG DAPAT MENGUNCI SCROLL
    // =====================================================

    body.classList.remove(
      "modal-open",
      "offcanvas-open"
    );


    // =====================================================
    // HAPUS STYLE INLINE LAMA
    // =====================================================

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


    // =====================================================
    // PASTIKAN DOCUMENT DAPAT DI-SCROLL
    // =====================================================

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


    // =====================================================
    // SELALU MULAI DARI ATAS SAAT PINDAH HALAMAN
    // =====================================================

    window.scrollTo(
      0,
      0
    );


    // =====================================================
    // BERSIHKAN BACKDROP BOOTSTRAP YANG TERTINGGAL
    // =====================================================

    document
      .querySelectorAll(
        ".modal-backdrop, .offcanvas-backdrop"
      )
      .forEach(
        (
          element
        ) => {

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


        {/* =========================================
            DEFAULT
        ========================================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />


        {/* =========================================
            AUTH
        ========================================= */}

        <Route
          path="/login"
          element={
            <Login />
          }
        />


        <Route
          path="/register"
          element={
            <Register />
          }
        />


        <Route
          path="/verify-otp"
          element={
            <VerifyOtp />
          }
        />


        {/* =========================================
            USER
        ========================================= */}

        <Route
          path="/dashboard"
          element={
            <Dashboard />
          }
        />


        <Route
          path="/forms"
          element={
            <UserForms />
          }
        />


        <Route
          path="/history"
          element={
            <History />
          }
        />


        <Route
          path="/profile"
          element={
            <Profile />
          }
        />


        <Route
          path="/form-details/:id"
          element={
            <FormDetails />
          }
        />


        <Route
          path="/fill-form/:id"
          element={
            <FillForm />
          }
        />


        <Route
          path="/submit-success"
          element={
            <SubmitSuccess />
          }
        />


        {/* =========================================
            USER FORM RESULT
        ========================================= */}

        <Route
          path="/form-result/:id"
          element={
            <FormResult />
          }
        />


        {/* =========================================
            ADMIN
        ========================================= */}

        <Route
          path="/admin"
          element={
            <AdminDashboard />
          }
        />


        <Route
          path="/admin/profile"
          element={
            <AdminProfile />
          }
        />


        <Route
          path="/admin/forms"
          element={
            <ManageForms />
          }
        />


        {/* =========================================
            CREATE FORM
        ========================================= */}

        <Route
          path="/create-form"
          element={
            <CreateForm />
          }
        />


        {/* =========================================
            IMPORT WORD
        ========================================= */}

        <Route
          path="/admin/import-word"
          element={
            <ImportWord />
          }
        />


        {/* =========================================
            ADMIN FORM DETAILS
        ========================================= */}

        <Route
          path="/admin/forms/:id"
          element={
            <AdminFormDetails />
          }
        />


        {/* =========================================
            ADMIN RESULTS
        ========================================= */}

        <Route
          path="/admin/forms/:id/results"
          element={
            <AdminResults />
          }
        />


        {/* =========================================
            FALLBACK
        ========================================= */}

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