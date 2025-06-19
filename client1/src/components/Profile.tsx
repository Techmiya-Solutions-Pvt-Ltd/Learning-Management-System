import React, { useState, useEffect, useRef } from 'react';
import { generateResumePDF } from '././services/resumeGenerator';

import { 
  User, Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap,
  Book, Award, BarChart, FileText, Plus, Trash, Edit, Download, Upload
} from 'lucide-react';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { fetchUserProfile, updateProfileAPI } from '@/services/api';
import { uploadResume, downloadResume,deleteResume } from '@/services/api';

// Resume templates
const resumeTemplates = [
  { id: 1, name: 'Professional', preview: '/templates/professional.jpg' },
  { id: 2, name: 'Modern', preview: '/templates/modern.jpg' },
  { id: 3, name: 'Creative', preview: '/templates/creative.jpg' },
  { id: 4, name: 'Minimalist', preview: '/templates/minimalist.jpg' }
];

export const Profile: React.FC = () => {
  const { toast } = useToast();
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    location: '',
    title: '',
    profile_picture: '',
    skills: [],
    experiences: [],
    projects: [],
    education: {
      '10th': { board: '', school: '', percentage: '', passout_year: '' },
      '12th': { board: '', school: '', percentage: '', passout_year: '' },
      graduation: { college: '', branch: '', percentage: '', passout_year: '' }
    },
    resume: null
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Refs for scroll navigation
  const skillsRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const educationRef = useRef<HTMLDivElement>(null);
  const experiencesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchUserProfile();
        setUserData(data);
        calculateProfileCompletion(data);
      } catch (error) {
        console.error('Failed to load profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      }
    };
    loadProfile();
  }, []);

  const calculateProfileCompletion = (data) => {
    let completedFields = 0;
    const totalFields = 15; // Adjust based on your important fields
    
    // Basic info
    if (data.first_name) completedFields++;
    if (data.last_name) completedFields++;
    if (data.email) completedFields++;
    if (data.mobile) completedFields++;
    if (data.location) completedFields++;
    if (data.profile_picture) completedFields++;
    
    // Education
    if (data.education['10th'].school) completedFields++;
    if (data.education['12th'].school) completedFields++;
    if (data.education.graduation.college) completedFields++;
    
    // Skills
    if (data.skills.length > 0) completedFields++;
    
    // Experiences
    if (data.experiences.length > 0) completedFields++;
    
    // Projects
    if (data.projects.length > 0) completedFields++;
    
    // Resume
    if (data.resume) completedFields++;
    
    setProfileCompletion(Math.round((completedFields / totalFields) * 100));
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      const updatedSkills = [...userData.skills, { name: newSkill, level: skillLevel }];
      setUserData({
        ...userData,
        skills: updatedSkills
      });
      setNewSkill('');
      calculateProfileCompletion({
        ...userData,
        skills: updatedSkills
      });
    }
  };
  const handleDownloadResume = async () => {
    try {
      toast({
        title: "Preparing Resume",
        description: "Your download will start shortly...",
      });
  
      const { url, filename } = await downloadResume();
      
      // Create temporary link
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
  
      toast({
        title: "Download Started",
        description: `Your resume (${filename}) is downloading`,
      });
    } catch (error) {
      console.error('Download failed:', error);
      
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
        action: (
          <Button 
            variant="ghost" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        ),
      });
    }
  };
  const handleDeleteSkill = (index) => {
    const updatedSkills = [...userData.skills];
    updatedSkills.splice(index, 1);
    setUserData({ ...userData, skills: updatedSkills });
    calculateProfileCompletion({ ...userData, skills: updatedSkills });
  };

  const handleEducationChange = (level, field, value) => {
    const updatedEducation = {
      ...userData.education,
      [level]: {
        ...userData.education[level],
        [field]: value
      }
    };
    setUserData({
      ...userData,
      education: updatedEducation
    });
    calculateProfileCompletion({
      ...userData,
      education: updatedEducation
    });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const updatedData = {
          ...userData,
          profile_picture: event.target.result
        };
        setUserData(updatedData);
        calculateProfileCompletion(updatedData);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please login again",
        variant: "destructive",
      });
      return;
    }
  
    try {
      const result = await uploadResume(file);
      if (result.success) {
        toast({
          title: "Success",
          description: "Resume uploaded successfully",
        });
        setUserData(prev => ({
          ...prev,
          resume: {
            name: result.filename || file.name,
            url: URL.createObjectURL(file), // Create a temporary URL for display
            uploadedAt: new Date().toISOString()
          }
        }));
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      e.target.value = '';
    }
  };

  const handleAddProject = () => {
    setUserData({
      ...userData,
      projects: [...userData.projects, {
        title: '',
        description: '',
        link: '',
        start_date: '',
        end_date: '',
        currently_ongoing: false
      }]
    });
  };

  const handleProjectChange = (index, field, value) => {
    const updatedProjects = [...userData.projects];
    updatedProjects[index] = {
      ...updatedProjects[index],
      [field]: value
    };
    setUserData({
      ...userData,
      projects: updatedProjects
    });
    calculateProfileCompletion({
      ...userData,
      projects: updatedProjects
    });
  };

  const handleDeleteProject = (index) => {
    const updatedProjects = [...userData.projects];
    updatedProjects.splice(index, 1);
    setUserData({ ...userData, projects: updatedProjects });
    calculateProfileCompletion({ ...userData, projects: updatedProjects });
  };

  const handleAddExperience = () => {
    setUserData({
      ...userData,
      experiences: [...userData.experiences, {
        company_name: '',
        job_title: '',
        start_date: '',
        end_date: '',
        currently_working: false,
        description: ''
      }]
    });
  };

  const handleExperienceChange = (index, field, value) => {
    const updatedExperiences = [...userData.experiences];
    updatedExperiences[index] = {
      ...updatedExperiences[index],
      [field]: value
    };
    setUserData({
      ...userData,
      experiences: updatedExperiences
    });
    calculateProfileCompletion({
      ...userData,
      experiences: updatedExperiences
    });
  };

  const handleDeleteExperience = (index) => {
    const updatedExperiences = [...userData.experiences];
    updatedExperiences.splice(index, 1);
    setUserData({ ...userData, experiences: updatedExperiences });
    calculateProfileCompletion({ ...userData, experiences: updatedExperiences });
  };

 // Update the generateResume function in your Profile component
 const generateResume = async () => {
  try {
    // Show loading state
    toast({
      title: "Generating Resume",
      description: "Please wait while we prepare your resume...",
    });

    // Generate the PDF
    const pdfBlob = await generateResumePDF(selectedTemplate, userData);
    
    // Create download link
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${userData.first_name}_${userData.last_name}_Resume.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Success notification
    toast({
      title: "Resume Downloaded",
      description: `Your ${resumeTemplates.find(t => t.id === selectedTemplate)?.name} resume has been downloaded!`,
    });
  } catch (error) {
    console.error('Error generating resume:', error);
    toast({
      title: "Error",
      description: "Failed to generate resume. Please try again.",
      variant: "destructive",
    });
  }
};

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfileAPI(userData);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
      setIsEditingSkills(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side - Profile Card */}
        <div className="lg:w-1/3">
          <Card className="sticky top-4">
            <CardHeader className="text-center">
              <div className="relative mx-auto mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={userData.profile_picture} />
                  <AvatarFallback>
                    {userData.first_name.charAt(0)}{userData.last_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="profile-picture" className="absolute bottom-0 right-0 bg-primary rounded-full p-2 cursor-pointer">
                  <Edit className="h-4 w-4 text-white" />
                  <input 
                    id="profile-picture" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                  />
                </label>
              </div>
              <CardTitle>
                <Input 
                  value={userData.first_name}
                  onChange={(e) => setUserData({...userData, first_name: e.target.value})}
                  placeholder="First Name"
                  className="text-center text-2xl font-bold border-none focus-visible:ring-0"
                />
                <Input 
                  value={userData.last_name}
                  onChange={(e) => setUserData({...userData, last_name: e.target.value})}
                  placeholder="Last Name"
                  className="text-center text-2xl font-bold border-none focus-visible:ring-0 mt-2"
                />
              </CardTitle>
              <CardDescription>
                <Input 
                  value={userData.title}
                  onChange={(e) => setUserData({...userData, title: e.target.value})}
                  placeholder="Your professional title"
                  className="text-center border-none focus-visible:ring-0"
                />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Profile Completion</span>
                  <span className="text-sm font-medium">{profileCompletion}%</span>
                </div>
                <Progress value={profileCompletion} />
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Quick Access</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => scrollToSection(skillsRef)}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    Skills
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => scrollToSection(projectsRef)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Projects
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => scrollToSection(experiencesRef)}
                  >
                    <Award className="mr-2 h-4 w-4" />
                    Experience
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => scrollToSection(educationRef)}
                  >
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Education
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Contact Info</h3>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <Input 
                    value={userData.email}
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                    placeholder="Email"
                    type="email"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <Input 
                    value={userData.mobile}
                    onChange={(e) => setUserData({...userData, mobile: e.target.value})}
                    placeholder="Phone"
                    type="tel"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <Input 
                    value={userData.location}
                    onChange={(e) => setUserData({...userData, location: e.target.value})}
                    placeholder="Location"
                  />
                </div>
              </div>
              <div className="space-y-2">
  <h3 className="font-medium">Resume</h3>
  {userData.resume ? (
  <div className="flex items-center justify-between p-3 border rounded-lg">
    <div className="flex items-center gap-2">
      <FileText className="h-5 w-5 text-muted-foreground" />
      <span className="text-sm truncate">{userData.resume.name}</span>
    </div>
    <div className="flex gap-2">
      {/* <Button 
        variant="ghost" 
        size="sm"
        onClick={async () => {
          try {
            const response = await downloadResume();
            if (response.success) {
              const a = document.createElement('a');
              a.href = response.url;
              a.download = response.filename || 'resume.pdf';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              // Revoke the object URL after download
              setTimeout(() => URL.revokeObjectURL(response.url), 100);
            } else {
              throw new Error(response.error);
            }
          } catch (error) {
            toast({
              title: "Download Failed",
              description: error.message,
              variant: "destructive",
            });
          }
        }}
      >
        <Download className="h-4 w-4" />
      </Button> */}
      <Button 
        variant="ghost" 
        size="sm"
        onClick={async () => {
          try {
            // Call API to delete resume
            await deleteResume();
            setUserData(prev => ({...prev, resume: null}));
            toast({
              title: "Success",
              description: "Resume deleted successfully",
            });
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to delete resume",
              variant: "destructive",
            });
          }
        }}
      >
        <Trash className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-accent/50 transition-colors">
                  <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                  <span className="text-sm font-medium">Upload Resume</span>
                  <span className="text-xs text-muted-foreground mt-1">PDF, DOC, or DOCX (Max 5MB)</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                  />
                </label>
                )}

                <Select 
                  value={selectedTemplate.toString()} 
                  onValueChange={(value) => setSelectedTemplate(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {resumeTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button className="w-full" onClick={generateResume}>
                  <Download className="mr-2 h-4 w-4" />
                  Generate & Download
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={saveProfile} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Profile"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Side - Main Content */}
        <div className="lg:w-2/3 space-y-6">
          {/* Skills Section */}
          <div ref={skillsRef}>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Briefcase className="mr-2 h-5 w-5" />
                    Skills
                  </CardTitle>
                  <Button 
                    size="sm" 
                    onClick={() => setIsEditingSkills(!isEditingSkills)}
                    variant={isEditingSkills ? "default" : "outline"}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {isEditingSkills ? 'Done' : 'Edit'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isEditingSkills ? (
                  <div className="space-y-4">
                    <div className="flex gap-2 flex-col md:flex-row">
                      <Input 
                        placeholder="New skill" 
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Select value={skillLevel} onValueChange={setSkillLevel}>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button onClick={handleAddSkill}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {userData.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="py-1.5">
                          {skill.name}
                          <span className="ml-2 text-xs opacity-70">{skill.level}</span>
                          <button 
                            onClick={() => handleDeleteSkill(index)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <Trash className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {userData.skills.length > 0 ? (
                      userData.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="py-1.5">
                          {skill.name}
                          <span className="ml-2 text-xs opacity-70">{skill.level}</span>
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No skills added yet</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Projects Section */}
          <div ref={projectsRef}>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Projects
                  </CardTitle>
                  <Button size="sm" onClick={handleAddProject}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Project
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {userData.projects.length > 0 ? (
                  userData.projects.map((project, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <Input
                          value={project.title}
                          onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
                          placeholder="Project Title"
                          className="font-medium border-none focus-visible:ring-0 px-0"
                        />
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteProject(index)}
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <Textarea
                        value={project.description}
                        onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                        placeholder="Project description"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          value={project.link}
                          onChange={(e) => handleProjectChange(index, 'link', e.target.value)}
                          placeholder="Project URL"
                        />
                        <div className="flex items-center gap-2">
                          <Input
                            value={project.start_date}
                            onChange={(e) => handleProjectChange(index, 'start_date', e.target.value)}
                            placeholder="Start Date"
                            type="date"
                          />
                          <Input
                            value={project.end_date}
                            onChange={(e) => handleProjectChange(index, 'end_date', e.target.value)}
                            placeholder="End Date"
                            type="date"
                            disabled={project.currently_ongoing}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`ongoing-${index}`}
                          checked={project.currently_ongoing}
                          onChange={(e) => handleProjectChange(index, 'currently_ongoing', e.target.checked)}
                        />
                        <label htmlFor={`ongoing-${index}`} className="text-sm">
                          Currently ongoing
                        </label>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No projects added yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Experience Section */}
          <div ref={experiencesRef}>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Award className="mr-2 h-5 w-5" />
                    Work Experience
                  </CardTitle>
                  <Button size="sm" onClick={handleAddExperience}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Experience
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {userData.experiences.length > 0 ? (
                  userData.experiences.map((exp, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <Input
                          value={exp.company_name}
                          onChange={(e) => handleExperienceChange(index, 'company_name', e.target.value)}
                          placeholder="Company Name"
                          className="font-medium border-none focus-visible:ring-0 px-0"
                        />
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteExperience(index)}
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <Input
                        value={exp.job_title}
                        onChange={(e) => handleExperienceChange(index, 'job_title', e.target.value)}
                        placeholder="Job Title"
                      />
                      <Textarea
                        value={exp.description}
                        onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                        placeholder="Job description"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <Input
                            value={exp.start_date}
                            onChange={(e) => handleExperienceChange(index, 'start_date', e.target.value)}
                            placeholder="Start Date"
                            type="date"
                          />
                          <Input
                            value={exp.end_date}
                            onChange={(e) => handleExperienceChange(index, 'end_date', e.target.value)}
                            placeholder="End Date"
                            type="date"
                            disabled={exp.currently_working}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`current-${index}`}
                          checked={exp.currently_working}
                          onChange={(e) => handleExperienceChange(index, 'currently_working', e.target.checked)}
                        />
                        <label htmlFor={`current-${index}`} className="text-sm">
                          I currently work here
                        </label>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No work experience added yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Education Section */}
          <div ref={educationRef}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 10th Grade */}
                <div className="space-y-2">
                  <h3 className="font-medium">10th Grade</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">School</label>
                      <Input 
                        value={userData.education['10th'].school}
                        onChange={(e) => handleEducationChange('10th', 'school', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Board</label>
                      <Input 
                        value={userData.education['10th'].board}
                        onChange={(e) => handleEducationChange('10th', 'board', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Percentage</label>
                      <Input 
                        value={userData.education['10th'].percentage}
                        onChange={(e) => handleEducationChange('10th', 'percentage', e.target.value)}
                        type="number"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Passout Year</label>
                      <Input 
                        value={userData.education['10th'].passout_year}
                        onChange={(e) => handleEducationChange('10th', 'passout_year', e.target.value)}
                        type="number"
                      />
                    </div>
                  </div>
                </div>

                {/* 12th Grade */}
                <div className="space-y-2">
                  <h3 className="font-medium">12th Grade</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">School</label>
                      <Input 
                        value={userData.education['12th'].school}
                        onChange={(e) => handleEducationChange('12th', 'school', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Board</label>
                      <Input 
                        value={userData.education['12th'].board}
                        onChange={(e) => handleEducationChange('12th', 'board', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Percentage</label>
                      <Input 
                        value={userData.education['12th'].percentage}
                        onChange={(e) => handleEducationChange('12th', 'percentage', e.target.value)}
                        type="number"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Passout Year</label>
                      <Input 
                        value={userData.education['12th'].passout_year}
                        onChange={(e) => handleEducationChange('12th', 'passout_year', e.target.value)}
                        type="number"
                      />
                    </div>
                  </div>
                </div>

                {/* Graduation */}
                <div className="space-y-2">
                  <h3 className="font-medium">Graduation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">College</label>
                      <Input 
                        value={userData.education.graduation.college}
                        onChange={(e) => handleEducationChange('graduation', 'college', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Branch</label>
                      <Input 
                        value={userData.education.graduation.branch}
                        onChange={(e) => handleEducationChange('graduation', 'branch', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Percentage</label>
                      <Input 
                        value={userData.education.graduation.percentage}
                        onChange={(e) => handleEducationChange('graduation', 'percentage', e.target.value)}
                        type="number"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Passout Year</label>
                      <Input 
                        value={userData.education.graduation.passout_year}
                        onChange={(e) => handleEducationChange('graduation', 'passout_year', e.target.value)}
                        type="number"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Navigation (Fixed at bottom) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="flex justify-around p-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => scrollToSection(skillsRef)}
            className="flex-col h-auto"
          >
            <Briefcase className="h-4 w-4 mb-1" />
            <span className="text-xs">Skills</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => scrollToSection(projectsRef)}
            className="flex-col h-auto"
          >
            <FileText className="h-4 w-4 mb-1" />
            <span className="text-xs">Projects</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => scrollToSection(experiencesRef)}
            className="flex-col h-auto"
          >
            <Award className="h-4 w-4 mb-1" />
            <span className="text-xs">Experience</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => scrollToSection(educationRef)}
            className="flex-col h-auto"
          >
            <GraduationCap className="h-4 w-4 mb-1" />
            <span className="text-xs">Education</span>
          </Button>
        </div>
      </div>
    </div>
  );
};