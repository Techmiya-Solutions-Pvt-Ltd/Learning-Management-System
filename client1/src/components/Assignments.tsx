
import React from 'react';
import { ClipboardCheck, Calendar, Clock, AlertTriangle } from 'lucide-react';
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

// Mock data for assignments
const pendingAssignments = [
  {
    id: 1,
    title: 'Build a Responsive Web App',
    course: 'Advanced Web Development',
    dueDate: '2023-11-20',
    assignedOn: '2023-11-05',
    status: 'pending',
    description: 'Create a fully responsive web application using React and Tailwind CSS.'
  },
  {
    id: 2,
    title: 'Implement Quick Sort Algorithm',
    course: 'Data Structures & Algorithms',
    dueDate: '2023-11-18',
    assignedOn: '2023-11-08',
    status: 'pending',
    description: 'Implement the quick sort algorithm and analyze its time complexity.'
  },
  {
    id: 3,
    title: 'Database Normalization Exercise',
    course: 'Database Design & Management',
    dueDate: '2023-11-15',
    assignedOn: '2023-11-01',
    status: 'pending',
    description: 'Normalize a given database schema to 3NF and provide justification.'
  },
];

const submittedAssignments = [
  {
    id: 4,
    title: 'CSS Animation Project',
    course: 'Advanced Web Development',
    dueDate: '2023-10-25',
    submittedOn: '2023-10-24',
    grade: 'A',
    feedback: 'Excellent work! Your animations are smooth and creative.',
    status: 'graded'
  },
  {
    id: 5,
    title: 'Binary Search Tree Implementation',
    course: 'Data Structures & Algorithms',
    dueDate: '2023-10-20',
    submittedOn: '2023-10-19',
    grade: 'B+',
    feedback: 'Good implementation, but could improve the balancing algorithm.',
    status: 'graded'
  },
  {
    id: 6,
    title: 'Machine Learning Model Training',
    course: 'Machine Learning Fundamentals',
    dueDate: '2023-10-15',
    submittedOn: '2023-10-15',
    status: 'submitted'
  },
];

// Calculate days remaining
const calculateDaysRemaining = (dueDate: string) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Assignment status badge
const AssignmentStatusBadge: React.FC<{ status: string, daysRemaining?: number }> = ({ status, daysRemaining }) => {
  switch (status) {
    case 'pending':
      return daysRemaining && daysRemaining <= 3 ? (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">
          <AlertTriangle size={14} className="mr-1" /> Due soon: {daysRemaining} days
        </Badge>
      ) : (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">
          Pending
        </Badge>
      );
    case 'submitted':
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200">
          Submitted
        </Badge>
      );
    case 'graded':
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
          <ClipboardCheck size={14} className="mr-1" /> Graded
        </Badge>
      );
    default:
      return null;
  }
};

export const Assignments: React.FC = () => {
  return (
    <div className="page-container">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
        <p className="text-muted-foreground mt-1">Manage your course assignments and submissions</p>
      </header>
      
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="animate-slide-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingAssignments.map((assignment) => {
              const daysRemaining = calculateDaysRemaining(assignment.dueDate);
              return (
                <Card key={assignment.id} className="glass-card card-hover">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{assignment.title}</CardTitle>
                      <AssignmentStatusBadge status={assignment.status} daysRemaining={daysRemaining} />
                    </div>
                    <CardDescription>{assignment.course}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{assignment.description}</p>
                    <div className="flex justify-between text-sm pt-2">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2" />
                        <div>
                          <div className="font-medium">Due Date</div>
                          <div>{new Date(assignment.dueDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Clock size={16} className="mr-2" />
                        <div>
                          <div className="font-medium">Days Left</div>
                          <div>{daysRemaining > 0 ? daysRemaining : 'Due today'}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Submit Assignment</Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="submitted" className="animate-slide-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submittedAssignments.map((assignment) => (
              <Card key={assignment.id} className="glass-card card-hover">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{assignment.title}</CardTitle>
                    <AssignmentStatusBadge status={assignment.status} />
                  </div>
                  <CardDescription>{assignment.course}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">Due Date:</span><br />
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Submitted:</span><br />
                      {new Date(assignment.submittedOn).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {assignment.status === 'graded' && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Grade:</span>
                        <span className="text-xl font-bold">{assignment.grade}</span>
                      </div>
                      <p className="text-sm">{assignment.feedback}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    {assignment.status === 'submitted' ? 'View Submission' : 'View Feedback'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
