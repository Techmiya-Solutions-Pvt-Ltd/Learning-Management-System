import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { useNavigate, Link } from "react-router-dom";
import { MessageSquareWarning } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import { ArrowRight } from "lucide-react";
import { Check } from "lucide-react";
import { Quote } from "lucide-react";

import dataAnalystImg from '../../assets/img/dataanalysit.jpeg';
import javaProgrammingImg from '../../assets/img/Javaprogramming.jpeg';
import fullStackDevImg from '../../assets/img/fullstackdevelopment.png';

import Header from './Header';
import Footer from './Footer';
import '../../assets/css/Body.css';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import emailjs from "emailjs-com";
import 'swiper/swiper-bundle.css';
import { getCourses,fetchJobs, getReviews, getBlogs } from '../../services/api';
import PropTypes from 'prop-types';
import { MapPin, DollarSign, Briefcase, Clock, Building, Eye, BookOpen,  CalendarDays, PenSquare, PlusCircle} from 'lucide-react';
import { CardFooter } from "@/components/ui/card";
const Register = ({ onBack }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
    experience: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const courses = [
    "Full Stack Development",
    "Data Science & Analytics",
    "Java Programming",
    "Aptitude Training",
    "Cloud Computing (AWS)",
    "Mobile App Development",
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.name || !formData.email || !formData.phone || !formData.course) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const emailParams = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      course: formData.course,
      experience: formData.experience,
      message: formData.message,
      time: new Date().toLocaleString(),
    };

    try {
      await emailjs.send(
        "service_n9z5rzg",
        "template_a0ke5pf",
        emailParams,
        "ngbxDDU3E7ue3VkLR"
      );
      
      toast({
        title: "Registration Successful! 🎉",
        description: "Thank you for registering! Our team will contact you within 24 hours.",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        course: "",
        experience: "",
        message: "",
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex justify-start mb-4">
            <Button variant="outline" onClick={onBack} className="mb-4">
              ← Back to Home
            </Button>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Register for Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Take the first step towards your tech career. Register for a free demo 
            session and discover how Tech Miya can transform your future.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">Demo Registration</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll contact you to schedule your personalized demo session.
                </CardDescription>
              </CardHeader>
              <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Label htmlFor="name" className="hj">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                      className="transition-all duration-300 focus:ring-2 focus:ring-purple-500 hj"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Label htmlFor="email" className="hj">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      className="transition-all duration-300 focus:ring-2 focus:ring-purple-500 hj"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Label htmlFor="phone" className="hj">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                      className="transition-all duration-300 focus:ring-2 focus:ring-purple-500 hj"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Label htmlFor="course" className="hj">Course Interested In *</Label>
                    <Select value={formData.course} onValueChange={(value) => handleInputChange("course", value)}>
                      <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-purple-500">
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course} value={course}>
                            {course}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Label htmlFor="experience" className="hj" >Programming Experience</Label>
                    <Select value={formData.experience} onValueChange={(value) => handleInputChange("experience", value)}>
                      <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-purple-500">
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent className="hj">
                        <SelectItem value="beginner">Complete Beginner</SelectItem>
                        <SelectItem value="basic">Basic Knowledge</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Label htmlFor="message" className="hj">Additional Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your goals, questions, or anything else you'd like us to know..."
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      rows={4}
                      className="transition-all duration-300 focus:ring-2 focus:ring-purple-500 "
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 text-lg transition-all duration-300"
                    >
                      {isSubmitting ? "Submitting..." : "Register for Demo"}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Benefits Section */}
        <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg transition-transform duration-300 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="text-xl">What's Included in Your Demo?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { icon: "✨", title: "Personalized Course Overview", desc: "Get a detailed walkthrough of your chosen course curriculum" },
                    { icon: "💼", title: "Career Guidance", desc: "Learn about job opportunities and salary expectations" },
                    { icon: "🎯", title: "Learning Path Assessment", desc: "Get a customized learning plan based on your background" },
                    { icon: "📞", title: "One-on-One Consultation", desc: "Direct interaction with our expert counselors" }
                  ].map((item, index) => (
                    <motion.div 
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + (index * 0.1) }}
                      className="flex items-start space-x-3"
                    >
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="text-blue-100">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="hover:shadow-lg transition-transform duration-300 hover:-translate-y-1"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Why Students Choose Tech Miya</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Job Placement Rate", value: "95%" },
                    { label: "Average Salary Increase", value: "300%" },
                    { label: "Student Satisfaction", value: "4.9/5" },
                    { label: "Industry Partnerships", value: "50+" }
                  ].map((stat, index) => (
                    <motion.div 
                      key={stat.label}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + (index * 0.1) }}
                      className="flex items-center justify-between"
                    >
                      <span>{stat.label}</span>
                      <span className="font-bold text-green-600">{stat.value}</span>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">🎁</span>
                    <div>
                      <h4 className="font-semibold text-yellow-800">Limited Time Offer</h4>
                      <p className="text-yellow-700">
                        Register now and get <Badge className="ml-1 bg-yellow-500">20% off</Badge> on your course enrollment!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('lms');
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


