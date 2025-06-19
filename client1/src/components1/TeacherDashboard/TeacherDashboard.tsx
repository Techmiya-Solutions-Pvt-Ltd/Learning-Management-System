import React, { useEffect, useState, useCallback } from 'react';
import Aiquestions from './Aiquestions';
import { getTeacherAssessments, getAssessmentDetails, Assigntostudents, deleteAssessmentAPI, getCoursesByTeacherId, getBlogsByTeacherId } from '../../services/api';
import { faBlog, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { toast } from "react-toastify";
// import './style.css'
import { useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FiMenu, FiX, FiMoreVertical } from 'react-icons/fi';
import {
  faBook,
  faChartBar,
  faFolder,
  faTasks,
  faUser,
  faSignOutAlt,
  faSearch,
  faPlus,
  faTimes,
  faArrowLeft,
  faEdit,
  faRobot,
  faFilePdf,
  faFileVideo,
  faIdCard,
  faBuilding,
  faCalendarAlt,
  faLock
} from '@fortawesome/free-solid-svg-icons';

interface Course {
  id: string;
  course_name: string;
  course_type: string;
  course_duration: string;
  course_description: string;
  course_category: string;
}
interface Question {
  question: string;
  options: string[];
  corrected: number;
}

interface Assessment {
  exists: boolean;
  type: string;

  _id: string;
  teacher_id: string;
  assessment_name?: string;
  name?: string;
  title?: string; alternative
  time_allotment: string;
  questions: Record<string, Question>;
  ai: boolean;
  timestamp: string;
  is_assigned?: boolean;
}

interface UserData {
  id: string;
  full_name: string;
  email: string;
  date_joined: string | null;
  username: string;
}

const TeacherDashboard: React.FC = () => {
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.clear();
    sessionStorage.clear();
    setToken(null);
    window.location.replace("/");
    // navigate('/');
  };
  const [activeSection, setActiveSection] = useState('courses');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showAssessmentModal1, setShowAssessmentModal1] = useState(false);
  const [viewAssessment, setViewAssessment] = useState(false);
  const [viewAssessment1, setViewAssessment1] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<{ id: string, name: string }>({ id: '', name: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResourceCourse, setSelectedResourceCourse] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const storedUser = localStorage.getItem("user");
  const [isAssigning, setIsAssigning] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'notAssigned' | 'assigned'>('all');
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [courses, setCourses] = useState([]);
  const [Blogs, setBlogs] = useState([]);


  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const deleteAssessment = async (id: string, name: string) => {
    try {
      console.log("Deleting assessment:", id);
      const response = await deleteAssessmentAPI(id);
      console.log(response);
      toast.success(`${name} Assessment deleted successfully`);
      fetchAssessments();
      // Refresh assessment list here
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete assessment");
    }
  };
  const [dropdownVisible, setDropdownVisible] = useState(null);

  const handleArchive = (courseId) => {
    // Your archive logic here
    console.log("Archiving", courseId);
    setDropdownVisible(null);
  };


  const assignAgain = (id: string) => {
    console.log('Assigning again assessment:', id);
    // TODO: Implement re-assign logic here
  };
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleAssignAssessment = async (assessmentId) => {
    setIsAssigning(true);
    try {
      await Assigntostudents(assessmentId);

      setAssessments(prev => prev.map(assessment =>
        assessment._id === assessmentId
          ? { ...assessment, is_assigned: true }
          : assessment
      ));
      // If using selectedAssessment from state:
      setSelectedAssessment(prev => ({ ...prev, is_assigned: true }));
    } catch (error) {
      console.error('Assignment failed:', error);
      // Optionally show error to user
    } finally {
      setIsAssigning(false);
    }
  };


  let userData: UserData | null = null;

  if (storedUser) {
    const apiData = JSON.parse(storedUser);

    userData = {
      id: apiData.id,
      full_name: `${apiData.first_name} ${apiData.last_name}`,
      email: apiData.email,
      date_joined: apiData.date_joined ?? null,
      username: apiData.username,

    };
  }


  const assignedCourses: Course[] = [
    {
      id: "math101",
      course_name: "Introduction to Mathematics",
      course_type: "Math",
      course_duration: "8 weeks",
      course_description: "Basic math concepts for beginners.",
      course_category: "STEM"
    },
    {
      id: "eng202",
      course_name: "Advanced English Literature",
      course_type: "English",
      course_duration: "12 weeks",
      course_description: "Analysis of classic literature with focus on 19th century works.",
      course_category: "Humanities"
    }
  ];
  const [assessments, setAssessments] = useState([]);



  const sampleQuestions: Record<string, string[]> = {
    'math101': [
      "If x² + 3x + 2 = 0, what are the values of x?",
      "Solve the equation: 2(3x - 4) = 5x - 8",
      "Find the derivative of f(x) = x³ - 4x² + 5x - 7"
    ],
    'eng202': [
      "Analyze the main themes in Jane Austen's 'Pride and Prejudice'",
      "Compare and contrast the writing styles of Shakespeare and Marlowe",
      "Discuss the significance of symbolism in 'The Great Gatsby'"
    ]
  };


  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const teacherId = JSON.parse(localStorage.getItem('user'))?.id;

        if (!teacherId) {
          console.error('Teacher ID not found in localStorage');
          return;
        }

        const data = await getCoursesByTeacherId(teacherId);
        console.log('Fetched courses:', data);
        setCourses(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCourses();
  }, []);
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const teacherId = JSON.parse(localStorage.getItem('user'))?.id;

        if (!teacherId) {
          console.error('Teacher ID not found in localStorage');
          return;
        }
