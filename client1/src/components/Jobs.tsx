import React, { useEffect, useState } from 'react';
import { Clock, MapPin, Building, DollarSign, Briefcase, BookOpen, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { fetchJobs, searchJobs } from '@/services/api';
import { applyForJob, checkJobApplied } from '@/services/api';
import { jwtDecode } from 'jwt-decode';

interface Job {
  _id: string;
  Job: string;
  Org: string;
  Location: string;
  job_type: string;
  Salary: string;
  experience: string;
  education: string;
  posted_date: string;
  deadline: string;
  Skills: string[] | string;
  FullDescription: string;
  hr_id: string;
}

// Color palette for job card borders
const jobCardColors = [
  'border-l-4 border-blue-600',
  'border-l-4 border-emerald-500',
  'border-l-4 border-violet-500',
  'border-l-4 border-rose-500',
  'border-l-4 border-indigo-600',
  'border-l-4 border-teal-500',
  'border-l-4 border-amber-500',
  'border-l-4 border-red-600'
];

export const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { theme } = useTheme();
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;

  const jobTypes = ['all', 'full-time', 'part-time', 'contract', 'internship', 'remote'];

  // Theme-based classes
  const containerClasses = theme === 'dark' 
    ? 'bg-gray-900 text-white' 
    : 'bg-gray-50 text-gray-800';

  const cardClasses = theme === 'dark'
    ? 'bg-gray-800 border-gray-700 hover:shadow-gray-800'
    : 'bg-white border-gray-100 hover:shadow-lg';

  const inputClasses = theme === 'dark'
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500';

  const buttonClasses = (isActive: boolean) => 
    theme === 'dark'
      ? isActive
        ? 'bg-blue-700 text-white'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      : isActive
        ? 'bg-blue-600 text-white'
        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300';

  const modalClasses = theme === 'dark'
    ? 'bg-gray-800 text-gray-100'
    : 'bg-white text-gray-800';

  // Calculate pagination
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        let data;

        if (searchQuery) {
          data = await searchJobs(searchQuery);
          data = sortJobsByDate(data);
        } else if (activeTab !== 'all') {
          data = await filterJobsByType(activeTab);
        } else {
          data = await fetchJobs();
          data = sortJobsByDate(data);
        }

        setJobs(data);
        setCurrentPage(1); // Reset to first page when jobs change
      } catch (error) {
        console.error('Error loading jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [searchQuery, activeTab]);

  useEffect(() => {
    const checkAppliedStatuses = async () => {
      if (jobs.length > 0) {
        const appliedSet = new Set<string>();
        for (const job of jobs) {
          const isApplied = await checkJobApplied(job._id);
          if (isApplied) {
            appliedSet.add(job._id);
          }
        }
        setAppliedJobs(appliedSet);
      }
    };
    
    checkAppliedStatuses();
  }, [jobs]);

  const sortJobsByDate = (jobs: Job[]): Job[] => {
    return [...jobs].sort((a, b) => {
      if (!a.posted_date) return 1;
      if (!b.posted_date) return -1;
      
      const dateA = new Date(a.posted_date).getTime();
      const dateB = new Date(b.posted_date).getTime();
      
      if (dateB === dateA) {
        const deadlineA = new Date(a.deadline).getTime();
        const deadlineB = new Date(b.deadline).getTime();
        return deadlineA - deadlineB;
      }
      
      return dateB - dateA;
    });
  };

  const filterJobsByType = async (type: string): Promise<Job[]> => {
    const allJobs = await fetchJobs();
    const filtered = allJobs.filter((job) => 
      job.job_type.toLowerCase() === type.toLowerCase()
    );
    return sortJobsByDate(filtered);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const normalizeSkills = (skills: string[] | string): string[] => {
    if (Array.isArray(skills)) {
      return skills;
    }
    if (typeof skills === 'string') {
      return skills.split(',').map(skill => skill.trim());
    }
    return [];
  };

  const openJobDetails = (job: Job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedJob(null);
  };

  const handleApply = async () => {
    if (!selectedJob) return;
    
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token);
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Token exists, applying for job');
      
      await applyForJob(selectedJob._id, selectedJob.hr_id, token);
      
      setAppliedJobs(prev => new Set(prev).add(selectedJob._id));
      
      alert(`Successfully applied for ${selectedJob.Job} at ${selectedJob.Org}`);
      closeModal();
    } catch (error) {
      console.error('Application error:', error);
      alert('Application failed. Please try again later.');
    }
  };

  return (
    <div className={`min-h-screen p-6 ${containerClasses}`}>
      <div className="max-w-5xl mx-auto">
        {/* Search and filter section */}
        <div className="mb-8">
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search for job titles, companies, or skills..."
              className={`w-full p-4 pl-4 pr-10 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm ${inputClasses}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-3 top-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {/* Job type filters */}
          <div className="flex flex-wrap gap-2">
            {jobTypes.map((type) => (
              <button
                key={type}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${buttonClasses(activeTab === type)}`}
                onClick={() => setActiveTab(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Job listings */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : jobs.length > 0 ? (
          <div className="space-y-6">
            {currentJobs.map((job, index) => (
              <div 
                key={job._id} 
                className={`rounded-xl shadow-md overflow-hidden transition-all border ${cardClasses} ${
                  jobCardColors[index % jobCardColors.length]
                }`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className={`text-xl font-bold mb-1 hover:text-blue-600 transition-colors ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {job.Job}
                      </h2>
                      <div className={`flex items-center mb-4 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        <Building className="h-4 w-4 mr-1" />
                        <span className="font-medium mr-3">{job.Org}</span>
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{job.Location}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`${
                        theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                      } text-xs font-medium px-2.5 py-0.5 rounded-full`}>
                        {job.job_type}
                      </span>
                      <div className={`mt-2 flex items-center ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span className="font-semibold">₹{job.Salary}K</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
                    {/* Experience */}
                    <div className={`flex items-center ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <Briefcase className="h-4 w-4 mr-2" />
                      <span><span className="font-medium">Exp:</span> {job.experience} yrs</span>
                    </div>
                    
                    {/* Education */}
                    <div className={`flex items-center ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span><span className="font-medium">Edu:</span> {job.education}</span>
                    </div>
                    
                    {/* Posted Date */}
                    <div className={`flex items-center ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <Clock className="h-4 w-4 mr-2" />
                      <span><span className="font-medium">Posted:</span> {formatDate(job.posted_date)}</span>
                    </div>
                    
                    {/* Deadline */}
                    <div className={`flex items-center ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <Clock className="h-4 w-4 mr-2" />
                      <span><span className="font-medium">Deadline:</span> {formatDate(job.deadline)}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className={`font-medium text-sm mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Skills:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {normalizeSkills(job.Skills).map((skill, index) => (
                        <span 
                          key={index} 
                          className={`${
                            theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-700'
                          } text-xs font-medium px-2.5 py-1 rounded-md`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <p className="line-clamp-3">{job.FullDescription}</p>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button 
                      onClick={() => openJobDetails(job)}
                      className={`inline-flex items-center px-4 py-2 ${
                        appliedJobs.has(job._id)
                          ? theme === 'dark' 
                            ? 'bg-green-800 text-green-200' 
                            : 'bg-green-100 text-green-800'
                          : theme === 'dark' 
                            ? 'bg-blue-700 hover:bg-blue-600 text-white' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                      } text-sm font-medium rounded-md transition-colors`}
                    >
                      {appliedJobs.has(job._id) ? 'Applied' : 'View Details'}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className={`flex justify-center items-center mt-8 space-x-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${
                    currentPage === 1
                      ? theme === 'dark' 
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : theme === 'dark' 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-white hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-4 py-2 rounded-md ${
                      currentPage === number
                        ? theme === 'dark' 
                          ? 'bg-blue-700 text-white' 
                          : 'bg-blue-600 text-white'
                        : theme === 'dark' 
                          ? 'bg-gray-700 hover:bg-gray-600' 
                          : 'bg-white hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {number}
                  </button>
                ))}

                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${
                    currentPage === totalPages
                      ? theme === 'dark' 
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : theme === 'dark' 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-white hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={`p-8 rounded-lg shadow text-center ${
            theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium mb-1">No jobs found</h3>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {showModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-3xl rounded-lg shadow-xl max-h-[90vh] overflow-y-auto ${modalClasses}`}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedJob.Job}</h2>
                <button 
                  onClick={closeModal}
                  className={`p-1 rounded-full ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                  }`}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <Building className="h-5 w-5 mr-2" />
                  <span className="text-lg font-medium">{selectedJob.Org}</span>
                </div>
                <div className="flex items-center mb-4">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{selectedJob.Location}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <h3 className="font-medium mb-2">Job Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Job Type:</span>
                        <span className="font-medium">{selectedJob.job_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Salary:</span>
                        <span className="font-medium">₹{selectedJob.Salary}K</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Experience:</span>
                        <span className="font-medium">{selectedJob.experience} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Education:</span>
                        <span className="font-medium">{selectedJob.education}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <h3 className="font-medium mb-2">Timeline</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Posted Date:</span>
                        <span className="font-medium">{formatDate(selectedJob.posted_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Deadline:</span>
                        <span className="font-medium">{formatDate(selectedJob.deadline)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {normalizeSkills(selectedJob.Skills).map((skill, index) => (
                      <span 
                        key={index} 
                        className={`${
                          theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-700'
                        } px-3 py-1 rounded-md text-sm`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium mb-2">Job Description</h3>
                  <div className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <p className="whitespace-pre-line">{selectedJob.FullDescription}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={closeModal}
                    className={`px-4 py-2 rounded-md ${
                      theme === 'dark' 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    Close
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={appliedJobs.has(selectedJob._id)}
                    className={`px-4 py-2 rounded-md ${
                      appliedJobs.has(selectedJob._id)
                        ? theme === 'dark' 
                          ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                          : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : theme === 'dark' 
                          ? 'bg-green-700 hover:bg-green-600 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {appliedJobs.has(selectedJob._id) ? 'Applied' : 'Apply Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};