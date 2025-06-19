import React, { useEffect, useState, useCallback } from 'react';
import { FileText, Clock, Calendar as CalendarIcon, PlusCircle, Search, MoreVertical, Trash2, Power, Filter, X } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { format, parseISO } from 'date-fns';
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
import { tests, updateTestStatus, deleteTest } from '@/services/api';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from 'react-day-picker';
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";

interface Assessment {
  teacher_name: string;
  id: string;
  title: string;
  course: string;
  date: string;
  time: string;
  duration: number;
  status: 'upcoming' | 'draft' | 'archived';
  is_active: boolean;
  is_assigned?: boolean;
}

export const Tests: React.FC = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [instructorFilter, setInstructorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'draft' | 'archived'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [durationFilter, setDurationFilter] = useState<[number]>([60]);
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>();

  const formatDate = useCallback((dateString: string | Date): string => {
    if (!dateString) return 'Unknown Date';
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      return format(date, 'dd/MMM/yyyy')
        .replace(/(\d+)\/([a-z]{3})\/(\d+)/i, (_, day, month, year) => 
          `${day}/${month.charAt(0).toUpperCase() + month.slice(1).toLowerCase()}/${year}`
        );
    } catch {
      return 'Unknown Date';
    }
  }, []);

  const fetchAssessments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dynamicData = await tests();
      
      const transformedData: Assessment[] = dynamicData.map(test => {
        const timestamp = test.timestamp ? new Date(test.timestamp) : new Date();
        
        return {
          id: test._id,
          title: test.assessment_name,
          teacher_name: test.teacher_name,
          course: test.course || 'General',
          date: formatDate(test.date || timestamp),
          time: timestamp.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }),
          duration: test.time_allotment || 60,
          status: test.status || 'upcoming',
          is_active: test.is_active !== undefined ? test.is_active : true,
          is_assigned: test.is_assigned || false
        };
      });
      
      setAssessments(transformedData);
    } catch (err) {
      console.error('Error fetching assessments:', err);
      setError('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  }, [formatDate]);

  const handleToggleActive = async (testId: string, currentStatus: boolean) => {
    try {
      await updateTestStatus(testId, { is_active: !currentStatus });
      setAssessments(assessments.map(test => 
        test.id === testId ? { ...test, is_active: !currentStatus } : test
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update test status');
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;
    
    try {
      await deleteTest(testId);
      setAssessments(assessments.filter(test => test.id !== testId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete test');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setInstructorFilter('');
    setStatusFilter('all');
    setActiveFilter('all');
    setDurationFilter([60]);
    setDateFilter(undefined);
  };

  const filteredAssessments = assessments.filter(test => {
    // Search term filter
    if (
      searchTerm &&
      ![
        test.title,
        test.teacher_name,
        test.duration,
        test.date,
        test.course
      ]
        .filter(Boolean) // Removes undefined/null values
        .some(field =>
          field.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    ) {
      return false;
    }
    
    // Instructor filter
    if (instructorFilter && instructorFilter !== "all" && 
        !test.teacher_name.toLowerCase().includes(instructorFilter.toLowerCase())) {
      return false;
    }
    
    // Status filter
    if (statusFilter !== 'all' && test.status !== statusFilter) {
      return false;
    }
    
    // Active status filter
    if (activeFilter === 'active' && !test.is_active) {
      return false;
    }
    if (activeFilter === 'inactive' && test.is_active) {
      return false;
    }
    
    // Duration filter
    if (test.duration > durationFilter[0]) {
      return false;
    }
    
    // Date filter
    if (dateFilter?.from || dateFilter?.to) {
      const testDate = new Date(test.date);
      if (dateFilter.from && testDate < dateFilter.from) {
        return false;
      }
      if (dateFilter.to && testDate > new Date(dateFilter.to.setHours(23, 59, 59, 999))) {
        return false;
      }
    }
    
    return true;
  });

  // Get unique instructors for dropdown
  const uniqueInstructors = Array.from(new Set(assessments.map(test => test.teacher_name)));

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  return (
    <div className="page-container p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Tests</h1>
        <p className="text-muted-foreground mt-1">Manage your assessments</p>
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
        
        <Button onClick={() => navigate('/create-assessment')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Test
        </Button>
      </div>

      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border dark:border-gray-800">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <Input
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
            <label className="block text-sm font-medium mb-1">Active Status</label>
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
              Max Duration: {durationFilter[0]} minutes
            </label>
            <Slider
              defaultValue={[60]}
              max={180}
              min={2}
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
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-destructive">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssessments.length > 0 ? (
            filteredAssessments.map((test) => (
              <Card key={test.id} className="glass-card card-hover relative">
                <div className="absolute top-2 right-2 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full bg-black/80 hover:bg-black text-white">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => handleToggleActive(test.id, test.is_active)}
                        className="flex items-center gap-2"
                      >
                        <Power className="h-4 w-4" />
                        {test.is_active ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteTest(test.id)}
                        className="flex items-center gap-2 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {!test.is_active && (
                  <Badge variant="destructive" className="absolute top-2 left-2 z-10">
                    Inactive
                  </Badge>
                )}
                
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{test.title}</CardTitle>
                  </div>
                  <CardDescription>{test.course}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center">
                      <CalendarIcon size={16} className="mr-2" />
                      <span>{test.date}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-2" />
                      <span>{test.time}</span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Duration:</span> {test.duration} minutes
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Assigned by:</span> {test.teacher_name} 
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => {
                      localStorage.setItem('currentTest', JSON.stringify(test));
                      navigate('/test/view');
                    }}
                  >
                    View Test
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No tests found
            </div>
          )}
        </div>
      )}
    </div>
  );
};