const handleViewDetails = (job) => {
  // You can show more details in a modal or navigate to a details page
  // For now, we'll just open the registration form
  setActiveTab('demo');
};

const handleApplyNow = (job) => {
  // Open the registration form for applying to this job
  setActiveTab('demo');
  // You could also pre-fill some form data based on the job if needed
};
    const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobError, setJobError] = useState(null);

  // Add this useEffect hook
  useEffect(() => {
    if (activeTab === 'opportunities') {
      loadJobs();
    }
  }, [activeTab]);
const courseImages = {
  "Data Science & Analytics": dataAnalystImg,
  "Java Programming": javaProgrammingImg,
  "Full Stack Development": fullStackDevImg,
  // Add more mappings as needed
};
  const loadJobs = async () => {
    setLoadingJobs(true);
    setJobError(null);
    try {
      const jobsData = await fetchJobs();
      setJobs(jobsData);
      
      // Check which jobs the user has applied for
      const token = localStorage.getItem('token');
      if (token) {
        const applied = [];
        for (const job of jobsData) {
          try {
            const hasApplied = await checkJobApplied(job.id);
            if (hasApplied) applied.push(job.id);
          } catch (err) {
            console.error(`Error checking application for job ${job.id}:`, err);
          }
        }
        setAppliedJobs(applied);
      }
    } catch (error) {
      setJobError(error.message || 'Failed to load jobs');
      console.error('Error loading jobs:', error);
    } finally {
      setLoadingJobs(false);
    }
  };
