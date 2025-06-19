import { Navigate, Outlet, useLocation } from "react-router-dom";

interface PrivateRouteProps {
  token: string | null;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ token }) => {
  const location = useLocation();

 
  const teacherPaths = ["/teacherdashbord", "/create-assessment","aiquestions","create_course","create_blog"]; // Add more paths here as needed

const loginPath = teacherPaths.some(path => location.pathname.startsWith(path))
  ? "/loginteacher"
  : "/login";



  return token ? <Outlet /> : <Navigate to={loginPath} replace />;
};

export default PrivateRoute;
