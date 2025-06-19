import React from 'react';
import '../../assets/css/Body.css';



const Body = ({ activeTab }) => {
  switch (activeTab) {
    case 'explore':
      return (
        <div className="content-section explore-section">
          <div className="container">
            <h2>Discover Your Learning Journey</h2>
            <p>Explore thousands of courses taught by expert instructors from around the world.</p>
            <div className="featured-courses">
              <div className="course-card">
                <div className="course-image placeholder"></div>
                <h3>Web Development</h3>
                <p>Master modern web technologies and build responsive websites.</p>
                <button className="btn-primary">Learn More</button>
              </div>
              <div className="course-card">
                <div className="course-image placeholder"></div>
                <h3>Data Science</h3>
                <p>Learn data analysis, visualization, and machine learning techniques.</p>
                <button className="btn-primary">Learn More</button>
              </div>
              <div className="course-card">
                <div className="course-image placeholder"></div>
                <h3>Digital Marketing</h3>
                <p>Develop strategies to grow businesses in the digital landscape.</p>
                <button className="btn-primary">Learn More</button>
              </div>
            </div>
          </div>
        </div>
      );
    case 'opportunities':
      return (
        <div className="content-section opportunities-section">
          <div className="container">
            <h2>Unlock Your Potential</h2>
            <p>Opportunities knock for those who are ready to open the door. Keep learning, keep growing.</p>
            <button className="btn-primary">Explore Opportunities</button>
            <div className="opportunity-cards">
              <div className="opportunity-card">
                <h3>Internships</h3>
                <p>Gain real-world experience while completing your education.</p>
              </div>
              <div className="opportunity-card">
                <h3>Job Placements</h3>
                <p>Connect with top employers looking for skilled professionals.</p>
              </div>
              <div className="opportunity-card">
                <h3>Networking Events</h3>
                <p>Build valuable connections in your industry of interest.</p>
              </div>
            </div>
          </div>
        </div>
      );
    case 'teach':
      return (
        <div className="content-section teach-section">
          <div className="container">
            <h2>Come teach with us</h2>
            <p>Become an instructor and change lives—including your own.</p>
          
            <button className="btn-primary">Start Teaching</button>
         
            
            <div className="teaching-benefits">
              <div className="benefit-card">
                <h3>Share Your Expertise</h3>
                <p>Help others grow while establishing yourself as an authority in your field.</p>
              </div>
              <div className="benefit-card">
                <h3>Earn Revenue</h3>
                <p>Create courses once and earn money whenever students enroll.</p>
              </div>
              <div className="benefit-card">
                <h3>Join Our Community</h3>
                <p>Connect with other instructors and expand your professional network.</p>
              </div>
            </div>
          </div>
        </div>
      );
      case 'lms':
      return (
        <div className="content-section lms-section">
          <div className="container">
            <h2>Learn Without Limits</h2>
            <p>Start, switch, or advance your career with courses, Professional Certificates, and degrees from world-class universities and companies.</p>
            <div className="lms-actions">
              <button className="btn-primary">Browse Courses</button>
              <button className="btn-secondary">Learn More</button>
            </div>
          </div>
        </div>
      );
    default:
      return <div>Content not found</div>;
  }
};

export default Body;