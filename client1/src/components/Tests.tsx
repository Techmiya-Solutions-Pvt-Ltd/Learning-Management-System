import React, { useEffect, useState, useCallback } from 'react';
import { FileText, Clock, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tests, getCompletedTests } from '@/services/api';

interface Assessment {
  id: string;
  title: string;
  course: string;
  date: string;
  time: string;
  duration: number;
  status: 'upcoming' | 'completed' | 'draft';
  is_assigned?: boolean;
}

interface CompletedAssessment {
  id: string;
  title: string;
  course: string;
  date: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  status: 'passed' | 'failed';
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'passed':
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
          <CheckCircle size={14} className="mr-1" /> Passed
        </Badge>
      );
    case 'failed':
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">
          <XCircle size={14} className="mr-1" /> Failed
        </Badge>
      );
    case 'upcoming':
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">
          <AlertCircle size={14} className="mr-1" /> Upcoming
        </Badge>
      );
    default:
      return null;
  }
};

export const Tests: React.FC = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [completedAssessments, setCompletedAssessments] = useState<CompletedAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedLoading, setCompletedLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    
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
      
      const userData = JSON.parse(localStorage.getItem('user'));
      const studentId = userData?.id;
      const dynamicData = await tests(studentId);
      
      const transformedData: Assessment[] = dynamicData.map(test => {
        const timestamp = test.timestamp ? new Date(test.timestamp) : new Date();
        
        return {
          id: test._id,
          title: test.assessment_name,
          course: test.course || 'General',
          date: formatDate(test.date || timestamp),
          time: timestamp.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }),
          duration: test.time_allotment || 60,
          status: 'upcoming',
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

  const fetchCompletedAssessments = useCallback(async () => {
    try {
      setCompletedLoading(true);
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData?.id) return;

      const apiData = await getCompletedTests(userData.id);
      
      const transformedData: CompletedAssessment[] = apiData.map(test => ({
        id: test._id || test.test_id,
        title: test.assessment_name || 'Completed Test',
        course: test.course || 'General',
        date: test.submitted_at || test.date,
        score: test.score?.percentage || 0,
        totalQuestions: test.score?.total || 0,
        correctAnswers: test.score?.correct || 0,
        status: (test.score?.percentage || 0) >= 70 ? 'passed' : 'failed'
      }));

      setCompletedAssessments(transformedData);
    } catch (error) {
      console.error('Error fetching completed tests:', error);
    } finally {
      setCompletedLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssessments();
    fetchCompletedAssessments();
  }, [fetchAssessments, fetchCompletedAssessments]);

  return (
    <div className="page-container">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Tests</h1>
        <p className="text-muted-foreground mt-1">Manage your upcoming and completed tests</p>
      </header>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Upcoming Tests</TabsTrigger>
          <TabsTrigger value="completed">Completed Tests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="animate-slide-in">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assessments.length > 0 ? (
                assessments.map((test) => (
                  <Card key={test.id} className="glass-card card-hover">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{test.title}</CardTitle>
                        <StatusBadge status={test.status} />
                      </div>
                      <CardDescription>{test.course}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-2" />
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
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={() => {
                          localStorage.setItem('currentTest', JSON.stringify(test));
                          navigate('/test');
                        }}
                      >
                        Start Test
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No upcoming tests found
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="animate-slide-in">
          {completedLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedAssessments.length > 0 ? (
                completedAssessments.map((test) => (
                  <Card key={test.id} className="glass-card card-hover">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{test.title}</CardTitle>
                        <StatusBadge status={test.status} />
                      </div>
                      <CardDescription>{test.course}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm">
                        <span className="font-medium">Date:</span> {formatDate(test.date)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Score: {test.score}%</span>
                          <span className="text-sm text-muted-foreground">
                            {test.correctAnswers}/{test.totalQuestions} correct
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="h-2.5 rounded-full" 
                            style={{ 
                              width: `${test.score}%`,
                              backgroundColor: test.status === 'failed' ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate(`/test/results/${test.id}`)}
                      >
                        Review Test
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No completed tests found
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};