
import React from 'react';
import { Users, Book, Video, FileCheck, Clock, BookOpen, CheckCircle2 } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for interview preparation
const interviewModules = [
  {
    id: 1,
    title: 'Technical Interview Basics',
    description: 'Learn the fundamentals of technical interviews',
    progress: 100,
    totalLessons: 8,
    completedLessons: 8,
    duration: '3 hours',
    image: 'https://placehold.co/400x200?text=Technical+Basics',
    level: 'Beginner'
  },
  {
    id: 2,
    title: 'Data Structures Deep Dive',
    description: 'Master common data structures used in coding interviews',
    progress: 65,
    totalLessons: 12,
    completedLessons: 8,
    duration: '5 hours',
    image: 'https://placehold.co/400x200?text=Data+Structures',
    level: 'Intermediate'
  },
  {
    id: 3,
    title: 'Algorithm Problem Solving',
    description: 'Practice solving algorithmic problems with optimal solutions',
    progress: 40,
    totalLessons: 15,
    completedLessons: 6,
    duration: '6 hours',
    image: 'https://placehold.co/400x200?text=Algorithms',
    level: 'Advanced'
  },
  {
    id: 4,
    title: 'System Design Principles',
    description: 'Learn how to design scalable and efficient systems',
    progress: 20,
    totalLessons: 10,
    completedLessons: 2,
    duration: '4 hours',
    image: 'https://placehold.co/400x200?text=System+Design',
    level: 'Advanced'
  }
];

const practiceInterviews = [
  {
    id: 1,
    title: 'Frontend Developer Mock Interview',
    description: 'Practice a realistic frontend developer interview with focus on React',
    duration: '45 minutes',
    difficulty: 'Intermediate',
    topics: ['React', 'JavaScript', 'CSS', 'Web Performance'],
    image: 'https://placehold.co/400x200?text=Frontend'
  },
  {
    id: 2,
    title: 'Backend Developer Mock Interview',
    description: 'Practice a realistic backend developer interview focusing on system design',
    duration: '60 minutes',
    difficulty: 'Advanced',
    topics: ['APIs', 'Databases', 'Scaling', 'Security'],
    image: 'https://placehold.co/400x200?text=Backend'
  },
  {
    id: 3,
    title: 'Data Scientist Mock Interview',
    description: 'Practice a realistic data science interview with statistical questions',
    duration: '50 minutes',
    difficulty: 'Intermediate',
    topics: ['Statistics', 'Machine Learning', 'Data Analysis', 'Python'],
    image: 'https://placehold.co/400x200?text=Data+Science'
  }
];

const resources = [
  {
    id: 1,
    title: 'Technical Interview Handbook',
    type: 'E-Book',
    author: 'Jane Smith',
    pages: 250,
    icon: Book
  },
  {
    id: 2,
    title: 'Mastering the Coding Interview',
    type: 'Video Course',
    author: 'Tech Academy',
    duration: '8 hours',
    icon: Video
  },
  {
    id: 3,
    title: 'Common Interview Questions',
    type: 'Guide',
    author: 'Career Experts',
    pages: 120,
    icon: FileCheck
  },
  {
    id: 4,
    title: 'Behavioral Interview Techniques',
    type: 'Workshop',
    author: 'HR Professionals',
    duration: '2 hours',
    icon: Users
  }
];

export const Interview: React.FC = () => {
  return (
    <div className="page-container">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Interview Preparation</h1>
        <p className="text-muted-foreground mt-1">Prepare for technical interviews with structured learning paths</p>
      </header>
      
      <Tabs defaultValue="modules" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="modules">Learning Modules</TabsTrigger>
          <TabsTrigger value="practice">Mock Interviews</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="modules" className="animate-slide-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {interviewModules.map((module) => (
              <Card key={module.id} className="glass-card card-hover">
                <div className="relative h-48 w-full overflow-hidden">
                  <img 
                    src={module.image} 
                    alt={module.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 text-foreground hover:bg-white">
                      {module.level}
                    </Badge>
                  </div>
                  {module.progress === 100 && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle2 size={14} className="mr-1" /> Completed
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle>{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <BookOpen size={16} className="mr-1 text-muted-foreground" />
                      <span>{module.completedLessons}/{module.totalLessons} lessons</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1 text-muted-foreground" />
                      <span>{module.duration}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Progress</span>
                      <span>{module.progress}%</span>
                    </div>
                    <Progress value={module.progress} className="h-2" />
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button className="w-full" disabled={module.progress === 100}>
                    {module.progress === 0 ? 'Start' : module.progress === 100 ? 'Completed' : 'Continue'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="practice" className="animate-slide-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {practiceInterviews.map((interview) => (
              <Card key={interview.id} className="glass-card card-hover">
                <div className="relative h-40 w-full overflow-hidden">
                  <img 
                    src={interview.image} 
                    alt={interview.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 text-foreground hover:bg-white">
                      {interview.difficulty}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{interview.title}</CardTitle>
                  <CardDescription>{interview.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm">
                    <Clock size={16} className="mr-1 text-muted-foreground" />
                    <span>{interview.duration}</span>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Topics covered:</p>
                    <div className="flex flex-wrap gap-2">
                      {interview.topics.map((topic) => (
                        <Badge key={topic} variant="outline" className="bg-secondary/50">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button className="w-full">Start Mock Interview</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="resources" className="animate-slide-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource) => (
              <Card key={resource.id} className="glass-card card-hover">
                <CardHeader className="text-center pb-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-4">
                    <resource.icon size={24} className="text-primary" />
                  </div>
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                  <CardDescription>{resource.type}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="text-center space-y-1 text-sm">
                    <p><span className="font-medium">Author:</span> {resource.author}</p>
                    <p>
                      <span className="font-medium">
                        {resource.pages ? 'Pages:' : 'Duration:'}
                      </span> {resource.pages || resource.duration}
                    </p>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button variant="outline" className="w-full">Access Resource</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