console.log('dvnovnoivn');
        const data = await getBlogsByTeacherId(teacherId);
        console.log('Fetched blog:', data);
        setBlogs(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchBlogs();
  }, []);

  const filteredCourses = assignedCourses.filter(course => {
    const searchLower = searchTerm.toLowerCase();
    return (
      course.course_name.toLowerCase().includes(searchLower) ||
      course.course_description.toLowerCase().includes(searchLower) ||
      course.course_category.toLowerCase().includes(searchLower)
    );
  });

  const handleAddAssessment = (courseId: string, courseName: string) => {
    if (assessments[courseId].exists) {
      showAssessment(courseId, courseName);
    } else {
      setSelectedCourse({ id: courseId, name: courseName });
      setShowAssessmentModal(true);
    }
  };

  const showAssessment = (courseId: string, courseName: string) => {
    setSelectedCourse({ id: courseId, name: courseName });
    setViewAssessment(true);
    setActiveSection('assessments');
  };

  const createAssessment = (type: string) => {
    const { id, name } = selectedCourse;
    assessments[id] = {
      exists: true,
      type: type,
      title: `${name} ${type} Assessment`
    };
    setShowAssessmentModal(false);
    showAssessment(id, name);
  };
  const createAssessment1 = (type: string) => {

    setShowAssessmentModal1(false);
    setViewAssessment1(true);
    // showAssessment(id, name);
    setActiveSection('assessments');
  };
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);


  const viewAssessment3 = async (assessmentId: string) => {
    try {
      console.log('Fetching assessment with ID:', assessmentId);
      const assessment = await getAssessmentDetails(assessmentId); // Make sure this API call exists
      console.log('API response:', assessment);
      setSelectedAssessment(assessment);
      setIsModalOpen(true);
      // setShowAssessmentModal1(true);
    } catch (error) {
      console.error('Error fetching assessment:', error);
    }
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAssessment(null);
  };

  // Helper function to determine if a section should be displayed
  const isSectionVisible = (sectionName: string) => {
    if (sectionName === 'assessments' && viewAssessment1) {
      return activeSection === 'assessments';
    } else if (sectionName === 'assessmentsMain') {
      return activeSection === 'assessments' && !viewAssessment1;
    }
    return sectionName === activeSection;
  };
  // useEffect(() => {
  //   const fetchAssessments = async () => {
  //     try {
  //       const data = await getTeacherAssessments(userData.id);
  //       setAssessments(data);

  //     } catch (err) {

  //       console.error('Error fetching assessments:', err);
  //     } finally {

  //     }
  //   };

  //   fetchAssessments();
  // }, [userData.id]);
  const allCount = assessments.length;
  const assignedCount = assessments.filter(a => a.is_assigned).length;
  const notAssignedCount = assessments.filter(a => !a.is_assigned).length;

  const fetchAssessments = useCallback(async () => {
    try {
      const data = await getTeacherAssessments(userData.id);
      setAssessments(data);
    } catch (err) {
      console.error('Error fetching assessments:', err);
    }
  }, [userData.id]);
  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);


  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${selectedAssessment.assessment_name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .print-header { text-align: center; margin-bottom: 30px; }
          .assessment-title { font-size: 22px; color: #2c3e50; }
          .meta-info { margin: 10px 0; color: #7f8c8d; }
          .question { margin-bottom: 30px; page-break-inside: avoid; }
          .question-text { font-weight: bold; margin-bottom: 10px; }
          .options { list-style-type: none; padding-left: 20px; }
          .option { margin: 8px 0; position: relative; }
          .correct { font-weight: bold; color: #27ae60; }
          .option-letter { font-weight: bold; color: #3498db; }
          @page { size: auto; margin: 10mm; }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1 class="assessment-title">${selectedAssessment.assessment_name}</h1>
          <div class="meta-info">
            <span>Time Allocated: ${selectedAssessment.time_allotment} minutes</span>
            ${selectedAssessment.ai ? '<span> | AI Generated</span>' : ''}
          </div>
        </div>
  
        ${Object.entries(selectedAssessment.questions).map(([key, question]) => `
          <div class="question">
            <div class="question-text">Question ${parseInt(key)}: ${question.question}</div>
            <ol class="options" type="A">
              ${question.options.map((option, index) => `
                <li class="option ${index === question.corrected ? 'correct' : ''}">
                  <span class="option-letter">${String.fromCharCode(65 + index)}.</span>
                  <span class="option-text">${option}</span>
                </li>
              `).join('')}
            </ol>
          </div>
        `).join('')}
  
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 300);
          }
        </script>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
  };
  const [showHamburger, setShowHamburger] = useState(false);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.menu-wrapper')) {
        setDropdownVisible(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    let timer;
    if (isMobile && !sidebarOpen) {
      timer = setTimeout(() => {
        setShowHamburger(true);
      }, 100); // 3 second delay
    } else {
      setShowHamburger(false);
      if (timer) clearTimeout(timer);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isMobile, sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="dashboard">
      {/* Mobile Menu Toggle (Three Dots) */}
     

      {/* Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}


      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <h1>TeacherPortal</h1>
          {isMobile && (
            <button 
              className="close-sidebar" 
              onClick={toggleSidebar}
              aria-label="Close navigation"
            >
              <FiX size={24} />
            </button>
          )}
        </div>
        <ul className="nav-links">
          <li
            className={`nav-link ${activeSection === 'courses' ? 'active' : ''}`}
            onClick={() => { setActiveSection('courses'); setViewAssessment(false); }}
          >
            <FontAwesomeIcon icon={faBook} /> Your Courses
          </li>
          <li
            className={`nav-link ${activeSection === 'performance' ? 'active' : ''}`}
            onClick={() => { setActiveSection('performance'); setViewAssessment(false); }}
          >
            <FontAwesomeIcon icon={faChartBar} /> Performance
          </li>
          <li
            className={`nav-link ${activeSection === 'resources' ? 'active' : ''}`}
            onClick={() => { setActiveSection('resources'); setViewAssessment(false); }}
          >
            <FontAwesomeIcon icon={faFolder} /> Resources
          </li>
          <li
            className={`nav-link ${activeSection === 'assessments' ? 'active' : ''}`}
            onClick={() => { setActiveSection('assessments'); setViewAssessment(false); }}
          >
            <FontAwesomeIcon icon={faTasks} /> Assessments
          </li>
          <li
            className={`nav-link ${activeSection === 'blog' ? 'active' : ''}`}
            onClick={() => { setActiveSection('blog'); setViewAssessment(false); }}
          >
            <FontAwesomeIcon icon={faBlog} /> Blog
          </li>
        </ul>
        <div className="account-section">
          <li
            className={`nav-link ${activeSection === 'account' ? 'active' : ''}`}
            onClick={() => { setActiveSection('account'); setViewAssessment(false); }}
          >
            <FontAwesomeIcon icon={faUser} /> Account
          </li>
          <li className="nav-link" onClick={handleLogout} style={{ cursor: "pointer" }}>
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
          </li>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
      
        {/* Courses Section */}
        
        <section className={`section ${isSectionVisible('courses') ? 'active' : ''}`} id="courses-section">
        <div className="top-bar">
  {showHamburger && (
    <div className="hamburger-container">
      <button 
        className="hamburger-toggle" 
        onClick={toggleSidebar}
        aria-label="Toggle navigation"
        aria-expanded={sidebarOpen}
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>
    </div>
  )}

  <div className="search-bar">
    <input
      type="text"
      placeholder="Search courses..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    <FontAwesomeIcon icon={faSearch} />
  </div>
</div>

          <h2 >Your Courses</h2>
          <div className="card-grid">
            <div className="card add-card" onClick={() => navigate('/create_course')}>
              <FontAwesomeIcon icon={faPlus} />
              <p>Add New Course</p>
            </div>

            {courses.map((course) => (
              <div
                className="card course-card"
                key={course._id}
                style={{ position: 'relative' }}
                onClick={() => setDropdownVisible(null)} // close on card click
              >
                <div className="menu-wrapper" onClick={(e) => e.stopPropagation()}>
                  <div
                    className="menu-icon"
                    onClick={() => setDropdownVisible(dropdownVisible === course._id ? null : course._id)}
                  >
                    &#8942;
                  </div>

                  {dropdownVisible === course._id && (
                    <div className="dropdown-menu">
                      <div className="menu-manage" onClick={() => navigate(`/manage_course/${course._id}`)}>Manage</div>
                      <div className="menu-archive" onClick={() => handleArchive(course._id)}>Archive</div>
                    </div>
                  )}
                </div>

                <h3>{course.title}</h3>
                <p className="course-meta">Chapters: {course.chapters?.length || 0}</p>
                <p className="course-description">Created: {new Date(course.created_at).toLocaleDateString()}</p>

                <span className="course-tag">ID: {course._id.slice(0, 6)}...</span>
              </div>

            ))}

          </div>
        </section>


        {/*Blog */}
        <section className={`section ${isSectionVisible('blog') ? 'active' : ''}`} id="courses-section">
        <div className="top-bar">
  {showHamburger && (
    <div className="hamburger-container">
      <button 
        className="hamburger-toggle" 
        onClick={toggleSidebar}
        aria-label="Toggle navigation"
        aria-expanded={sidebarOpen}
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>
    </div>
  )}

  <div className="search-bar">
    <input
      type="text"
      placeholder="Search courses..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    <FontAwesomeIcon icon={faSearch} />
  </div>
</div>

          <h2 >Your Blogs</h2>
          <div className="card-grid">
            <div className="card add-card" onClick={() => navigate('/create_blog')}>
              <FontAwesomeIcon icon={faPlus} />
              <p>Add New Blog</p>
            </div>
            {Blogs.map((blog) => (
        <div
        className="card course-card"
        key={blog._id}
        style={{ position: 'relative' }}
        onClick={() => setDropdownVisible(null)} // close on card click
      >
        <div className="menu-wrapper" onClick={(e) => e.stopPropagation()}>
          <div
            className="menu-icon"
            onClick={() => setDropdownVisible(dropdownVisible === blog._id ? null : blog._id)}
          >
            &#8942;
          </div>

          {dropdownVisible === blog._id && (
            <div className="dropdown-menu">
              <div className="menu-manage" onClick={() => navigate(`/manage_blog/${blog._id}`)}>Manage</div>
              <div className="menu-archive" onClick={() => handleArchive(blog._id)}>Archive</div>
            </div>
          )}
        </div>

        <h3>{blog.title}</h3>
        <p className="course-meta">Chapters: {blog.chapters?.length || 0}</p>
        <p className="course-description">Created: {new Date(blog.created_at).toLocaleDateString()}</p>

        <span className="course-tag">ID: {blog._id.slice(0, 6)}...</span>
      </div>
      ))}

            

          </div>
        </section>

        {/* Performance Section */}
        <section className={`section ${isSectionVisible('performance') ? 'active' : ''}`} id="performance-section">
        <div className="top-bar">
  {showHamburger && (
    <div className="hamburger-container">
      <button 
        className="hamburger-toggle" 
        onClick={toggleSidebar}
        aria-label="Toggle navigation"
        aria-expanded={sidebarOpen}
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>
    </div>
  )}

  <div className="search-bar">
    <input
      type="text"
      placeholder="Search courses..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    <FontAwesomeIcon icon={faSearch} />
  </div>
</div>
          <h2>Student Performance</h2>
          <div className="card-grid">
            <div className="card performance-card">
              <h3>Introduction to Mathematics</h3>
              <div className="performance-data">
                <div className="performance-stat">
                  <div className="stat-value">85%</div>
                  <div className="stat-label">Average Score</div>
                </div>
                <div className="performance-stat">
                  <div className="stat-value">24/30</div>
                  <div className="stat-label">Completion Rate</div>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '80%' }}></div>
              </div>
            </div>

            <div className="card performance-card">
              <h3>Advanced English Literature</h3>
              <div className="performance-data">
                <div className="performance-stat">
                  <div className="stat-value">78%</div>
                  <div className="stat-label">Average Score</div>
                </div>
                <div className="performance-stat">
                  <div className="stat-value">18/25</div>
                  <div className="stat-label">Completion Rate</div>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '72%' }}></div>
              </div>
            </div>
          </div>
        </section>
        

        {/* Assessments Section - Main View */}
        <section className={`section ${isSectionVisible('assessmentsMain') ? 'active' : ''}`} id="assessments-main-section">
        <div className="top-bar">
  {showHamburger && (
    <div className="hamburger-container">
      <button 
        className="hamburger-toggle" 
        onClick={toggleSidebar}
        aria-label="Toggle navigation"
        aria-expanded={sidebarOpen}
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>
    </div>
  )}

  <div className="search-bar">
    <input
      type="text"
      placeholder="Search courses..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    <FontAwesomeIcon icon={faSearch} />
  </div>
