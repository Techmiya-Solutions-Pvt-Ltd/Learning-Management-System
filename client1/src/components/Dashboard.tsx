import React, { useState } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Award, 
  Compass,
  BookMarked,
  Bell,
  User,
  Search,
  BarChart,
  Video,
  CheckCircle,
  ChevronRight
} from 'lucide-react';

// Featured courses data
const featuredCourses = [
  { 
    id: 1, 
    title: 'Introduction to Data Science', 
    instructor: 'Dr. Alex Morgan',
    cover: '/api/placeholder/600/340',
    progress: 65,
    category: 'Science'
  },
  { 
    id: 2, 
    title: 'Digital Marketing Fundamentals', 
    instructor: 'Prof. Sarah Williams',
    cover: '/api/placeholder/600/340',
    progress: 82,
    category: 'Business'
  },
  { 
    id: 3, 
    title: 'Modern Web Development', 
    instructor: 'Mark Johnson',
    cover: '/api/placeholder/600/340',
    progress: 42,
    category: 'Technology'
  },
];

// Upcoming events
const upcomingEvents = [
  { id: 1, title: 'Virtual Study Group: Data Structures', date: 'Today, 3:00 PM', type: 'study' },
  { id: 2, title: 'Guest Lecture: AI Ethics', date: 'Tomorrow, 5:30 PM', type: 'lecture' },
  { id: 3, title: 'Project Deadline: Final Submission', date: 'May 16th, 11:59 PM', type: 'deadline' },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const studentName = "Sophia";
  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 text-white p-2 rounded-lg">
            <BookOpen className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold text-indigo-900">EduSphere</h1>
        </div>
        
        <div className="relative max-w-md w-full hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search courses, assignments, resources..." 
            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative text-gray-500 hover:text-indigo-600">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
          </button>
          <div className="h-8 w-8 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-medium">
            S
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-full opacity-10">
              <div className="w-full h-full bg-white transform rotate-45 translate-x-20 translate-y-10"></div>
            </div>
            
            <h2 className="text-3xl font-bold mb-2">Welcome back, {studentName}!</h2>
            <p className="text-indigo-100 mb-6">{todayDate}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 z-10 relative">
              <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl p-4 flex items-center">
                <div className="bg-white bg-opacity-30 rounded-lg p-2 mr-4">
                  <BookMarked className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-indigo-100">Enrolled Courses</p>
                  <p className="text-xl font-bold">12</p>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl p-4 flex items-center">
                <div className="bg-white bg-opacity-30 rounded-lg p-2 mr-4">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-indigo-100">Certificates</p>
                  <p className="text-xl font-bold">7</p>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl p-4 flex items-center">
                <div className="bg-white bg-opacity-30 rounded-lg p-2 mr-4">
                  <BarChart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-indigo-100">Overall Progress</p>
                  <p className="text-xl font-bold">78%</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Continue Learning */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Continue Learning</h3>
            <button className="text-indigo-600 text-sm font-medium flex items-center">
              View All Courses <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="relative">
                  <img 
                    src={course.cover} 
                    alt={course.title} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium">
                    {course.category}
                  </div>
                </div>
                
                <div className="p-5">
                  <h4 className="font-bold text-gray-900 mb-1">{course.title}</h4>
                  <p className="text-gray-500 text-sm mb-4">{course.instructor}</p>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{course.progress}% complete</span>
                    <button className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-3 py-1 rounded-lg text-sm transition-colors">
                      Resume
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Events & Reminders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <section className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Upcoming Events</h3>
              
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="mr-4">
                      <div className={`
                        p-2 rounded-lg
                        ${event.type === 'study' ? 'bg-green-100 text-green-600' : ''}
                        ${event.type === 'lecture' ? 'bg-blue-100 text-blue-600' : ''}
                        ${event.type === 'deadline' ? 'bg-red-100 text-red-600' : ''}
                      `}>
                        {event.type === 'study' && <Users className="h-5 w-5" />}
                        {event.type === 'lecture' && <Video className="h-5 w-5" />}
                        {event.type === 'deadline' && <Clock className="h-5 w-5" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-500">{event.date}</p>
                    </div>
                    <button className="text-indigo-600 hover:text-indigo-800">
                      <Calendar className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 text-indigo-600 text-sm font-medium border border-indigo-200 rounded-lg py-2 hover:bg-indigo-50 transition-colors">
                View Full Calendar
              </button>
            </div>
          </section>
          
          <section>
            <div className="bg-white rounded-xl shadow-sm p-6 h-full">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Weekly Goals</h3>
              
              <div className="space-y-4">
                <div className="relative pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Study Hours</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-indigo-700">8/12 hrs</span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-indigo-100">
                    <div style={{ width: "66%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600"></div>
                  </div>
                </div>
                
                <div className="relative pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Assignments</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-indigo-700">3/5 completed</span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-indigo-100">
                    <div style={{ width: "60%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600"></div>
                  </div>
                </div>
                
                <div className="relative pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Quiz Scores</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-indigo-700">85/100 avg</span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-indigo-100">
                    <div style={{ width: "85%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600"></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mt-0.5 mr-2" />
                  <div>
                    <h4 className="font-medium text-gray-900">Daily Tip</h4>
                    <p className="text-sm text-gray-600 mt-1">Try the Pomodoro technique: 25 minutes of focused study followed by a 5-minute break.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        
        {/* Bottom Navigation for Mobile */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 md:hidden z-10">
          <button 
            className={`flex flex-col items-center px-4 py-2 ${activeTab === 'home' ? 'text-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('home')}
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </button>
          
          <button 
            className={`flex flex-col items-center px-4 py-2 ${activeTab === 'explore' ? 'text-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('explore')}
          >
            <Compass className="h-5 w-5" />
            <span className="text-xs mt-1">Explore</span>
          </button>
          
          <button 
            className={`flex flex-col items-center px-4 py-2 ${activeTab === 'calendar' ? 'text-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('calendar')}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs mt-1">Calendar</span>
          </button>
          
          <button 
            className={`flex flex-col items-center px-4 py-2 ${activeTab === 'profile' ? 'text-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('profile')}
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;