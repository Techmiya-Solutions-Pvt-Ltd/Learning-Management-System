import axios from "axios";
// https://lmsserver-epac.onrender.com
// export const API_BASE_URL ="https://lmsserver-epac.onrender.com";
export const API_BASE_URL ="http://127.0.0.1:8000/";


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  
});

export const loginUser = async (username, password) => {
  try {
    const response = await api.post("/api/login_auth/", { username, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error_message || "Login failed";
  }
};

export const signupUser = async (userData) => {
  try {
    
    const response = await api.post("/api/signup_auth/", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error_message || "Signup failed";
  }
};
export const loginAdmin = async (username, password) => {
  try {
    const response = await api.post("/api/login_admin/", { username, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error_message || "Login failed";
  }
};

export const signupAdmin = async (userData) => {
  try {
    
    const response = await api.post("/api/signup_admin/", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error_message || "Signup failed";
  }
};

export const loginTeacher= async (username, password) => {
  try {
    const response = await api.post("/api/login_auth_teacher/", { username, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error_message || "Login failed";
  }
};

export const signupTeacher = async (userData) => {
  try {
    
    const response = await api.post("/api/signup_auth_teacher/", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error_message || "Signup failed";
  }
};



export const fetchSkills = async () => {
  try {
    const response = await api.get(`/lmsai/api/skills/`);
    // console.log("Skills:", response.data);
    return response.data; 
  } catch (error) {
    throw new Error("Failed to fetch skills");
  }
};



export const generatequestionpaper = async (prompt) => {
  try {
    const response = await api.post('/lmsai/api/generate-questions/', { prompt });
    return response.data;
  } catch (error) {
    console.error('Error generating question paper:', error);
    throw error;
  }
};


export const storeAssessment = async (assessmentData) => {
  try {
    const response = await api.post("/lmsai/api/store_questions/", assessmentData);
    console.log("API Response Data:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("API Error:", error.response?.data || error.message);
    throw error;
  }
};




export const getTeacherAssessments = async (teacherId) => {
  try {
    const response = await api.post("/api/getting_assesment_id/", { 
      teacher_id: teacherId 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching assessments:', error.response?.data || error.message);
    throw error.response?.data?.error || "Failed to fetch assessments";
  }
};

export const getAssessmentDetails = async (assessmentId) => {
  try {
    const response = await api.get(`/api/assessment_details/${assessmentId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching assessment details:', error.response?.data || error.message);
    throw error.response?.data?.error || "Failed to fetch assessment details";
  }
};


export const Assigntostudents = async (assessmentId) => {
  try {
    const response = await api.post(`/lmsai/api/assign/`, { assessment_id: assessmentId });
    console.log("API Response Data:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching assessment details:', error.response?.data || error.message);
    throw error.response?.data?.error || "Failed to fetch assessment details";
  }
};

export const tests = async () => {
  try {
    const response = await api.post('/api/test/');
    console.log("Assessments:", response.data);
    return response.data; 
  } catch (error) {
    throw new Error("Failed to fetch assessments");
  }
};

export const fetchTest = async (testId: string) => {
  try {
    const response = await api.post('/api/tests/get', {  // Changed to POST
      testId: testId     
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching test:', error);
    throw error;
  }
};




export const submitTest = async (
  testId: string,
  studentId: string,
  answers: Record<string, string>,
  timeSpent: number
) => {
  try {
    const response = await api.post('/api/tests/submit', {
      testId,
      studentId,
      answers,
      timeSpent
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting test:', error);
    throw error;
  }
};


// services/api.ts
export const getCompletedTests = async (studentId: string) => {
  try {
    const response = await api.post('/api/tests/completed', {
      student_id: studentId
    });
    console.log("Completed Tests:", response.data);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch completed tests");
  }
};


export const getTestResults = async (testId: string, studentId: string) => {
  try {
    const response = await api.post('/api/tests/results', {
      test_id: testId,
      student_id: studentId
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching test results:', error);
    throw error;
  }
};

export const deleteAssessmentAPI = async (assessmentId: string) => {
  try {
    const response = await api.post("/api/delete-assessment", {
      assessment_id: assessmentId,
    });
    console.log("Deleted:", response.data.message);
    return response.data;
  } catch (error: any) {
    console.error("Delete Error:", error.response?.data || error.message);
    throw error;
  }
};

export const createCourse = async (courseData) => {
  try {
    const response = await api.post("/api/create_course", courseData);
    console.log("Course created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Course creation failed:", error.response?.data || error.message);
    throw error;
  }
};



export const saveCourse = async (courseData) => {
  try {
    const response = await api.post("/api/save_course", courseData);
    console.log("Course saved successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Course save failed:", error.response?.data || error.message);
    throw error;
  }
};

export const getCourseById = async (courseId: string) => {
  try {
    console.log(`Fetching course with ID: ${courseId}`);
    const response = await api.get(`/api/get_course/${courseId}`);
    console.log("Raw course data received:", response.data);
    
    let courseData = response.data;
    
    // If course_data_json exists, merge it with the main course data
    if (courseData.course_data_json) {
      try {
        const jsonData = JSON.parse(courseData.course_data_json);
        courseData = {
          ...courseData,
          ...jsonData,
          // Preserve the original metadata
          _id: courseData._id,
          created_at: courseData.created_at,
          updated_at: courseData.updated_at,
          teacher_id: courseData.teacher_id,
          // Remove the course_data_json field
          course_data_json: undefined
        };
        console.log("Merged course data:", courseData);
      } catch (jsonError) {
        console.error("Failed to parse course_data_json:", jsonError);
        // Continue with unmerged data if parsing fails
        delete courseData.course_data_json;
      }
    }
    
    // Ensure chapters and contents exist and are properly structured
    if (courseData.chapters) {
      courseData.chapters = courseData.chapters.map((chapter: any) => ({
        ...chapter,
        contents: chapter.contents?.map((content: any) => {
          // Normalize content structure
          if (content.type === 'youtube' && typeof content.content === 'string') {
            return {
              ...content,
              content: { url: content.content }
            };
          }
          return content;
        }) || []
      }));
    }
    
    return courseData;
  } catch (error: any) {
    console.error("Detailed error:", {
      message: error.message,
      response: error.response?.data,
      config: error.config
    });
    throw error.response?.data?.error_message || "Failed to fetch course";
  }
};

export const updateCourse = async (courseId: string, courseData: any): Promise<any> => {
  const response = await api.put(`/api/updatecourses/${courseId}/`, courseData);
  return response.data;
};




export const getCoursesByTeacherId = async (teacherId) => {
  try {
    const response = await api.get(`/api/get_teacher_courses/${teacherId}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching teacher's courses:", error);
    throw error.response?.data?.error || "Failed to fetch courses";
  }
};
export const getBlogsByTeacherId = async (teacherId) => {
  try {
    const response = await api.get(`/api/get_teacher_blogs/${teacherId}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching teacher's courses:", error);
    throw error.response?.data?.error || "Failed to fetch courses";
  }
};
export const getCourses = async () => {
  try {
    const response = await api.get('/api/get_courses/');
    return response.data;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error.response?.data?.error || "Failed to fetch courses";
  }
};

export  const getReviews = async() => {
  try {
    const response = await api.get('/api/get_all_reviews/');
    return response.data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error.response?.data?.error || "Failed to fetch reviews";
  }
}
export const getBlogs = async () => {
  try {
    const response = await api.get('/api/get_blogs/');
    return response.data;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error.response?.data?.error || "Failed to fetch courses";
  }
};

// services/api.ts
export const getBlogById = async (id: string) => {
  try {
    const res = await api.get(`/api/viewblogs/${id}/`);
    if (res.status !== 200) throw new Error('Failed to fetch blog');
    return res.data;
  } catch (error) {
    throw new Error('Failed to fetch blog');
  }
};

export const updateBlog = async (id: string, body: any) => {
  try {
    const res = await api.put(`/api/updateblogs/${id}/`, body, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.status !== 200) throw new Error('Failed to update blog');
    return res.data;
  } catch (error) {
    throw new Error('Failed to update blog');
  }
};



// Fetch all students
export const students = async (): Promise<any> => {
  try {
    const response = await api.get('/api/students');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Archive a student (move to deleted_user collection)
export const archiveStudent = async (studentId: string): Promise<any> => {
  try {
    const response = await api.delete(`/api/deleted_student/${studentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update student information
export const updateStudent = async (studentId: string, data: any): Promise<any> => {
  try {
    const response = await api.put(`/api/updated_student/${studentId}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addStudent = async (data) => {
  try {
  const response = await api.post('/api/add_student/', data);
  return response.data;
  }
  catch (error) {
    throw error;
  }
};



export const teachers = async () => {
  try {
  const res = await api.get('/api/teachers');
  return res.data;
}
catch (error) {
  throw error;
}
};

export const addTeacher = async (data: any) => {
  try {
  const res = await api.post('/api/add_teacher/', data);
  return res.data;
}
catch (error) {
  throw error;
}
};


export const updateTeacher = async (teacherId: string, data: any): Promise<any> => {
  try {
    const response = await api.put(`/api/updated_teacher/${teacherId}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const archiveTeacher = async (id: string) => {
  try {
    
  const res = await api.delete(`/api/deleted_teacher/${id}`);
  return res.data;
}
catch (error) {
  throw error;
}
};

export const getHRs = async () => {
  try {
    const res = await api.get('/api/hr/');
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const addHR = async (data: any) => {
  try {
    const res = await api.post('/api/add_hr/', data);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateHR = async (hrId: string, data: any): Promise<any> => {
  try {
    const res = await api.put(`/api/update_hr/${hrId}/`, data);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const archiveHR = async (id: string) => {
  try {
    const res = await api.delete(`/api/delete_hr/${id}/`);
    return res.data;
  } catch (error) {
    throw error;
  }
};



export const getTestById = async (id: string) => {
  try {
    const response = await api.get(`/api/tests/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch test data');
  }
};

// Save or update test (API endpoint should be created for this)
export const updateTestById = async (testId: string, updatedTest: any) => {
  try {
    const response = await api.put(`/api/updatetest/${testId}/`, updatedTest);
    console.log("Updated Test:", response.data);
    return response.data;
  } catch (error) {
    throw new Error('Failed to update test');
  }
};


export const createBlog = async (blogData) => {
  try {
    const response = await api.post("/api/create_blog/", blogData);
    console.log("Blog created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Blog creation failed:", error.response?.data || error.message);
    throw error;
  }
};

export const updateCourseStatus = async (courseId: string, data: { is_active: boolean }): Promise<any> => {
  try {
    const res = await api.put(`/api/courses/${courseId}/status/`, data);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCourse = async (courseId: string): Promise<any> => {
  try {
    const res = await api.delete(`/api/courses/${courseId}/`);
    return res.data;
  } catch (error: any) {
    console.error('Detailed delete course error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });
    throw error.response?.data?.error || error.message || "Failed to delete course";
  }
};

export const updateBlogStatus = async (blogId: string, data: { is_active: boolean }): Promise<any> => {
  try {
    const res = await api.put(`/api/blogs/${blogId}/status/`, data);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const deleteBlog = async (blogId: string): Promise<any> => {
  try {
    const res = await api.delete(`/api/blogs/${blogId}/`);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateTestStatus = async (testId: string, data: { is_active: boolean }): Promise<any> => {
  try {
    const res = await api.put(`/api/tests/${testId}/status/`, data);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const deleteTest = async (testId: string): Promise<any> => {
  try {
    const res = await api.delete(`/api/tests/${testId}/delete/`);
    return res.data;
  } catch (error) {
    throw error;
  }
};


export const fetchAdminStats = async () => {
  try {
    const response = await api.get(`/api/admin/dashboard/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

export const fetchUserGrowth = async () => {
  try {
    const response = await api.get(`/api/admin/dashboard/user-growth`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user growth data:', error);
    throw error;
  }
};

export const fetchTrafficSources = async () => {
  try {
    const response = await api.get(`/api/admin/dashboard/traffic-sources`);
    console.log("Traffic Sources:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching traffic sources:', error);
    throw error;
  }
};

export const fetchSystemStatus = async () => {
  try {
    const response = await api.get(`/api/admin/dashboard/system-status`);
    return response.data;
  } catch (error) {
    console.error('Error fetching system status:', error);
    throw error;
  }
};

export const fetchRecentActivities = async () => {
  try {
    const response = await api.get(`/api/admin/dashboard/recent-activities`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
};






export const uploadProfilePicture = async (file) => {
  try {
    const formData = new FormData();
    formData.append('profile_picture', file);
    
    const response = await api.post('/profile/upload-picture/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return {
      success: true,
      data: {
        profile_picture: response.data.profile_picture
      }
    };
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to upload picture'
    };
  }
};

export const fetchUserProfile = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.error('No token found in localStorage');
    return null;
  }

  try {
    const response = await api.get('/api/user_profile/', {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    
    // Check if response.data.data exists, otherwise use response.data directly
    const profileData = response.data.data || response.data;
    console.log("Profile Data:", profileData); // Debugging line
    
    // Transform education data into the expected structure
    const transformedEducation = {
      '10th': {
        board: profileData['10th_board'] || '',
        school: profileData['10th_school'] || '',
        percentage: profileData['10th_Percentage'] || '',
        passout_year: profileData['10th_passout_year'] || ''
      },
      '12th': {
        board: profileData['12th_board'] || '',
        school: profileData['12th_school'] || '',
        percentage: profileData['12th_Percentage'] || '',
        passout_year: profileData['12th_passout_year'] || ''
      },
      graduation: {
        college: profileData['ug_college'] || '',
        branch: profileData['branch'] || '',
        percentage: profileData['Graduation_Percentage'] || '',
        passout_year: profileData['Passout_Year'] || ''
      }
    };
    
    // Transform resume data if it exists
    const transformedResume = profileData.resume ? {
      name: profileData.resume.filename || 'resume.pdf',
      url: profileData.resume.url || '', // You might need to create a download endpoint
      uploadedAt: profileData.resume.uploaded_at || new Date().toISOString()
    } : null;
    
    console.log("Transformed Education Data:", transformedEducation);
    console.log("Transformed Resume Data:", transformedResume);
    
    return {
      ...profileData,
      education: transformedEducation,
      resume: transformedResume,
      // Ensure all required fields have default values
      first_name: profileData.first_name || '',
      last_name: profileData.last_name || '',
      email: profileData.email || '',
      mobile: profileData.mobile || '',
      location: profileData.location || '',
      title: profileData.title || '',
      profile_picture: profileData.profile_picture || '',
      skills: profileData.skills || [],
      experiences: profileData.experiences || [],
      projects: profileData.projects || []
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    
    // Handle 401 unauthorized errors specifically
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // You might want to redirect to login here or handle this in your component
      window.location.href = '/login'; // Example redirect
    }
    
    throw error;
  }
};



export const updateProfileAPI = async (profileData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('User is not authenticated. Please login again.');
    }

    const requestData = {
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      mobile: profileData.mobile,
      location: profileData.location,
      title: profileData.title,
      experience: profileData.experience,
      profile_picture: profileData.profile_picture,
      skills: profileData.skills,
      projects: profileData.projects.map(project => ({
        title: project.title,
        description: project.description,
        link: project.link,
        start_date: project.start_date,
        end_date: project.end_date,
        currently_ongoing: project.currently_ongoing
      })),
      experiences: profileData.experiences.map(exp => ({
        company_name: exp.company_name,
        job_title: exp.job_title,
        start_date: exp.start_date,
        end_date: exp.end_date,
        currently_working: exp.currently_working,
        description: exp.description
      })),
      '10th_board': profileData.education['10th']?.board,
      '10th_school': profileData.education['10th']?.school,
      '10th_Percentage': profileData.education['10th']?.percentage,
      '10th_passout_year': profileData.education['10th']?.passout_year,
      '12th_board': profileData.education['12th']?.board,
      '12th_school': profileData.education['12th']?.school,
      '12th_Percentage': profileData.education['12th']?.percentage,
      '12th_passout_year': profileData.education['12th']?.passout_year,
      ug_college: profileData.education.graduation?.college,
      branch: profileData.education.graduation?.branch,
      Graduation_Percentage: profileData.education.graduation?.percentage,
      Passout_Year: profileData.education.graduation?.passout_year
    };

    const response = await api.put(
      'api/profile_update/',
      requestData,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error.response?.data || error.message);
    throw error;
  }
};

export const updateSkillsAPI = async (skills) => {
  try {
    console.log('Sending skills data:', skills); // Add this line
    const response = await api.put('/api/profile/skills/', { skills });
    return response.data;
  } catch (error) {
    console.error('Full error details:', error); // Enhanced error logging
    console.error('Error response data:', error.response?.data);
    throw error;
  }
};

export const updateProjectsAPI = async (projects) => {
  try {
    const response = await api.put('/profile/update-projects/', { projects });
    return response.data;
  } catch (error) {
    console.error('Error updating projects:', error);
    throw error;
  }
};

export const updateEducationAPI = async (education) => {
  try {
    const response = await api.put('/profile/update-education/', { education });
    return response.data;
  } catch (error) {
    console.error('Error updating education:', error);
    throw error;
  }
};


// Update password
async function updateUserPassword(currentPassword, newPassword) {
  try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile/update-password/', {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              current_password: currentPassword,
              new_password: newPassword
          })
      });
      
      if (!response.ok) {
          throw new Error('Failed to update password');
      }
      
      const data = await response.json();
      if (data.success) {
          return true;
      } else {
          throw new Error(data.error || 'Failed to update password');
      }
  } catch (error) {
      console.error('Error updating password:', error);
      throw error;
  }
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// api.js
// api.ts
export const downloadResume = async (): Promise<{ url: string, filename: string }> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await api.get('/profile/download-resume/', {
      responseType: 'blob',
      headers: {
        'Authorization': `Token ${token}`
      },
      validateStatus: (status) => status < 500 // Don't throw for 404
    });

    if (response.status === 404) {
      throw new Error('Resume not found on server');
    }

    if (response.status === 401) {
      throw new Error('Authentication failed - please login again');
    }

    if (response.status !== 200) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    // Create blob URL
    const url = window.URL.createObjectURL(new Blob([response.data]));
    
    // Extract filename
    let filename = 'resume.pdf';
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch?.[1]) filename = filenameMatch[1];
    }
    
    return { url, filename };
  } catch (error) {
    let errorMessage = 'Failed to download resume';
    
    if (error.response) {
      // Try to extract error message from response
      if (error.response.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          const json = JSON.parse(text);
          errorMessage = json.error || errorMessage;
        } catch {
          errorMessage = text || errorMessage;
        }
      } else if (typeof error.response.data === 'object') {
        errorMessage = error.response.data.error || errorMessage;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.error('Download error:', error);
    throw new Error(errorMessage);
  }
};

export const deleteResume = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No auth token found');

    const response = await api.delete('/profile/delete-resume/', {
      headers: {
        'Authorization': `Token ${token}`
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('Delete error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const uploadResume = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await api.post('profile/upload-resume/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Token ${localStorage.getItem('token')}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};
     
 
// Get all jobs
export const fetchJobs = async (): Promise<any> => {
  try {
    const response = await api.get('/api/jobs/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Search jobs
export const searchJobs = async (query: string): Promise<any> => {
  try {
    const response = await api.get(`/api/jobs/search/?q=${query}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Filter jobs by type
export const filterJobsByType = async (type: string): Promise<any> => {
  try {
    const response = await api.get(`/api/jobs/filter/${type}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// api.tsx
export const applyForJob = async (jobId: string, hrId: string) => {
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await api.post(
      '/api/apply_job/',
      {
        job_id: jobId,
        hr_id: hrId
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
  
    
  
  }
};

export const checkJobApplied = async (jobId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await api.get(`/api/check_applied/?job_id=${jobId}`, {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    return response.data.applied;
  } catch (error) {
    console.error('Error checking job application status:', error);
    return false;
  }
};

export const getJobDetails = async (jobId: string) => {
  try {
    const response = await api.get(`/api/jobs/${jobId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching job details:', error);
    throw error;
  }
};

/**
 * Fetch jobs from our database with optional filters
 * @param {Object} filters - { country, remote, search }
 * @returns {Promise} Array of job objects
 */
interface JobFilters {
  country?: string;
  remote?: boolean;
  search?: string;
}
export const fetchJobs1 = async (filters: JobFilters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.country) params.append('country', filters.country);
    if (filters.remote) params.append('remote', 'true');
    if (filters.search) params.append('search', filters.search);
    
    console.log('Making request to:', `/api/jobs1/?${params.toString()}`);
    const response = await api.get(`/api/jobs1/?${params.toString()}`);
    console.log('Received response:', response);
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

/**
 * Admin function to trigger job fetching from JSearch API
 * @returns {Promise} Result message
 */
// export const fetchLatestJobs = async () => {
//   try {
//     const response = await api.get('/api/jobs1/fetch/');
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };
     
export default api;