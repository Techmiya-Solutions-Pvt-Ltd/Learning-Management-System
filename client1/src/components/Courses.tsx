import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Award, Play } from 'lucide-react';
import { Button } from '@/components/ui/button'; 
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { getCourses } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';

interface Course {
  _id: string;
  title: string;
  description: string;
  teacher_name?: string;
  created_at: string;
  updated_at: string;
  chapters?: any[];
  tags?: string[];
  progress?: number;
  total_chapters?: number;
  completed_lessons?: number;
  estimated_hours?: number;
  image?: string;
}

export const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses();
        const formattedCourses = data.map((course: Course) => ({
          ...course,
          image: course.image || `https://placehold.co/400x200?text=${encodeURIComponent(course.title)}`,
          tags: course.tags || ['General'],
          instructor: course.teacher_name || 'Instructor',
          progress: course.progress || 0,
          total_chapters: course.total_chapters || 0,
          completed_lessons: course.completed_lessons || 0,
          estimated_hours: course.estimated_hours || 10
        }));
        setCourses(formattedCourses);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="page-container p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full rounded-t-lg" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Available Courses</h1>
        <p className="text-muted-foreground mt-1">Browse all our courses</p>
      </header>
      
      {courses.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <BookOpen className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-800 dark:text-gray-200">No courses found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            There are no courses available at the moment
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card 
              key={course._id} 
              className="overflow-hidden hover:shadow-lg transition-shadow relative"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="flex gap-2">
                    {course.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Instructor:</span>
                  <span>{course.teacher_name || 'Instructor'}</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Progress: {course.progress}%</span>
                    <span>{course.completed_lessons}/{course.total_chapters} chapters</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-2 pt-4">
                <Button 
                  className="w-full" 
                  onClick={() => navigate(`/studentcourse/${course._id}`)}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {course.progress === 0 ? 'Start Learning' : 'Continue Learning'}
                </Button>
                
                <div className="flex justify-between w-full text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <BookOpen size={16} className="mr-1" />
                    <span>{course.total_chapters} Chapters</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    <span>{course.estimated_hours} Hours</span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};