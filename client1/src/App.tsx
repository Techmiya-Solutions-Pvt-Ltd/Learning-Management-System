import React, { useState, useEffect } from "react";
import { HashRouter as BrowserRouter , Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from "./components1/Dashboard/Dashboard";
import TeacherDashboard from "./components1/TeacherDashboard/TeacherDashboard";
import CourseCreation from "./components1/TeacherDashboard/CourseCreator";

import { ViewCourse } from './componentshr/ViewCourse';
import { ViewBlog } from './componentshr/ViewBlog';
import { EditCourse  } from './componentshr/EditCourse';
import BlogCreator from "./components1/TeacherDashboard/Blog/BlogCreator";
import Aiquestions from "./components1/TeacherDashboard/Aiquestions";
import ManualAssessmentCreator from "./components1/TeacherDashboard/ManualAssessmentCreator";

import TestScreen from "./components1/testScreen/TestScreen";
import { TestReview } from "./components1/testScreen/Results";

import Login from "./components1/Login/LoginSignup";
import LoginTeacher from "./components1/Login/LoginTeacher";
import LoginAdmin from "./components1/Login/LoginAdmin";
import PrivateRoute from "./components1/PrivateRoute";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from './context/ThemeContext'; // Make sure this path is correct
import Student from "./pages/Index";
import Admin from "./pageshr/Index";
import NotFound from "./pages/NotFound";
import CourseDisplay from "./components/CourseDisplay";
import TestView from "./componentshr/TestView";


const queryClient = new QueryClient();

const LoginWrapper = ({ setToken }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const isSignup = params.get("signup") === "true";

  const isTeacherLogin = location.pathname === "/loginteacher";
  const isAdminLogin = location.pathname === "/loginadmin";
  if (isAdminLogin) {
    return <LoginAdmin isSignup={isSignup} setToken={setToken} />;
  }

  return isTeacherLogin ? (
    <LoginTeacher isSignup={isSignup} setToken={setToken} />
  ) : (
    <Login isSignup={isSignup} setToken={setToken} />
  );
};

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || sessionStorage.getItem("token"));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token") || sessionStorage.getItem("token"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
 
  return (
    <QueryClientProvider client={queryClient}>
       <ThemeProvider> {/* Add ThemeProvider here */}
      <TooltipProvider>
        <Toaster />
        <Sonner />
       
          <BrowserRouter>
            <ToastContainer position="top-right" autoClose={3000} />
            <Routes>
            <Route path="/test/view" element={<TestView />} />
              <Route path="/" element={<Dashboard />} />
              
              <Route path="/create_course" element={<PrivateRoute token={token} />}>
                <Route index element={<CourseCreation />} />
              </Route>
              <Route path="/courses/:courseId" element={<PrivateRoute token={token} />}>
                <Route index element={<ViewCourse />} />
              </Route>
              <Route path="/blogs/:id" element={<PrivateRoute token={token} />}>
                <Route index element={<ViewBlog />} />
              </Route>
              <Route path="/courses/:courseId/edit" element={<PrivateRoute token={token} />}>
                <Route index element={<EditCourse />} />
              </Route>
              <Route path="/create_blog" element={<PrivateRoute token={token} />}>
                <Route index element={<BlogCreator />} />
              </Route>
              <Route path="/studentcourse/:courseId" element={<PrivateRoute token={token} />}>
    <Route index element={<CourseDisplay />} />
  </Route>
              <Route path="/test/results/:id" element={<TestReview />} />
              <Route path="/test" element={<PrivateRoute token={token} />}>
                <Route index element={<TestScreen />} />
              </Route>
              <Route path="/aiquestions" element={<PrivateRoute token={token} />}>
                <Route index element={<Aiquestions />} />
              </Route>
              <Route path="/create-assessment" element={<PrivateRoute token={token} />}>
                <Route index element={<ManualAssessmentCreator />} />
              </Route>
              <Route path="/login" element={<LoginWrapper setToken={setToken} />} />
              <Route path="/loginadmin" element={<LoginWrapper setToken={setToken} />} />
              <Route path="/loginteacher" element={<LoginWrapper setToken={setToken} />} />
              <Route path="/student" element={<PrivateRoute token={token} />}>
                <Route index element={<Student />} />
              </Route>
              <Route path="/admin" element={<PrivateRoute token={token} />}>
                <Route index element={<Admin />} />
              </Route>
              <Route path="/teacherdashbord" element={<PrivateRoute token={token} />}>
                <Route index element={<TeacherDashboard />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        
      </TooltipProvider>
      </ThemeProvider> {/* Close ThemeProvider */}
    </QueryClientProvider>
  );
};

export default App;