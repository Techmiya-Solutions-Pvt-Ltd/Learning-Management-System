import React from 'react';
import { Briefcase, MapPin, Clock, Building, ExternalLink, BookmarkPlus } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for jobs
const jobsData = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: 'TechCorp Solutions',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$90,000 - $120,000',
    postedDate: '2023-11-01',
    description: 'We are looking for a skilled Frontend Developer to join our innovative team. You will be responsible for building user interfaces for web applications.',
    requirements: ['3+ years of React experience', 'Strong JavaScript skills', 'Experience with CSS frameworks', 'Knowledge of responsive design'],
    logo: 'https://placehold.co/100?text=TC'
  },
  {
    id: 2,
    title: 'Backend Engineer',
    company: 'DataFlow Systems',
    location: 'Austin, TX',
    type: 'Full-time',
    salary: '$110,000 - $140,000',
    postedDate: '2023-11-03',
    description: 'Join our backend team to design and implement scalable APIs and services that power our platform.',
    requirements: ['Experience with Node.js or Python', 'Database design knowledge', 'RESTful API development', 'Experience with cloud platforms'],
    logo: 'https://placehold.co/100?text=DF'
  },
  {
    id: 3,
    title: 'Data Scientist',
    company: 'Insight Analytics',
    location: 'Remote',
    type: 'Full-time',
    salary: '$100,000 - $130,000',
    postedDate: '2023-11-05',
    description: 'We are seeking a Data Scientist to analyze large datasets and build machine learning models to solve business problems.',
    requirements: ['Masters or PhD in relevant field', 'Experience with Python, R, and SQL', 'Machine learning expertise', 'Statistical analysis skills'],
    logo: 'https://placehold.co/100?text=IA'
  },
  {
    id: 4,
    title: 'UX/UI Designer',
    company: 'Creative Minds',
    location: 'New York, NY',
    type: 'Contract',
    salary: '$80,000 - $100,000',
    postedDate: '2023-11-07',
    description: 'Join our design team to create beautiful and intuitive user experiences for our products.',
    requirements: ['Portfolio demonstrating UX/UI skills', 'Proficiency with design tools', 'Understanding of user-centered design', 'Experience with design systems'],
    logo: 'https://placehold.co/100?text=CM'
  },
  {
    id: 5,
    title: 'Full Stack Developer',
    company: 'Nexus Technologies',
    location: 'Chicago, IL',
    type: 'Full-time',
    salary: '$95,000 - $125,000',
    postedDate: '2023-11-10',
    description: 'We need a versatile Full Stack Developer who can work on both frontend and backend aspects of our applications.',
    requirements: ['Experience with React and Node.js', 'Database management skills', 'API development experience', 'Understanding of DevOps principles'],
    logo: 'https://placehold.co/100?text=NT'
  }
];

// Calculate days since posting
const calculateDaysAgo = (postedDate: string) => {
  const today = new Date();
  const posted = new Date(postedDate);
  const diffTime = today.getTime() - posted.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
};

export const Jobs: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Filter jobs based on search query
  const filteredJobs = jobsData.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="page-container">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Job Board</h1>
        <p className="text-muted-foreground mt-1">Discover job opportunities tailored to your skills</p>
      </header>
      
      <div className="mb-8">
        <div className="max-w-lg mx-auto mb-6">
          <Input
            placeholder="Search jobs by title, company, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
       <h2>Visit - <a href="https://lms-job.onrender.com">Click here</a> </h2> 
      </div>
    </div>
  );
};