</div>
          <div className="filter-tabs">
            <button
              className={`tab ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All ({allCount})
            </button>
            <button
              className={`tab ${activeFilter === 'notAssigned' ? 'active' : ''}`}
              onClick={() => setActiveFilter('notAssigned')}
            >
              Not Assigned ({notAssignedCount})
            </button>
            <button
              className={`tab ${activeFilter === 'assigned' ? 'active' : ''}`}
              onClick={() => setActiveFilter('assigned')}
            >
              Assigned ({assignedCount})
            </button>
          </div>
          <h2>Create Assessments</h2>
          <div className="card-grid assessment-card-grid">
            <div className="card add-card" onClick={() => setShowAssessmentModal1(true)}>
              <FontAwesomeIcon icon={faPlus} />
              <p>Add New Assessment</p>
            </div>


            {assessments
              .filter(assessment => {
                if (activeFilter === 'all') return true;
                if (activeFilter === 'assigned') return assessment.is_assigned;
                if (activeFilter === 'notAssigned') return !assessment.is_assigned;
                return true;
              })
              .map((assessment) => (
                <div key={assessment._id} className="card course-card assessment-course-card">
                  <div className="card-header">
                    <h3>{assessment.assessment_name}</h3>
                    <div className="card-menu">
                      <FontAwesomeIcon
                        icon={faEllipsisV}
                        className="menu-icon"
                        onClick={() => toggleMenu(assessment._id)}
                      />
                      {openMenuId === assessment._id && (
                        <div className="menu-dropdown">
                          <button onClick={() => deleteAssessment(assessment._id, assessment.assessment_name)}>
                            Archive
                          </button>

                          {assessment.is_assigned && (
                            <button onClick={() => assignAgain(assessment._id)}>Assign Again</button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="course-meta">
                    Time Allocated: {assessment.time_allotment} min
                  </p>
                  <p className="course-description">
                    {assessment.assessment_name} consists of{' '}
                    {Object.keys(assessment.questions).length} Questions
                  </p>
                  {assessment.ai && (
                    <span className="course-tag">AI generated</span>
                  )}
                  <div className="button-container">
                    <button className="btn btn-primary">Add Assessment</button>
                    <button
                      className="btn btn-primary"
                      onClick={() => viewAssessment3(assessment._id)}
                    >
                      View Assessment
                    </button>
                  </div>
                </div>
              ))
            }


          </div>
        </section>
        <section className={`section ${viewAssessment1 && activeSection === 'assessments' ? 'active' : ''}`} id="view-assessment-section">
          <div className="back-navigation">
            <button className="btn-back" onClick={() => setViewAssessment1(false)}>
              <FontAwesomeIcon icon={faArrowLeft} /> Back to Assessments
            </button>
          </div>
          <h2>Assessment Details:</h2>


          <Aiquestions

            fetchAssessments={fetchAssessments} />
        </section>
        {/* View Assessment Section */}
        <section className={`section ${viewAssessment && activeSection === 'assessments' ? 'active' : ''}`} id="view-assessment-section">
          <div className="back-navigation">
            <button className="btn-back" onClick={() => setViewAssessment(false)}>
              <FontAwesomeIcon icon={faArrowLeft} /> Back to Assessments
            </button>
          </div>
          <h2>Assessment Details: <span id="assessment-title">{assessments[selectedCourse.id]?.title}</span></h2>

          <div className="card assessment-details-card">
            <div className="assessment-header">
              <h3 id="assessment-course-name">{selectedCourse.name}</h3>
              <span className="assessment-type" id="assessment-type-badge">
                {assessments[selectedCourse.id]?.type}
              </span>
            </div>

            <div className="assessment-info">
              <div className="info-row">
                <span className="info-label">Created:</span>
                <span className="info-value" id="assessment-created-date">March 9, 2025</span>
              </div>
              <div className="info-row">
                <span className="info-label">Questions:</span>
                <span className="info-value" id="assessment-question-count">
                  {sampleQuestions[selectedCourse.id]?.length || 0}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Time limit:</span>
                <span className="info-value" id="assessment-time-limit">60 minutes</span>
              </div>
            </div>

            <div className="assessment-questions">
              <h4>Questions Preview</h4>
              <div className="question-list" id="question-list">
                {sampleQuestions[selectedCourse.id]?.map((question, index) => (
                  <div className="question-item" key={index}>
                    <span className="question-number">Q{index + 1}:</span>
                    <span className="question-text">{question}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="assessment-actions">
              <button className="btn btn-primary" id="edit-assessment">Edit Assessment</button>
              <button className="btn btn-secondary" id="assign-assessment">Assign to Students</button>
            </div>
          </div>
        </section>

        {/* Resources Section */}
        <section className={`section ${isSectionVisible('resources') ? 'active' : ''}`} id="resources-section">
        <div className="top-bar">
  {showHamburger && (
    <div className="hamburger-container">
      <button 
        className="hamburger-toggle" 
        onClick={toggleSidebar}
        aria-label="Toggle navigation"
        aria-expanded={sidebarOpen}
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>
    </div>
  )}

  <div className="search-bar">
    <input
      type="text"
      placeholder="Search courses..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    <FontAwesomeIcon icon={faSearch} />
  </div>
</div>
          <h2>Course Resources</h2>
          <div className="resource-selector">
            <label htmlFor="resource-course-select">Select Course:</label>
            <select
              id="resource-course-select"
              value={selectedResourceCourse}
              onChange={(e) => setSelectedResourceCourse(e.target.value)}
            >
              <option value="">Choose a course</option>
              {assignedCourses.map(course => (
                <option key={course.id} value={course.id}>{course.course_name}</option>
              ))}
            </select>
          </div>

          <div className="card-grid">
            <div className="card add-card">
              <FontAwesomeIcon icon={faPlus} />
              <p>Add New Resource</p>
            </div>

            <div className="card resource-card">
              <div className="resource-icon">
                <FontAwesomeIcon icon={faFilePdf} />
              </div>
              <div className="resource-details">
                <h3>Course Syllabus</h3>
                <p>Complete course outline and requirements</p>
                <div className="resource-actions">
                  <button className="btn btn-primary">View</button>
                  <button className="btn btn-secondary">Share</button>
                </div>
              </div>
            </div>

            <div className="card resource-card">
              <div className="resource-icon">
                <FontAwesomeIcon icon={faFileVideo} />
              </div>
              <div className="resource-details">
                <h3>Lecture Recordings</h3>
                <p>Video recordings of all lectures</p>
                <div className="resource-actions">
                  <button className="btn btn-primary">View</button>
                  <button className="btn btn-secondary">Share</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Account Section */}
        <section className={`section ${isSectionVisible('account') ? 'active' : ''}`} id="account-section">
          <h2>Account Details</h2>
          <div className="card account-card">
            <div className="account-header">
              <div className='avatar'>
                <div className="account-avatar">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100" height="100">
                    <circle cx="12" cy="12" r="12" fill="lightgray" />
                    <circle cx="12" cy="8" r="4" fill="gray" />
                    <path d="M6 20c0-4 2.5-7 6-7s6 3 6 7" fill="gray" />
                  </svg>
                </div>
              </div>
              <h3 className="account-name">{userData.full_name}</h3>
              <p className="account-email">{userData.email}</p>
            </div>

            <div className="account-details">
              <div className="detail-item">
                <FontAwesomeIcon icon={faIdCard} />
                <span className="detail-label">Teacher ID:</span>
                <span className="detail-value">{userData.id}</span>
              </div>
              <div className="detail-item">
                <FontAwesomeIcon icon={faUser} />
                <span className="detail-label">Teacher Username :</span>
                <span className="detail-value">{userData.username}</span>
              </div>
              <div className="detail-item">
                <FontAwesomeIcon icon={faBuilding} />
                <span className="detail-label">Department:</span>
                <span className="detail-value">Mathematics</span>
              </div>
              <div className="detail-item">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span className="detail-label">Joined On:</span>
                <span className="detail-value">{userData.date_joined}</span>
              </div>
            </div>

            <div className="account-actions">
              <button className="btn btn-edit-profile">
                <FontAwesomeIcon icon={faEdit} /> Edit Profile
              </button>
              <button className="btn btn-change-password">
                <FontAwesomeIcon icon={faLock} /> Change Password
              </button>
            </div>

            <div className="recent-activity">
              <h4>Recent Activity</h4>
              <ul>
                <li>
                  <FontAwesomeIcon icon={faBook} />
                  Created a new course: <strong>Introduction to Algebra</strong>
                </li>
                <li>
                  <FontAwesomeIcon icon={faFilePdf} />
                  Uploaded a new resource: <strong>Lecture Notes</strong>
                </li>
                <li>
                  <FontAwesomeIcon icon={faChartBar} />
                  Updated performance metrics for <strong>Advanced Calculus</strong>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>


      {/* Add Course Modal */}
      {showCourseModal && (
        <div className="modal-overlay active" id="course-modal" onClick={() => setShowCourseModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Course</h3>
              <FontAwesomeIcon icon={faTimes} onClick={() => setShowCourseModal(false)} />
            </div>

            <form>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="course-name">Course Name</label>
                  <input type="text" id="course-name" placeholder="Enter course name" required />
                </div>

                <div className="form-group">
                  <label htmlFor="course-type">Course Type</label>
                  <input type="text" id="course-type" placeholder="e.g. Math, Science, Language" required />
                </div>

                <div className="form-group">
                  <label htmlFor="course-description">Course Description</label>
                  <textarea id="course-description" rows={2} placeholder="Describe your course" required></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="course-category">Course Category</label>
                  <select id="course-category" required>
                    <option value="">Choose a category</option>
                    <option value="Development">Development</option>
                    <option value="Business">Business</option>
                    <option value="Finance & Accounting">Finance & Accounting</option>
                    <option value="IT & Software">IT & Software</option>
                    <option value="Office Productivity">Office Productivity</option>
                    <option value="Personal Development">Personal Development</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Photography & Video">Photography & Video</option>
                    <option value="Health & Fitness">Health & Fitness</option>
                    <option value="Music">Music</option>
                    <option value="Teaching & Academics">Teaching & Academics</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="course-duration">Approximate Duration</label>
                  <input type="text" id="course-duration" placeholder="e.g. 8 weeks, 3 months" required />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCourseModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Course</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && selectedAssessment && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Header Section */}
            <div className="modal-header">
              <div className="header-left">
                <h3 className="assessment-title">{selectedAssessment.assessment_name}</h3>
                <span className="time-allotment">
                  <i className="far fa-clock"></i> {selectedAssessment.time_allotment} min
                </span>
                {selectedAssessment.ai === true && (  // Explicitly check for true
                  <span className="ai-tag">
                    <i className="fas fa-robot"></i> AI Generated
                  </span>
                )}
              </div>
              <div className="header-right">

                <button className="close-button" onClick={closeModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            {/* Questions Section */}
            <div className="modal-body">
              <div className="questions-list">
                {Object.entries(selectedAssessment.questions).map(([key, question]) => (
                  <div key={key} className="question-item">
                    <div className="question-header">
                      <h4 className="question-text">Question {parseInt(key)}</h4>
                      <span className="question-points">1 point</span>
                    </div>
                    <p className="question-prompt">{question.question}</p>

                    {question.options.length > 0 ? (
                      <ul className="options-list">
                        {question.options.map((option, index) => {
                          const isCorrect = option === question.corrected;
                          return (
                            <li
                              key={index}
                              className={`option-item ${isCorrect ? 'correct-answer' : ''}`}
                            >
                              <span className="option-letter">{String.fromCharCode(65 + index)}.</span>
                              <span className="option-text">{option}</span>
                              {isCorrect && (
                                <span className="correct-badge">
                                  <i className="fas fa-check-circle"></i>
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="short-answer">
                        <strong>Correct Answer:</strong> {question.corrected}
                      </div>
                    )}
                  </div>
                ))}

              </div>
            </div>

            {/* Footer Section */}
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>
                <i className="fas fa-arrow-left"></i> Back to Assessments
              </button>
              <div className="footer-actions">
                <button className="btn btn-outline" onClick={handlePrint}>
                  <i className="fas fa-print"></i> Print
                </button>
                <button
                  className={`btn ${selectedAssessment.is_assigned ? 'btn-success' : 'btn-primary'}`}
                  onClick={() => handleAssignAssessment(selectedAssessment._id)}
                  disabled={selectedAssessment.is_assigned || isAssigning}
                >
                  {isAssigning ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Assigning...
                    </>
                  ) : selectedAssessment.is_assigned ? (
                    <>
                      <i className="fas fa-check"></i> Already Assigned
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i> Assign to Students
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAssessmentModal && (
        <div className="modal-overlay active" id="assessment-modal" onClick={() => setShowAssessmentModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Assessment for <span id="selected-course-name">{selectedCourse.name}</span></h3>
              <FontAwesomeIcon icon={faTimes} onClick={() => setShowAssessmentModal(false)} />
            </div>
            <div className="modal-body">
              <div className="assessment-options">
                <div className="assessment-option" onClick={() => navigate('/create-assessment')}>
                  <FontAwesomeIcon icon={faEdit} />
                  <h3>Create Manually</h3>
                  <p>Build an assessment from scratch</p>
                </div>

                <div className="assessment-option" onClick={() => createAssessment('AI Generated')}>
                  <FontAwesomeIcon icon={faRobot} />
                  <h3>Generate with AI</h3>
                  <p>Let AI create an assessment for you</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAssessmentModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showAssessmentModal1 && (
        <div className="modal-overlay active" id="assessment-modal" onClick={() => setShowAssessmentModal1(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Assessment </h3>
              <FontAwesomeIcon icon={faTimes} onClick={() => setShowAssessmentModal1(false)} />
            </div>
            <div className="modal-body">
              <div className="assessment-options">
                <div className="assessment-option" onClick={() => navigate('/create-assessment')}>
                  <FontAwesomeIcon icon={faEdit} />
                  <h3>Create Manually</h3>
                  <p>Build an assessment from scratch</p>
                </div>

                <div className="assessment-option" onClick={() => createAssessment1('AI Generated')}>
                  <FontAwesomeIcon icon={faRobot} />
                  <h3>Generate with AI</h3>
                  <p>Let AI create an assessment for you</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAssessmentModal1(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        :root {
          --primary-color: #3498db;
          --sidebar-width: 250px;
          --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          --transition: all 0.3s ease;
        }

        body {
          
          min-height: 100vh;
          background-color: #f5f7fa;
        }

        .dashboard {
          display: flex;
          width: 100%;
          min-height: 100vh;
        }

        .sidebar {
          width: var(--sidebar-width);
          background-color: #2c3e50;
          color: white;
          height: 100vh;
          position: fixed;
          z-index: 100;
        }

        .sidebar-header {
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidebar-header h1 {
          font-size: 1.5rem;
        }

        .nav-links {
          list-style: none;
          padding: 20px 0;
        }

        .nav-link {
          padding: 15px 20px;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: var(--transition);
        }

        .nav-link:hover, .nav-link.active {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .nav-link svg {
          margin-right: 10px;
          width: 20px;
          text-align: center;
        }

        .account-section {
          position: absolute;
          bottom: 0;
          width: 100%;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .main-content {
          flex: 1;
          margin-left: var(--sidebar-width);
          padding: 20px;
          position: relative;
        }

        .section {
          display: none;
        }

        .section.active {
          display: block;
         
        }

        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .card {
          background-color: white;
          border-radius: 8px;
          box-shadow: var(--shadow);
          padding: 20px;
          transition: var(--transition);
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        }

        .add-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 2px dashed #ccc;
          cursor: pointer;
          min-height: 200px;
        }

        .add-card svg {
          font-size: 2rem;
          margin-bottom: 10px;
          color: #ccc;
        }

        .course-card h3 {
          font-size: 1.2rem;
          margin-bottom: 10px;
        }

        .course-meta {
          color: #777;
          margin-bottom: 10px;
          font-size: 0.9rem;
        }

        .course-description {
          margin-bottom: 15px;
        }

        .course-tag {
          display: inline-block;
          background-color: #e3f2fd;
          color: #2196f3;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
        }

        .performance-card {
          position: relative;
          padding-bottom: 40px;
        }

        .performance-data {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
        }

        .performance-stat {
          text-align: center;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--primary-color);
        }

        .stat-label {
          font-size: 0.8rem;
          color: #777;
        }

        .progress-bar {
          height: 8px;
          background-color: #eee;
          border-radius: 4px;
          margin-top: 15px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background-color: var(--primary-color);
        }

        /* Modal styles */
        .modal-overlay {
          position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: 1;
  visibility: visible;
  transition: opacity 0.3s ease;
        }
  .modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.modal-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  color: white;
  background-color:rgb(36, 36, 36);
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.questions-list {
  margin-top: 20px;
}

.question-item {
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.options-list {
  list-style-type: none;
  padding-left: 20px;
}

.options-list li {
  margin: 8px 0;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

.options-list li.correct-answer {
  background: #e6f7e6;
  border-left: 3px solid #4CAF50;
}

.modal-footer {
  margin-top: 20px;
  text-align: right;
}
  /* Add these to your stylesheet */
.correct-answer {
  background-color: #e8f5e9;
  border-left: 3px solid #4CAF50;
  padding: 8px 12px;
  margin: 4px 0;
  border-radius: 4px;
}

.correct-badge {
  color: #2E7D32;
  font-weight: bold;
  margin-left: 8px;
}

.options-list {
  list-style: none;
  padding: 0;
  margin: 12px 0;
}

.options-list li {
  padding: 8px 12px;
  margin: 4px 0;
  border-radius: 4px;
  background: #f5f5f5;
}
        .modal-overlay.active {
          visibility: visible;
          opacity: 1;
        }

        .modal {
          background-color: white;
          border-radius: 8px;
          box-shadow: var(--shadow);
          width: 100%;
          max-width: 600px;
          transition: var(--transition);
          transform: translateY(-20px);
        }

        .modal-overlay.active .modal {
          transform: translateY(0);
        }

        .modal-header {
          padding: 15px 20px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-body {
          padding: 20px;
        }

        .modal-footer {
          padding: 15px 20px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
        }

        .form-group {
          margin-bottom: 15px;
        }

        select {
          width: 100%;
          max-height: 200px;
          overflow-y: auto;
        }

/* Filter Tabs  assigment*/
.filter-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  
}

.filter-tabs .tab {
  padding: 8px 16px;
  border-radius: 20px;
  background: #f0f0f0;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-tabs .tab.active {
  background: #4a6bff;
  color: white;
}

.filter-tabs .tab:hover {
  background: #e0e0e0;
}

.filter-tabs .tab.active:hover {
  background: #3a5bef;
}





          /* Modal Layout */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* Header Styles */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  gap: 10px;
}

.assessment-title {
  margin: 0;
  color:rgb(187, 183, 183);
 
  margin: 0;
  
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.3;
}

.time-allotment {
  margin: 5px 0 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
}
  .modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
}

.assessment-info {
  flex: 1;
}



.meta-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.time-allotment, .ai-tag {
  font-size: 0.85rem;
  color: #7f8c8d;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.ai-tag {
  background-color: #f3e8ff;
  color: #7e22ce;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
  font-weight: 500;
}

.ai-tag i {
  font-size: 0.8em;
}

.time-allotment {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #64748b;
  font-size: 0.85rem;
}

.close-button {
  background: none;
  border: none;
  color: #95a5a6;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s;
}
  .menu-wrapper {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

.menu-icon {
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
}

.dropdown-menu {
  position: absolute;
  top: 25px;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  min-width: 120px;
  overflow: hidden;
}

.dropdown-menu div {
  padding: 10px 14px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.menu-manage {
  color: #007bff;
}

.menu-archive {
  color: #dc3545;
}

.menu-manage:hover {
  background-color: #e9f4ff;
}

.menu-archive:hover {
  background-color: #fde7e9;
}


.close-button:hover {
  color: #e74c3c;
}

/* Question Styles */
.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.question-item {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.question-text {
  margin: 0;
  color: #34495e;
  font-size: 1.1rem;
}

.question-points {
  color: #7f8c8d;
  font-size: 0.85rem;
}

.question-prompt {
  margin: 0 0 15px;
  color: #2c3e50;
  line-height: 1.5;
}

/* Options List */
.options-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.option-item {
  padding: 10px 15px;
  margin: 8px 0;
  border-radius: 6px;
  background: #f9f9f9;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.option-item:hover {
  background: #f0f0f0;
}

.option-letter {
  font-weight: bold;
  margin-right: 10px;
  color:rgb(71, 67, 67);
  min-width: 20px;
}

.option-text {
  flex: 1;
}

.correct-answer {
  background: #e8f8f0;
  border-left: 3px solid #2ecc71;
}

.correct-badge {
  color: #2ecc71;
  margin-left: 10px;
}
  .card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  position: relative;
}

.card-menu {
  position: relative;
}

.menu-icon {
  cursor: pointer;
  font-size: 18px;
  padding: 6px;
  color: #555;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.menu-icon:hover {
  background-color: #f2f2f2;
}

.menu-dropdown {
  position: absolute;
  right: 0;
  top: 30px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  z-index: 999;
  min-width: 180px;
  overflow: hidden;
}

.menu-dropdown button {
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  width: 100%;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.menu-dropdown button:hover {
  background-color: #f9f9f9;
}

.menu-dropdown button:nth-child(1) {
  color: #d32f2f; /* red for delete */
}

.menu-dropdown button:nth-child(1):hover {
  background-color: #ffeaea;
}

.menu-dropdown button:nth-child(2) {
  color: #1565c0; /* blue for assign again */
}

.menu-dropdown button:nth-child(2):hover {
  background-color: #e3f2fd;
}


/* Footer Styles */
.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-actions {
  display: flex;
  gap: 10px;
}

/* Buttons */
// .btn {
//   padding: 8px 16px;
//   border-radius: 6px;
//   border: none;
//   cursor: pointer;
//   font-weight: 500;
//   display: inline-flex;
//   align-items: center;
//   gap: 8px;
//   transition: all 0.2s;
// }

// .btn-secondary {
//   background: #f0f0f0
//       }

        /* Account Section Styles */
        .account-card {
          max-width: 700px;
          margin: 0 auto;
          padding: 25px 40px;
          background-color: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
        }
        
        .account-header {
          text-align: center;
          margin-bottom: 20px;
        }
          .avatar{
            display: flex;
            justify-content: center;}
        
        .account-avatar img {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          padding-left: 10px;
          
          border: 2px solid #e0e0e0;
        }
        
        .account-name {
          font-size: 1.25rem;
          margin: 10px 0 5px;
          color: #2c3e50;
        }
        
        .account-email {
          font-size: 0.9rem;
          color: #777;
        }
        
        .account-details {
          margin: 20px 0;
        }
        
        .detail-item {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          font-size: 0.9rem;
        }
        
        .detail-item svg {
          width: 20px;
          color: #3498db;
          margin-right: 10px;
        }
        
        .detail-label {
          color: #777;
          margin-right: 8px;
        }
        
        .detail-value {
          color: #2c3e50;
          font-weight: 500;
        }
        
        .account-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        
        .btn-edit-profile,
        .btn-change-password {
          flex: 1;
          padding: 8px 12px;
          font-size: 0.9rem;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          background-color: #f9f9f9;
          color: #2c3e50;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        
        .btn-edit-profile:hover,
        .btn-change-password:hover {
          background-color: #e0e0e0;
        }
        
        /* Recent Activity Styles */
        .recent-activity {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }
        
        .recent-activity h4 {
          font-size: 1.1rem;
          margin-bottom: 15px;
          color: #2c3e50;
        }
        
        .recent-activity ul {
          list-style: none;
          padding: 0;
        }
          h2 {
    font-size: 1.5rem;
    color: #2c3e50;
    margin-bottom: 20px;
    font-weight: 600;
    padding-bottom: 10px;
    border-bottom: 1px solid #ecf0f1;
  }
        
        .recent-activity li {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          font-size: 0.9rem;
          color: #555;
        }
        
        .recent-activity li svg {
          margin-right: 10px;
          color: #3498db;
        }

        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }

        input, select, textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        .btn {
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          border: none;
          transition: var(--transition);
        }

        .btn-primary {
          background-color: var(--primary-color);
          color: white;
        }

        .btn-secondary {
          background-color: #e0e0e0;
          color: #333;
          margin-right: 10px;
        }

        .btn:hover {
          opacity: 0.9;
        }

        .assessment-course-card {
          position: relative;
          padding-bottom: 60px;
        }
        
        .assessment-course-card .btn {
          position: absolute;
          bottom: 20px;
          left: 20px;
          right: 20px;
        }
        
        #assessment-modal .assessment-options {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
        }
        
        #assessment-modal .assessment-option {
          flex: 1;
          padding: 20px;
          background-color: white;
          box-shadow: var(--shadow);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 0 10px;
          cursor: pointer;
          transition: var(--transition);
        }
        
        #assessment-modal .assessment-option:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        }
        
        #assessment-modal .assessment-option svg {
          font-size: 2rem;
          margin-bottom: 15px;
          color: var(--primary-color);
        }
          
        
        /* View Assessment Section Styles */
        .back-navigation {
          margin-bottom: 20px;
        }
        
        .btn-back {
          background: none;
          border: none;
          color: var(--primary-color);
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: var(--transition);
        }
        
        .btn-back svg {
          margin-right: 8px;
        }
        
        .btn-back:hover {
          opacity: 0.8;
        }
        
        .assessment-details-card {
          padding: 25px;
        }
        
        .assessment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        
        .assessment-type {
          background-color: #e3f2fd;
          color: var(--primary-color);
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
        }
        
        .assessment-info {
          margin-bottom: 25px;
        }
        
        .info-row {
          display: flex;
          margin-bottom: 10px;
        }
        
        .info-label {
          font-weight: 500;
          width: 100px;
        }
        
        .assessment-questions {
          margin-bottom: 25px;
        }
        
        .question-list {
          margin-top: 15px;
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 15px;
        }
        
        .question-item {
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        
        .question-item:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }
        
        .question-number {
          font-weight: 500;
          margin-right: 10px;
        }
        
        .assessment-actions {
          display: flex;
        }
        
        .assessment-actions .btn {
          margin-right: 10px;
        }
        
        .search-bar {
          margin-bottom: 20px;
          position: relative;
          max-width: 400px;
        }
        
        .search-bar input {
          width: 100%;
          padding: 10px 40px 10px 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        
        .search-bar svg {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #777;
          cursor: pointer;
        }

        .resource-selector {
          margin-bottom: 20px;
        }

        .resource-card {
          display: flex;
          align-items: center;
        }

        .resource-icon {
          width: 50px;
          height: 50px;
          background-color: #e3f2fd;
          color: var(--primary-color);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          margin-right: 15px;
        }

        .resource-details {
          flex: 1;
        }

        .resource-actions {
          display: flex;
          margin-top: 10px;
        }

        .resource-actions .btn {
          margin-right: 10px;
          font-size: 0.8rem;
          padding: 5px 10px;
        }
@media print {
  body * {
    visibility: hidden;
  }
  .modal-content {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: auto;
    margin: 0;
    padding: 20px;
    visibility: visible;
    overflow: visible;
  }
  .modal-header, .modal-footer {
    display: none;
  }
  .question-item {
    page-break-inside: avoid;
    break-inside: avoid;
    margin-bottom: 25px;
  }
  .options-list {
    list-style-type: upper-alpha;
    padding-left: 20px;
  }
  .correct-answer {
    font-weight: bold;
    color: #2ecc71 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
        @media (max-width: 768px) {
          .main-content {
            margin-left: 5px;
            margin-right: 5px;
            
           
          }
          
          .card-grid {
            grid-template-columns: 1fr;
          }
          
          #assessment-modal .assessment-options {
            flex-direction: column;
          }
          
          #assessment-modal .assessment-option {
            margin: 10px 0;
          }
          
          .assessment-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .assessment-type {
            margin-top: 10px;
          }
          
          .assessment-actions {
            flex-direction: column;
          }
          
          .assessment-actions .btn {
            margin-right: 0;
            margin-bottom: 10px;
            width: 100%;
          }
        }
          /* Mobile Menu Toggle */
.mobile-menu-toggle {
  display: none;
  position: fixed;
  top: 15px;
  left: 15px;
  z-index: 99;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* Sidebar Overlay */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 90;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.sidebar-overlay.active {
  opacity: 1;
  visibility: visible;
}

/* Close Button for Mobile */
.close-sidebar {
  display: none;
  background: none;
  border: none;
  color: white;
  position: absolute;
  right: 15px;
  top: 15px;
  cursor: pointer;
}

/* Responsive Behavior */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    width: 280px;
  }
  
  .sidebar.active {
    transform: translateX(0);
  }
  
 
  .mobile-menu-toggle {
    display: flex;
  }
  
  .close-sidebar {
    display: block;
  }
  
  .sidebar-header {
    position: relative;
    padding-right: 40px;
  }
}
  /* Professional Hamburger Menu */
.hamburger-container {
 
}

.hamburger-toggle {
margin-top: 0;
   background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 20px;
  width: 25px;
}

.hamburger-toggle:hover {
  background: #f8f9fa;
  transform: translateY(-2px);
}

.hamburger-line {
  height: 3px;
  width: 100%;
  background-color: #333;
  border-radius: 2px;
}

.hamburger-toggle:hover .hamburger-line {
  background-color:rgb(4, 53, 169);
}

/* Sidebar Header Styling */
.sidebar-header {
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 16px;
}

.tagline {
  margin-bottom: 24px;
}

.tagline p {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.4;
  margin: 0;
}

.sidebar-subheader {
  padding: 0 24px 24px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  line-height: 1.6;
}

.sidebar-subheader p {
  margin: 0;
}

/* Close Button */
.close-sidebar {
  position: absolute;
  top: 29px;
  right: 5px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-sidebar:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

/* Responsive Behavior */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    width: 320px;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
  }
  
  .sidebar.active {
    transform: translateX(0);
  }
    .search-bar {
    margin-top: 20px;
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  padding: 10px 10px;
  border-radius: 4px;
  flex-grow: 1; /* make search bar expand */
}

.search-bar input {
  border: none;
  outline: none;
  font-size: 14px;
  flex-grow: 1;
}

.search-bar svg {
  color: #888;
}
        .top-bar {
  display: flex;
  align-items: center;
  gap: 1rem; 
  padding: 10px 20px;
  padding-bottom: 0;
  padding-top: 0;
  background-color: #fff;
}
  .filter-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  margin-top: 20px;
  
}
  .modal {
          background-color: white;
          border-radius: 8px;
          box-shadow: var(--shadow);
          width: 90%;
          max-width: 600px;
          transition: var(--transition);
          transform: translateY(-20px);
        }
  
  
}
  
      `}</style>
    </div>
  );
};

export default TeacherDashboard;
