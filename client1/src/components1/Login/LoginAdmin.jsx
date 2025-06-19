import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import "./login.css";
import { loginAdmin, signupAdmin, API_BASE_URL } from "../../services/api.tsx";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import loginImage from "../../assets/img/img2.jpg"
import { toast } from 'sonner';

const LoginSignup = ({ isSignup, setToken }) => {
  const navigate = useNavigate();
  const [isLoginFormVisible, setIsLoginFormVisible] = useState(!isSignup);
  const [errorMessage, setErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  });
  const [rememberMe, setRememberMe] = useState(false);
  const MAX_PASSWORD_LENGTH = 12;
  const [showHelp, setShowHelp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleHelp = () => setShowHelp(!showHelp);


  // Check for saved username on component mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      setRememberMe(true);
    }
  }, []);

  const validateUsername = (username) => {
    if (username.length < 4) {
      return "Username must be at least 4 characters long";
    }
    if (!/[A-Z]/.test(username)) {
      return "Username must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(username)) {
      return "Username must contain at least one lowercase letter";
    }
    if (!/\d/.test(username)) {
      return "Username must contain at least one number";
    }
    return "";
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
      return `Password must be at most ${MAX_PASSWORD_LENGTH} characters long`;
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/\d/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password must contain at least one special character";
    }
    return "";
  };

  const toggleForm = () => {
    setIsLoginFormVisible(!isLoginFormVisible);
    setValidationErrors({
      username: "",
      password: "",
      confirmPassword: ""
    });
  };