const jobCardColors = {
  fulltime: 'bg-green-100',
  parttime: 'bg-yellow-100',
  remote: 'bg-blue-100',
  internship: 'bg-purple-100',
};const StarIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
);
const featuredCourses = [
    {
      id: 1,
      title: "Full Stack Development",
      description: "Master both frontend and backend development with modern technologies",
      duration: "6 months",
      level: "Beginner to Advanced",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400",
    },
    {
      id: 2,
      title: "Data Science & Analytics",
      description: "Learn Python, machine learning, and data visualization",
      duration: "4 months",
      level: "Intermediate",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
    },
    {
      id: 3,
      title: "Java Programming",
      description: "Complete Java development from basics to enterprise applications",
      duration: "5 months",
      level: "Beginner",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Developer at Google",
      content: "Tech Miya transformed my career. The hands-on approach and real-world projects prepared me for my dream job.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100",
    },
    {
      name: "Michael Chen",
      role: "Data Scientist at Microsoft",
      content: "The instructors are industry experts who provide invaluable insights. Best investment I've made in my education.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    },
    {
      name: "Emily Rodriguez",
      role: "Full Stack Developer at Amazon",
      content: "From zero to hero in just 6 months. The curriculum is perfectly structured and the support is amazing.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    },
  ];
  const applyForJob = async (jobId, hrId) => {
    try {
      await api.applyForJob(jobId, hrId);
      setAppliedJobs(prev => [...prev, jobId]);
      toast({
        title: "Application Submitted!",
        description: "Your job application has been submitted successfully.",
      });
    } catch (error) {
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    }
  };
  useEffect(() => {
   const fetchCourses = async () => {
    try {
      const data = await getCourses(); // This uses /api/get_courses/
      setCourses(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };
    
    fetchCourses();
  }, []);
const [reviews, setReviews] = useState([]);
const [loadingReviews, setLoadingReviews] = useState(false);
const [reviewsError, setReviewsError] = useState(null);
useEffect(() => {
  if (activeTab === 'lms') {
    loadReviews();
  }
}, [activeTab]);
  // Update the useEffect for Swiper initialization
// Update the useEffect for Swiper initialization


// Add this useEffect hook to load reviews
const [blogs, setBlogs] = useState([]);
const [loadingBlogs, setLoadingBlogs] = useState(true);
const [blogError, setBlogError] = useState(null);

useEffect(() => {
  if (activeTab === 'explore1') {
    const fetchBlogs = async () => {
      try {
        const data = await getBlogs();
        const formattedBlogs = data.map((blog) => ({
          ...blog,
          featured_image: blog.featured_image || `https://placehold.co/400x200?text=${encodeURIComponent(blog.title)}`,
          tags: blog.tags || ['General'],
          author_name: blog.author_name || 'Author',
          read_time: blog.read_time || 5,
          created_at: new Date(blog.created_at).toLocaleDateString(),
        }));
        setBlogs(formattedBlogs);
      } catch (err) {
        setBlogError(err instanceof Error ? err.message : 'Failed to load blogs');
      } finally {
        setLoadingBlogs(false);
      }
    };

    fetchBlogs();
  }
}, [activeTab]);

const loadReviews = async () => {
  setLoadingReviews(true);
  setReviewsError(null);
  try {
    const reviewsData = await getReviews();
    console.log('Reviews data:', reviewsData); 
    
    // Fix the data access here
    if (reviewsData && reviewsData.reviews && reviewsData.reviews.length > 0) {
      // Access the first item's reviews array
      setReviews(reviewsData.reviews[0].reviews || []);
    } else {
      setReviews([]);
    }
  } catch (error) {
    setReviewsError(error.message || 'Failed to load reviews');
    console.error('Error loading reviews:', error);
  } finally {
    setLoadingReviews(false);
  }
};
  const renderContent = () => {
    switch (activeTab) {
    case 'explore':
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Discover Your Learning Journey
          </h2>
          <p className="text-xl text-gray-600">
            Explore thousands of courses taught by expert instructors from around the world
          </p>
          <br />
          <br />
        </div>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">
            Error loading courses: {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => {
                // Extract description from the first content item of the first chapter
                const description = course.chapters?.[0]?.contents?.[0]?.content || 
                                  "Comprehensive course covering essential concepts and practical applications";
                
                // Get the appropriate image based on course title
                const imageUrl = courseImages[course.title] || 
                                course.image || 
                                `https://placehold.co/400x200/818cf8/ffffff?text=${encodeURIComponent(course.title)}`;
                
                return (
                  <motion.div 
                    key={course._id}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="course-card bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative h-48 bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-center">
                      <div className="absolute inset-0 w-full h-full">
                        <img 
                          src={imageUrl} 
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <Badge className="bg-blue-500 text-white">
                          {course.level || 'All Levels'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                          {course.title}
                        </h3>
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {course.duration || 'Flexible'}
                          </span>
                        </div>
                        <span className="text-lg font-semibold text-purple-600">
                          {course.price ? `₹${course.price}` : 'Free'}
                        </span>
                      </div>
                      
                     
                        <Button className="w-full"    onClick={() => setActiveTab('demo')}>
                          Learn More
                        </Button>
               
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <br />
            <br />
          </>
        )}
      </div>
    </section>
  );
      // Other cases remain the same as before

 case 'explore1':
  return (
    <div className="bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className='page-container'>
      <header className="mb-12 text-center">
        <br />
        <h1 className="text-3xl font-bold text-gray-900">Blog Articles</h1>
        <p className="mt-2 text-lg text-gray-600">Read our latest articles and insights</p>
      </header>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-white rounded-lg shadow-sm">
              <Skeleton className="h-48 w-full rounded-t-lg" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full rounded-md" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <strong className="font-bold">Error! </strong>
          <span>{error}</span>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-12 max-w-2xl mx-auto">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <BookOpen className="h-5 w-5 text-gray-500" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No blogs found</h3>
          <p className="mt-2 text-gray-600">
            There are no blog articles available at the moment
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {blogs.map((blog) => (
            <Card 
              key={blog._id} 
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 ml-4"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img 
                  src={blog.featured_image} 
                  alt={blog.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/50 to-transparent p-4">
                  <div className="flex gap-2 flex-wrap">
                    {blog.tags?.map((tag) => (
                      <Badge 
                        key={tag} 
                        className="bg-white text-gray-800 hover:bg-gray-100 border border-gray-200"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <CardHeader className="pb-0">
                <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {blog.title}
                </CardTitle>
                <CardDescription className="text-gray-600 line-clamp-2 mt-1">
                  {blog.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-4">
                <div className="flex justify-between items-center text-sm text-gray-600 mb-3 ">
                  <span className="font-medium">By {blog.author_name}</span>
                  <span>{blog.read_time} min read</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  <span>{blog.created_at}</span>
                </div>
              </CardContent>
              
              <CardFooter className="pt-0">
                <Button 
                  className="w-full mt-4" 
                  variant="outline"
                 onClick={() => navigate("/login")}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Read Article
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
    </div>
  );
      case 'opportunities':
  return (
<div className="content-section opportunities-section py-12 pt-20 bg-white">
      <br />
      <br />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Job Opportunities
        </h2>
        <p className="text-lg text-center mb-12 max-w-2xl mx-auto text-gray-600">
          Browse through our latest job openings and take the next step in your career.
        </p>
        
        {/* Loading state */}
        {loadingJobs && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-blue-500"></div>
          </div>
        )}
        
        {/* Error state */}
        {jobError && (
          <div className="text-center text-red-500 py-4 bg-red-50 rounded-lg mx-auto max-w-md">
            <div className="p-4">
              {jobError}
              <Button 
                variant="outline" 
                onClick={loadJobs}
                className="ml-4 border-red-300 text-red-600 hover:bg-red-50"
              >
                Retry
              </Button>
            </div>
          </div>
        )}
        
       
        {/* Jobs list */}
        {!loadingJobs && !jobError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto max-w-7xl">
            {jobs.length > 0 ? (
              jobs.map((job, index) => (
                <Card 
                  key={job._id} 
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:scale-[1.02] transform"
                >
                  {/* Card Header with Gradient */}
                  <div className={`h-2 ${jobCardColors[index % jobCardColors.length]} bg-gradient-to-r`}></div>
                  
                  <div className="p-6">
                    {/* Job Title and Company */}
                    <div className="mb-4">
                      <h2 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {job.Job}
                      </h2>
                      <div className="flex items-center mb-3 text-gray-600">
                        <Building className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="font-medium text-gray-700">{job.Org}</span>
                      </div>
                    </div>

                    {/* Location and Job Type */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-green-500" />
                        <span className="text-sm">{job.Location}</span>
                      </div>
                      <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full border border-green-200">
                        {job.job_type}
                      </span>
                    </div>

                    {/* Salary */}
                    <div className="mb-4">
                      <div className="flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-100">
                        <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                        <span className="text-lg font-bold text-gray-800">₹{job.Salary}K</span>
                        <span className="text-sm text-gray-500 ml-1">per annum</span>
                      </div>
                    </div>

                    {/* Experience and Posted Date */}
                    <div className="grid grid-cols-1 gap-3 mb-4 text-sm">
                      <div className="flex items-center text-gray-700 bg-gray-50 rounded-lg p-2">
                        <Briefcase className="h-4 w-4 mr-2 text-purple-500" />
                        <span className="font-medium">Experience:</span>
                        <span className="ml-1 font-semibold">{job.experience} years</span>
                      </div>
                      <div className="flex items-center text-gray-700 bg-gray-50 rounded-lg p-2">
                        <Clock className="h-4 w-4 mr-2 text-orange-500" />
                        <span className="font-medium">Posted:</span>
                        <span className="ml-1">{formatDate(job.posted_date)}</span>
                      </div>
                    </div>
                    
                    {/* Job Description */}
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                        {job.FullDescription}
                      </p>
                    </div>

                    {/* Action Buttons */}
                   <div className="flex gap-3">
  <Button 
    variant="outline" 
    size="sm"
    className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
onClick={() => navigate("/login")}
  >
    <Eye className="h-4 w-4 mr-2" />
    View Details
  </Button>
  <Button 
    size="sm"
    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-blue-700 text-white border-0 transition-all duration-200 shadow-md hover:shadow-lg"
   onClick={() => navigate("/login")}
  >
    <MapPin className="h-4 w-4 mr-2" />
    Apply Now
  </Button>
</div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-transparent group-hover:from-blue-50/20 group-hover:to-purple-50/20 pointer-events-none transition-all duration-300 rounded-2xl"></div>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
                  <div className="text-gray-400 mb-4">
                    <Briefcase className="h-16 w-16 mx-auto mb-4" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Jobs Available</h3>
                  <p className="text-gray-500 mb-4">No job openings available at the moment. Check back later for new opportunities.</p>
                  <Button 
                    variant="outline" 
                    onClick={loadJobs}
                    className="bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Refresh Jobs
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
      case 'teach':
        return (
          <div className="content-section teach-section">
            <div className="container">
              <h2>Come teach with us</h2>
              <p>Become an instructor and change lives—including your own.</p>
              <button className="btn-primary" onClick={() => navigate("/loginteacher")}>Start Teaching</button>
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
          <div className="min-h-screen tk">
            <br />
            <br />
            <br />
            <br />
            <br />
            
            <section className="relative bg-gradient-to-br from-blue-900 to-indigo-900 text-white overflow-hidden">
  <div className="absolute inset-0 "></div>
  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Left Side - Rotating Tech Logos */}
      <div className="relative h-64 w-64 mx-auto lg:mx-0 ">
        {/* Circle Container */}
        <div className="absolute inset-0 rounded-full border-4 fv flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-blue-200/20 animate-ping fv"></div>
        </div>
        
        {/* Rotating Logos */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg animate-orbit origin-[50%_150px]">
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" alt="HTML" className="w-10 h-10" />
        </div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg animate-orbit origin-[-50px_50%] delay-1000">
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" alt="CSS" className="w-10 h-10" />
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg animate-orbit origin-[50%_-50px] delay-2000">
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JavaScript" className="w-10 h-10" />
        </div>
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg animate-orbit origin-[150px_50%] delay-3000">
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" alt="React" className="w-10 h-10" />
        </div>
        
        {/* Center Logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-30 h-30 bg-blue-600 rounded-full flex items-center justify-center shadow-xl">
            <span className="text-white text-xl font-bold p-5">TE</span>
          </div>
        </div>
      </div>

      {/* Right Side - TAP ACADEMY Content */}
      <div className="text-center lg:text-left">
        <Badge variant="secondary" className="mb-4 bg-yellow-400 text-blue-900 hover:bg-yellow-500">
          #1 Coding Institute
        </Badge>
        <h1 className="text-4xl lg:text-6xl font-bold mb-6 ">
          <span className=" bg-clip-text text-transparent text-white">
         TECHMIYA ED-TECH
          </span>
        </h1>
        <div className="space-y-4 mb-8">
          <p className="text-xl lg:text-2xl font-medium ">
            <span className="mr-2">🎮</span> Gamify Learning
          </p>
          <p className="text-xl lg:text-2xl font-medium  ">
            <span className="mr-2">✨</span> Simplify Employment
          </p>
          <p className="text-xl text-blue-200">
            The Best Institute For Java Full Stack Developer Course
          </p>
        </div>
        <p className="text-lg text-blue-100 mb-8">
          Trusted by over <span className="font-bold text-yellow-300">75,000+</span> students across India
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
    
            <Button size="lg"   onClick={() => setActiveTab('demo')} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold px-8 py-4 text-lg">
              Attend Free Demo Class
            </Button>
        
<Button
  size="lg"

  className=" from-yellow-500 to-orange-500 text-white font-semibold px-8 py-4 text-lg  "   onClick={() => setActiveTab('demo')}
>


              Explore Placement Opportunity
            </Button>
       
        </div>
      </div>
    </div>
  </div>

<div className="relative bg-gradient-to-br from-blue-900 to-indigo-900 py-6">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h3 className="text-center text-blue-200 text-sm font-semibold mb-4">OUR RECRUITMENT PARTNERS</h3>
    <div className="flex overflow-hidden">
      {/* First Marquee */}
      <div className="flex animate-marquee whitespace-nowrap items-center">
        {[
          ["google.com", "Google"],
          ["amazon.com", "Amazon"],
          ["microsoft.com", "Microsoft"],
          ["infosys.com", "Infosys"],
          ["tcs.com", "TCS"],
          ["accenture.com", "Accenture"],
          ["wipro.com", "Wipro"],
          ["capgemini.com", "Capgemini"],
          ["oracle.com", "Oracle"],
          ["hcltech.com", "HCL"],
          ["cognizant.com", "Cognizant"],
          ["sap.com", "SAP"],
          ["salesforce.com", "Salesforce"],
          ["zoom.us", "Zoom"],
          ["paypal.com", "PayPal"],
          ["intel.com", "Intel"],
          ["adobe.com", "Adobe"],
          ["netflix.com", "Netflix"],
          ["linkedin.com", "LinkedIn"],
          ["cisco.com", "Cisco"],
          ["stripe.com", "Stripe"],
          ["google.com", "Google"],
          ["amazon.com", "Amazon"],
          ["microsoft.com", "Microsoft"],
          ["infosys.com", "Infosys"],
          ["tcs.com", "TCS"],
          ["accenture.com", "Accenture"],
          ["wipro.com", "Wipro"],
          ["capgemini.com", "Capgemini"],
          ["oracle.com", "Oracle"],
          ["hcltech.com", "HCL"],
          ["cognizant.com", "Cognizant"],
          ["sap.com", "SAP"],
          ["salesforce.com", "Salesforce"],
          ["zoom.us", "Zoom"],
          ["paypal.com", "PayPal"],
          ["intel.com", "Intel"],
          ["adobe.com", "Adobe"],
          ["netflix.com", "Netflix"],
          ["linkedin.com", "LinkedIn"],
          ["cisco.com", "Cisco"],
          ["stripe.com", "Stripe"],
        ].map(([domain, name]) => (
          <div key={name} className="partner-item">
            <img src={`https://logo.clearbit.com/${domain}`} alt={name} className="h-8 opacity-80 hover:opacity-100 transition-opacity" />
            <span className="text-sm text-white">{name}</span>
          </div>
        ))}
      </div>

      {/* Second Marquee for seamless loop */}
      <div className="flex animate-marquee2 whitespace-nowrap items-center">
        {[
          ["google.com", "Google"],
          ["amazon.com", "Amazon"],
          ["microsoft.com", "Microsoft"],
          ["infosys.com", "Infosys"],
          ["tcs.com", "TCS"],
          ["accenture.com", "Accenture"],
          ["wipro.com", "Wipro"],
          ["capgemini.com", "Capgemini"],
          ["oracle.com", "Oracle"],
          ["hcltech.com", "HCL"],
          ["cognizant.com", "Cognizant"],
          ["sap.com", "SAP"],
          ["salesforce.com", "Salesforce"],
          ["zoom.us", "Zoom"],
          ["paypal.com", "PayPal"],
          ["intel.com", "Intel"],
          ["adobe.com", "Adobe"],
          ["netflix.com", "Netflix"],
          ["linkedin.com", "LinkedIn"],
          ["cisco.com", "Cisco"],
          ["stripe.com", "Stripe"],
          ["google.com", "Google"],
          ["amazon.com", "Amazon"],
          ["microsoft.com", "Microsoft"],
          ["infosys.com", "Infosys"],
          ["tcs.com", "TCS"],
          ["accenture.com", "Accenture"],
          ["wipro.com", "Wipro"],
          ["capgemini.com", "Capgemini"],
          ["oracle.com", "Oracle"],
          ["hcltech.com", "HCL"],
          ["cognizant.com", "Cognizant"],
          ["sap.com", "SAP"],
          ["salesforce.com", "Salesforce"],
          ["zoom.us", "Zoom"],
          ["paypal.com", "PayPal"],
          ["intel.com", "Intel"],
          ["adobe.com", "Adobe"],
          ["netflix.com", "Netflix"],
          ["linkedin.com", "LinkedIn"],
          ["cisco.com", "Cisco"],
          ["stripe.com", "Stripe"],
        ].map(([domain, name]) => (
          <div key={name + "-2"} className="partner-item">
            <img src={`https://logo.clearbit.com/${domain}`} alt={name} className="h-8 opacity-80 hover:opacity-100 transition-opacity" />
            <span className="text-sm text-white">{name}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>


</section>



       
            {/* Mission Section */}
            <section className="py-60 bg-gray-50 mt-20 px-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <br />
                <br />
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 px-4">
                  Our Mission
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 hj">
                  To bridge the gap between traditional education and industry requirements by providing 
                  practical, hands-on training that prepares students for successful tech careers.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-6">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 hj">Industry-Focused</h3>
                    <p className="text-gray-600 hj">
                      Curriculum designed with input from leading tech companies
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🚀</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 hj">Career Support</h3>
                    <p className="text-gray-600 hj">
                      Dedicated placement assistance and career guidance
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💡</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 hj">Hands-on Learning</h3>
                    <p className="text-gray-600 hj">
                      Real projects and practical experience from day one
                    </p>
                  </div>
                </div>
              </div>
            </section>  

            
     

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r text-white">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-white">
                  Ready to Start Your Tech Journey?
                </h2>
                <p className="text-xl mb-8">
                  Join thousands of students who have transformed their careers with Tech Miya
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="text-purple-600 hover:bg-black px-8 py-4 text-lg font-semibold"
                    onClick={() => setActiveTab('demo')}
                  >
                    Register for Demo
                  </Button>
                 {/* <Link 
  to="#contact-section" // Add hash link to the section ID
  onClick={(e) => {
    e.preventDefault();
    const element = document.getElementById('contact-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }}
>
                    <Button size="lg" 
                    className="text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                      Contact Us
                    </Button>
                  </Link> */}
                </div>
              </div>
            </section>
 
<section className="py-20 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
        Featured Courses
      </h2>
      <p className="text-xl text-gray-600">
        Start your tech journey with our most popular programs
      </p>
      <br />
      <br />
    </div>
    
    {loading ? (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    ) : error ? (
      <div className="text-center text-red-500">
        Error loading courses: {error}
      </div>
    ) : (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.slice(0, 6).map((course) => {
            // Extract description from the first content item of the first chapter
            const description = course.chapters?.[0]?.contents?.[0]?.content || 
                              "Comprehensive course covering essential concepts and practical applications";
            
            // Generate image URL - use course.image or fallback to placeholder with course title
         const imageUrl = courseImages[course.title] || 
                                course.image || 
                                `https://placehold.co/400x200/818cf8/ffffff?text=${encodeURIComponent(course.title)}`;
            
            return (
              <motion.div 
                key={course._id}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
                className="course-card bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-48 bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-center">
                  <div className="absolute inset-0 w-full h-full">
                    <img 
                      src={imageUrl} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <Badge className="bg-blue-500 text-white">
                      {course.level || 'All Levels'}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                      {course.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {course.duration || 'Flexible'}
                      </span>
                    </div>
                    <span className="text-lg font-semibold text-purple-600">
                      {course.price ? `₹${course.price}` : ''}
                    </span>
                  </div>
                  
                
                    <Button  onClick={() => setActiveTab('demo')} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white mx-5">
                      View Details
                    </Button>
                 
                </div>
              </motion.div>
            );
          })}
        </div>
        <br />
        <br />
        <div className="text-center mt-12">

           <Button 
  size="lg" 
  variant="outline" 
  className="px-8 border-purple-600 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
  onClick={() => setActiveTab('explore')}
>
  View All Courses
</Button>
        </div>
      </>
    )}
  </div>
</section>

 {/* Student Reviews */}

{/* Student Reviews */}
<section className="py-24 bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <br />
    <br />
    <div className="text-center mb-16">
      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
        What Our Students Say
      </h2>
      <p className="text-xl text-gray-600">
        Real stories from our successful graduates
      </p>
    </div>

    {loadingReviews ? (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    ) : reviewsError ? (
      <div className="text-center py-8 bg-red-50 rounded-lg max-w-md mx-auto">
        <div className="flex flex-col items-center">
          <MessageSquareWarning className="h-10 w-10 text-red-500 mb-3" />
          <p className="text-red-500 mb-4 text-lg font-medium">{reviewsError}</p>
          <Button 
            variant="outline" 
            onClick={loadReviews}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            Try Again
          </Button>
        </div>
      </div>
    ) : reviews.length > 0 ? (
      <div className="relative">
        <Swiper
          modules={[Navigation]}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          spaceBetween={30}
          slidesPerView={1}
          breakpoints={{
            640: {
              slidesPerView: 1,
            },
            768: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          className="mySwiper"
        >
          {reviews.map((review, index) => (
            <SwiperSlide key={index}>
              <div className="group bg-white border border-solid h-auto border-gray-300 rounded-2xl p-6 transition-all duration-500 w-full hover:border-indigo-600">
                <div className="flex items-center mb-9 gap-2 text-amber-500 transition-all duration-500 group-hover:text-indigo-600 text-indigo-600">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i}
                      className={`w-5 h-5 ${i < review.rating ? 'fill-current' : 'fill-none stroke-current'}`}
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                        strokeWidth="1.5"
                      />
                    </svg>
                  ))}
                </div>
                <p className="text-lg text-gray-500 leading-8 h-24 transition-all duration-500 mb-9 group-hover:text-gray-800">
                  {review.reviewContent}
                </p>
                <div className="flex items-center gap-5">
                  <img 
                    className="rounded-full object-cover w-12 h-12" 
                    src={review.userImage || `https://i.pravatar.cc/150?img=${index}`} 
                    alt={review.username} 
                  />
                  <div className="grid gap-1">
                    <h5 className="text-gray-900 font-medium transition-all duration-500 group-hover:text-indigo-600">
                      {review.username}
                    </h5>
                    <span className="text-sm leading-6 text-gray-500">Student</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation buttons */}
        <div className="flex items-center gap-8 justify-center mt-8">
          <button 
            className="swiper-button-prev bb group flex justify-center items-center border border-solid border-indigo-600 w-12 h-12 transition-all duration-500 rounded-full hover:bg-indigo-600"
          >
            <svg className="h-6 w-6 text-indigo-600 group-hover:text-white my-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.9999 12L4.99992 12M9.99992 6L4.70703 11.2929C4.3737 11.6262 4.20703 11.7929 4.20703 12C4.20703 12.2071 4.3737 12.3738 4.70703 12.7071L9.99992 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        
          <button 
            className="swiper-button-next group flex justify-center items-center border border-solid border-indigo-600 w-12 h-12 transition-all duration-500 rounded-full hover:bg-indigo-600"
          >
            <svg className="h-6 w-6 text-indigo-600 group-hover:text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12L19 12M14 18L19.2929 12.7071C19.6262 12.3738 19.7929 12.2071 19.7929 12C19.7929 11.7929 19.6262 11.6262 19.2929 11.2929L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    ) : (
      <div className="text-center py-12 bg-gray-100 rounded-lg">
        <div className="flex flex-col items-center">
          <MessageSquareWarning className="h-10 w-10 text-gray-400 mb-3" />
          <p className="text-gray-500 text-lg font-medium">No reviews available yet</p>
          <p className="text-gray-400 mt-2">Be the first to share your experience!</p>
          <Button 
            variant="outline" 
            onClick={() => setActiveTab('demo')}
            className="mt-4 border-purple-300 text-purple-600 hover:bg-purple-50"
          >
            Leave a Review
          </Button>
        </div>
      </div>
    )}
  </div>
</section>
            {/* Contact Details Section */}
<section id="contact-section" className="py-12 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-3xl font-bold text-center  mb-8 hj">Get In Touch With Us</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Contact Information - Side by Side Version */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phone */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-md font-medium  hj">Phone</h3>
              <p className="text-sm   hj">+91 6361987951</p>

            </div>
          </div>

          {/* Email */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-md font-medium hj">Email</h3>
              <p className="text-sm  hj">info@techmiyasolutions.com</p>

            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Address */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-md font-medium  hj">Address</h3>
              <p className="text-sm  hj">28th Main Rd, 3rd Phase, Jayanagar, Bengaluru, Karnataka 560069.</p>
            </div>
          </div>

          {/* Working Hours */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-md font-medium  hj">Working Hours</h3>
              <p className="text-sm  hj">Monday - Friday: 9AM-6PM <br />Saturday: 10AM-4PM <br />Sunday: Closed</p>
          
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="rounded-lg overflow-hidden shadow-md h-64 md:h-full">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.863413965066!2d77.59264637484037!3d12.916498987393805!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1593b046e93b%3A0x7ff3f9c780549b2e!2sTechmiya%20Ed-Tech!5e0!3m2!1sen!2sin!4v1747993732029!5m2!1sen!2sin" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }}
          allowFullScreen="" 
          loading="lazy"
          title="Tech Miya Location"
        ></iframe>
      </div>
    </div>
  </div>
</section>
          </div>
        );
      case 'demo':
        return <Register onBack={() => setActiveTab('lms')} />;
      default:
        return <div>Content not found</div>;
    }
  };

  return (
    <div className="lms-app">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

Dashboard.propTypes = {
  courses: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      imageUrl: PropTypes.string,
      price: PropTypes.number
    })
  )
};

export default Dashboard;