import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, CalendarDays, PenSquare, PlusCircle } from 'lucide-react';
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
import { getBlogs } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';

interface Blog {
  _id: string;
  title: string;
  description: string;
  author_id?: string;
  author_name?: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  featured_image?: string;
  category?: string;
  is_published?: boolean;
  read_time?: number;
}

export const Blogs: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await getBlogs();
        const formattedBlogs = data.map((blog: Blog) => ({
          ...blog,
          featured_image: blog.featured_image || `https://placehold.co/400x200?text=${encodeURIComponent(blog.title)}`,
          tags: blog.tags || ['General'],
          author_name: blog.author_name || 'Author',
          read_time: blog.read_time || 5,
          created_at: new Date(blog.created_at).toLocaleDateString(),
        }));
        setBlogs(formattedBlogs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blogs');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
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
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Articles</h1>
          <p className="text-muted-foreground mt-1">Read our latest articles and insights</p>
        </div>
        <Button onClick={() => navigate('/create_blog')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Blog
        </Button>
      </header>
      
      {blogs.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <BookOpen className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-800 dark:text-gray-200">No blogs found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            There are no blog articles available at the moment
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Card 
              key={blog._id} 
              className="overflow-hidden hover:shadow-lg transition-shadow relative"
              onClick={() => navigate(`/blogs/${blog._id}`)}
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img 
                  src={blog.featured_image || blog.title} 
                  alt={blog.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="flex gap-2">
                    {blog.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1">{blog.title}</CardTitle>
                <CardDescription className="line-clamp-2">{blog.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Author:</span>
                  <span>{blog.author_name}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <CalendarDays className="mr-1 h-4 w-4" />
                    <span>{blog.created_at}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>{blog.read_time} min read</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => navigate(`/blogs/${blog._id}`)}
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
  );
};