const handlePasswordInput = (e) => {
    // Enforce maximum length
    if (e.target.value.length > MAX_PASSWORD_LENGTH) {
      e.target.value = e.target.value.slice(0, MAX_PASSWORD_LENGTH);
    }
    // Clear validation errors when user types
    if (e.target.id === "signupPassword" || e.target.id === "loginPassword") {
      setValidationErrors(prev => ({ ...prev, password: "" }));
    }
  };
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const username = e.target.loginUsername.value;
    const password = e.target.loginPassword.value;
    setIsLoading(true);

    try {
      const data = await loginAdmin(username, password);
     

      if (!data || !data.token) {
        throw new Error("Invalid response: Token is missing.");
      }
      
      // Handle remember me functionality (only store username)
      if (rememberMe) {
        localStorage.setItem('rememberedUsername', username);
      } else {
        localStorage.removeItem('rememberedUsername');
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      toast.success("Login successful!");
      navigate("/admin");
    } catch (error) {
      toast.error(error || "An error occurred");
      setIsLoading(false);
              setErrorMessage(error || "An error occurred");
            
            setTimeout(() => {
              setErrorMessage("");
            }, 5000);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const username = e.target.signupUsername.value;
    const password = e.target.signupPassword.value;
    const confirmPassword = e.target.signupConfirmPassword?.value;

    // Validate username
    const usernameError = validateUsername(username);
    if (usernameError) {
      setValidationErrors(prev => ({ ...prev, username: usernameError }));
      return;
    }

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setValidationErrors(prev => ({ ...prev, password: passwordError }));
      return;
    }

    // Validate password match if confirm password exists
    if (confirmPassword && password !== confirmPassword) {
      setValidationErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
      return;
    }

    const userData = {
      username,
      first_name: e.target.signupFirstName.value,
      last_name: e.target.signupLastName.value,
      email: e.target.signupEmail.value,
      password,
    };

    try {
      const data = await signupAdmin(userData);
      console.log("Signup successful", data);
      window.location.reload();
      toast.success("Signup successful!");
      navigate("/loginadmin");
    } catch (error) {
      if (error?.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(error || "An error occurred");
      }
      setTimeout(() => {
        setErrorMessage("");
      }, 5000);
    }
  };

  const handleInputChange = (e) => {
    // Clear validation errors when user types
    if (e.target.id === "signupUsername") {
      setValidationErrors(prev => ({ ...prev, username: "" }));
    } else if (e.target.id === "signupPassword") {
      setValidationErrors(prev => ({ ...prev, password: "" }));
    } else if (e.target.id === "signupConfirmPassword") {
      setValidationErrors(prev => ({ ...prev, confirmPassword: "" }));
    }
  };

  return (
    <div className="login-container">
      <div className="login-split-container">
        {/* Left side with image */}
        <div className="login-image-container">
          <img 
            src={loginImage} 
            alt="Education illustration" 
            className="login-image"
          />
          <div className="login-image-overlay">
          <h2>Welcome to the Admin Dashboard</h2>
<p>Manage courses, monitor teacher progress, and enhance the learning experience for all users.</p>

          </div>
        </div>
      <div className="login-card">
        {isLoginFormVisible ? (
          <form id="loginForm" onSubmit={handleLoginSubmit}>
            <h3 className="login-title">Sign In As Admin</h3>
            <div className="login-input-group">
              <label htmlFor="loginUsername" className="login-label">
                Username
              </label>
              <input
                type="text"
                className="login-input hj" 
                id="loginUsername"
                required
                onChange={handleInputChange}
                defaultValue={localStorage.getItem('rememberedUsername') || ''}
              />
            </div>

            <div className="login-input-group">
              <label htmlFor="loginPassword" className="login-label">
              Password (max {MAX_PASSWORD_LENGTH} characters)
              </label>
              <input 
                type="password" 
                className="login-input hj" 
                id="loginPassword" 
                required 
                maxLength={MAX_PASSWORD_LENGTH}
                onInput={handlePasswordInput}
              />
            </div>
            
            <div className="login-remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>
            {isLoading ? (
          <div className="loading-spinner " ></div>
        ) : (
          <button type="submit" className="login-button">
              Continue
            </button>
        )}
            
            
            {/* <p className="login-toggle-text">
              Don't have an account?{" "}
              <a href="#" onClick={toggleForm}>
                Sign up
              </a>
            </p> */}
            <div className="login-social-buttons">
              <p className="login-social-text">or</p>
              <a href={`${API_BASE_URL}/oauth/login/google-oauth2/`} className="login-social-button">
                <span className="google-icon-text">
                  <svg fill="none" height="15" viewBox="0 0 16 16" width="15" xmlns="http://www.w3.org/2000/svg">
                    <g>
                      <path d="M15.83 8.18C15.83 7.65333 15.7833 7.15333 15.7033 6.66667H8.17V9.67333H12.4833C12.29 10.66 11.7233 11.4933 10.8833 12.06V14.06H13.4567C14.9633 12.6667 15.83 10.6133 15.83 8.18Z" fill="#4285F4"></path>
                      <path d="M8.17 16C10.33 16 12.1367 15.28 13.4567 14.06L10.8833 12.06C10.1633 12.54 9.25 12.8333 8.17 12.8333C6.08334 12.8333 4.31667 11.4267 3.68334 9.52667H1.03V11.5867C2.34334 14.2 5.04334 16 8.17 16Z" fill="#34A853"></path>
                      <path d="M3.68334 9.52667C3.51667 9.04667 3.43 8.53333 3.43 8C3.43 7.46667 3.52334 6.95334 3.68334 6.47334V4.41334H1.03C0.483335 5.49334 0.170002 6.70667 0.170002 8C0.170002 9.29333 0.483335 10.5067 1.03 11.5867L3.68334 9.52667Z" fill="#FBBC05"></path>
                      <path d="M8.17 3.16667C9.35 3.16667 10.4033 3.57334 11.2367 4.36667L13.5167 2.08667C12.1367 0.793334 10.33 0 8.17 0C5.04334 0 2.34334 1.8 1.03 4.41334L3.68334 6.47334C4.31667 4.57334 6.08334 3.16667 8.17 3.16667Z" fill="#EA4335"></path>
                    </g>
                  </svg>
                  <span>Continue with Google</span>
                </span>
              </a>
              <a
                href={`${API_BASE_URL}/oauth/login/github/`}
                className="login-social-button"
                onClick={() => console.log("Sign up with GitHub")}
              >
                <FontAwesomeIcon icon={faGithub} /> Continue with GitHub
              </a>
            </div>
          </form>
        ) : (
          <form id="signupForm" onSubmit={handleSignupSubmit}>
            <h3 className="login-title">Admin is not Authenticate to SignUp</h3>
            {/* <h3 className="login-title">Sign Up As Admin</h3>
            <div className="login-input-group">
              <label htmlFor="signupUsername" className="login-label">
                Username
              </label>
              <input
                type="text"
                className={`login-input ${validationErrors.username ? "invalid-input" : ""}`}
                id="signupUsername"
                required
                onChange={handleInputChange}
              />
              
              {validationErrors.username && (
                <div className="validation-error">{validationErrors.username}</div>
              )}
            </div>
            <div className="login-input-group">
              <label htmlFor="signupFirstName" className="login-label">
                First Name
              </label>
              <input type="text" className="login-input" id="signupFirstName" required />
            </div>
            <div className="login-input-group">
              <label htmlFor="signupLastName" className="login-label">
                Last Name
              </label>
              <input type="text" className="login-input" id="signupLastName" />
            </div>
            <div className="login-input-group">
              <label htmlFor="signupEmail" className="login-label">
                Email
              </label>
              <input type="email" className="login-input" id="signupEmail" required />
            </div>
            <div className="login-input-group">
              <label htmlFor="signupPassword" className="login-label">
              Password (max {MAX_PASSWORD_LENGTH} characters)
              </label>
              <input
                type="password"
                className={`login-input ${validationErrors.password ? "invalid-input" : ""}`}
                id="signupPassword"
                required
                maxLength={MAX_PASSWORD_LENGTH}
                onInput={handlePasswordInput}
                onChange={handleInputChange}
              />
              
              {validationErrors.password && (
                <div className="validation-error">{validationErrors.password}</div>
              )}
              <div className="password-length-counter">
                {`${document.getElementById('signupPassword')?.value?.length || 0}/${MAX_PASSWORD_LENGTH}`}
              </div>
            </div>
            <div className="login-input-group">
              <label htmlFor="signupConfirmPassword" className="login-label">
              Confirm Password (max {MAX_PASSWORD_LENGTH} characters)
              </label>
              <input
                type="password"
                className={`login-input ${validationErrors.confirmPassword ? "invalid-input" : ""}`}
                id="signupConfirmPassword"
                required
                maxLength={MAX_PASSWORD_LENGTH}
                onInput={handlePasswordInput}
                onChange={handleInputChange}
              />
              {validationErrors.confirmPassword && (
                <div className="validation-error">{validationErrors.confirmPassword}</div>
              )}
              <div className="password-length-counter">
                {`${document.getElementById('signupConfirmPassword')?.value?.length || 0}/${MAX_PASSWORD_LENGTH}`}
              </div>
            </div>
            <button type="submit" className="login-button">
              Continue
            </button> */}
            <p className="login-toggle-text">
        Need help?{" "}
        <a className="login-toggle-text" href="#" onClick={toggleHelp}>
          Get Help
        </a>
      </p>
      {showHelp && (
        <div className="login-toggle-text">
          <p>📞 Phone: +91-9876543210</p>
          <p>📧 Email: support.lms.techmiya@example.com</p>
        </div>
      )}
            <p className="login-toggle-text">
              Please Login?{" "}
              <a href="#" onClick={toggleForm}>
                Login
              </a>
            </p>
            {/* <div className="login-social-buttons">
              <p className="login-social-text">or</p>
              <a href={`${API_BASE_URL}/oauth/login/google-oauth2/`} className="login-social-button">
                <svg fill="none" height="15" viewBox="0 0 16 16" width="15" xmlns="http://www.w3.org/2000/svg">
                  <g>
                    <path d="M15.83 8.18C15.83 7.65333 15.7833 7.15333 15.7033 6.66667H8.17V9.67333H12.4833C12.29 10.66 11.7233 11.4933 10.8833 12.06V14.06H13.4567C14.9633 12.6667 15.83 10.6133 15.83 8.18Z" fill="#4285F4"></path>
                    <path d="M8.17 16C10.33 16 12.1367 15.28 13.4567 14.06L10.8833 12.06C10.1633 12.54 9.25 12.8333 8.17 12.8333C6.08334 12.8333 4.31667 11.4267 3.68334 9.52667H1.03V11.5867C2.34334 14.2 5.04334 16 8.17 16Z" fill="#34A853"></path>
                    <path d="M3.68334 9.52667C3.51667 9.04667 3.43 8.53333 3.43 8C3.43 7.46667 3.52334 6.95334 3.68334 6.47334V4.41334H1.03C0.483335 5.49334 0.170002 6.70667 0.170002 8C0.170002 9.29333 0.483335 10.5067 1.03 11.5867L3.68334 9.52667Z" fill="#FBBC05"></path>
                    <path d="M8.17 3.16667C9.35 3.16667 10.4033 3.57334 11.2367 4.36667L13.5167 2.08667C12.1367 0.793334 10.33 0 8.17 0C5.04334 0 2.34334 1.8 1.03 4.41334L3.68334 6.47334C4.31667 4.57334 6.08334 3.16667 8.17 3.16667Z" fill="#EA4335"></path>
                  </g>
                </svg>{" "}
                Continue with Google
              </a>
              <a
                href={`${API_BASE_URL}/oauth/login/github/`}
                className="login-social-button"
                onClick={() => console.log("Sign up with GitHub")}
              >
                <FontAwesomeIcon icon={faGithub} /> Continue with GitHub
              </a>
            </div> */}
          </form>
        )}
        <Link to="/" className="login-back-link">
          Back to LMS
        </Link>
        
        
      </div>
      {errorMessage && (
        <div className="login-error-message">
          {errorMessage}
        </div>
      )}
    </div>
    </div>
  );
};

export default LoginSignup;