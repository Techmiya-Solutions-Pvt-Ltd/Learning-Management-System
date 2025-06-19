import React, { useEffect, useState } from 'react';
import { BookOpen, Clock, Award, Search, Edit, PlusCircle, MoreVertical, Trash2, Power, Filter, X, Calendar as CalendarIcon } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { getCourses, updateCourseStatus, deleteCourse } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

export const Courses: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Filter states
  const [instructorFilter, setInstructorFilter] = useState('');
  const [courseNameFilter, setCourseNameFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [durationFilter, setDurationFilter] = useState<[number]>([10]);
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses();
        const formattedCourses = data.map((course) => ({
          ...course,
          image: course.image || `https://placehold.co/400x200?text=${encodeURIComponent(course.title)}`,
          tags: course.tags || ['General'],
          instructor: course.teacher_name || 'Instructor',
          progress: course.progress || 0,
          total_chapters: course.total_chapters || 0,
          estimated_hours: course.estimated_hours || 10,
          is_active: course.is_active !== undefined ? course.is_active : true,
          created_at: course.created_at || new Date().toISOString()
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

  const handleToggleActive = async (courseId: string, currentStatus: boolean) => {
    try {
      await updateCourseStatus(courseId, { is_active: !currentStatus });
      setCourses(courses.map(course => 
        course._id === courseId ? { ...course, is_active: !currentStatus } : course
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update course status');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    
    try {
      await deleteCourse(courseId);
      setCourses(courses.filter(course => course._id !== courseId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete course');
    }
  };

  const resetFilters = () => {
    setInstructorFilter('');
    setCourseNameFilter('');
    setActiveFilter('all');
    setDurationFilter([50]);
    setDateFilter(undefined);
  };

  const filteredCourses = courses.filter(course => {
    // Instructor filter
    if (instructorFilter && instructorFilter !== "all" && 
        !course.instructor.toLowerCase().includes(instructorFilter.toLowerCase())) {
      return false;
    }
    
    // Course name filter
    if (courseNameFilter && !course.title.toLowerCase().includes(courseNameFilter.toLowerCase())) {
      return false;
    }
    
    // Active status filter
    if (activeFilter === 'active' && !course.is_active) {
      return false;
    }
    if (activeFilter === 'inactive' && course.is_active) {
      return false;
    }
    
    // Duration filter
    if (course.estimated_hours > durationFilter[0]) {
      return false;
    }
    
    // Date filter
    if (dateFilter?.from || dateFilter?.to) {
      const courseDate = new Date(course.created_at);
      if (dateFilter.from && courseDate < dateFilter.from) {
        return false;
      }
      if (dateFilter.to && courseDate > new Date(dateFilter.to.setHours(23, 59, 59, 999))) {
        return false;
      }
    }
    
    return true;
  });

  // Get unique instructors for dropdown
  const uniqueInstructors = Array.from(new Set(courses.map(course => course.instructor)));

  if (loading) {
    return (
      <div className="page-container p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-start md:items-center">
          <Skeleton className="h-10 w-full md:w-96" />
          <Skeleton className="h-10 w-32" />
        </div>
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
                <Skeleton className="h-10 w-24" />
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
        <h1 className="text-3xl font-bold tracking-tight">All Courses</h1>
        <p className="text-muted-foreground mt-1">Browse and manage available courses</p>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-start md:items-center">
        <div className="flex items-center gap-4 w-full">
          <Button 
            variant={showFilters ? "default" : "outline"} 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter size={16} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          
          {showFilters && (
            <Button 
              variant="ghost" 
              onClick={resetFilters}
              className="flex items-center gap-2"
            >
              <X size={16} />
              Reset Filters
            </Button>
          )}
        </div>
        
        <Button onClick={() => navigate('/create_course')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Course
        </Button>
      </div>

      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 border dark:border-gray-800">
          <div>
            <label className="block text-sm font-medium mb-1">Course Name</label>
            <Input
              placeholder="Filter by course name"
              value={courseNameFilter}
              onChange={(e) => setCourseNameFilter(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Instructor</label>
            <Select 
              onValueChange={(value) => setInstructorFilter(value === "all" ? "" : value)}
              value={instructorFilter || "all"}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Instructors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Instructors</SelectItem>
                {uniqueInstructors.map(instructor => (
                  <SelectItem key={instructor} value={instructor}>
                    {instructor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select 
              onValueChange={(value: 'all' | 'active' | 'inactive') => setActiveFilter(value)}
              value={activeFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-4">
              Max Duration: {durationFilter[0]} hours
            </label>
            <Slider
              defaultValue={[10]}
              max={30}
              min={1}
              step={1}
              value={durationFilter}
              onValueChange={setDurationFilter}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter?.from ? (
                    dateFilter.to ? (
                      <>
                        {format(dateFilter.from, 'MMM dd, y')} -{' '}
                        {format(dateFilter.to, 'MMM dd, y')}
                      </>
                    ) : (
                      format(dateFilter.from, 'MMM dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateFilter?.from}
                  selected={dateFilter}
                  onSelect={setDateFilter}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
      
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-800 dark:text-gray-200">No courses found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {showFilters ? 'Try adjusting your filters' : 'No courses available yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course._id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
              {/* Status badge */}
              {!course.is_active && (
                <Badge variant="destructive" className="absolute top-2 left-2 z-10">
                  Inactive
                </Badge>
              )}
              
              {/* Three-dot menu button */}
              <div className="absolute top-2 right-2 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full bg-black/80 hover:bg-black text-white">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => handleToggleActive(course._id, course.is_active)}
                      className="flex items-center gap-2"
                    >
                      <Power className="h-4 w-4" />
                      {course.is_active ? 'Deactivate' : 'Activate'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteCourse(course._id)}
                      className="flex items-center gap-2 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Course image */}
              <div className="relative h-48 w-full overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="flex gap-2">
                    {course.tags?.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <CardHeader className="pb-3 pt-3">
                <CardTitle>{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Instructor:</span>
                  <span>{course.instructor}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Chapters:</span>
                  <span>{course.total_chapters}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Duration:</span>
                  <span>{course.estimated_hours} hours</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="font-medium">Created:</span>
                  <span>{format(new Date(course.created_at), 'MMM dd, yyyy')}</span>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/courses/${course._id}`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  View/Edit
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};