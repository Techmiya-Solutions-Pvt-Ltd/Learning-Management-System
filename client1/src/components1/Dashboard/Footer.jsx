import React from 'react';

import '../../assets/css/Body.css';

import logo from "../../assets/img/logo.jpeg";
const Footer = () => {
  return (
    <div class="newfooter">
    <footer>
      <div className="container content-wrapper">
        <div className="row">
          <div className="col-lg-3 col-md-6">
  <div className="flex items-center space-x-2 mb-2">
    <img src={logo} alt="Techmiya Logo" className="h-8 w-8" />
    <h5 className="text-lg font-semibold">Techmiya Ed-Tech</h5>
  </div>
  <p>
    Transforming learning with cutting-edge technology 
    Empowering students to build successful careers in tech.
  </p>
</div>

          <div className="col-lg-3 col-md-6">
            <h5>For Students</h5>
            <ul>
              <li><a href="#">All Courses</a></li>
              <li><a href="#">Learning Paths</a></li>
              <li><a href="#">Student Dashboard</a></li>
              <li><a href="#">Success Stories</a></li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6">
            <h5>For Instructors</h5>
            <ul>
              <li><a href="#">Become a Teacher</a></li>
              <li><a href="#">Teacher Resources</a></li>
              <li><a href="#">Instructor Dashboard</a></li>
              <li><a href="#">Partner Program</a></li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6">
            <h5>Contact Us</h5>
            <ul>
              <li><a href="#">+91 6361987951</a></li>
              <li><a href="#">info@techmiyasolutions.com</a></li>
            
            </ul>
          </div>
        </div>
        <div className="row footer-bottom">
          <div className="col-md-6">
            <p>© 2025 Techmiya Edtech. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-md-end">
            <div className="social-icons">
              <a href="#"><span>Facebook</span></a>
              <a href="#"><span>Twitter</span></a>
              <a href="#"><span>LinkedIn</span></a>
              <a href="#"><span>Instagram</span></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
    </div>
  );
};

export default Footer;