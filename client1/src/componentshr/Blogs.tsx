import React, { useEffect, useState } from 'react';
import { BookOpen, Clock, Calendar as CalendarIcon, Search, Edit, PlusCircle, MoreVertical, Trash2, Power, Filter, X } from 'lucide-react';
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
import { getBlogs, updateBlogStatus, deleteBlog } from '@/services/api';
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

export const Blogs: React.FC = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Filter states
  const [authorFilter, setAuthorFilter] = useState('');
  const [blogTitleFilter, setBlogTitleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [readTimeFilter, setReadTimeFilter] = useState<[number]>([10]);
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await getBlogs();
        const formattedBlogs = data.map((blog) => ({
          ...blog,
          image: blog.image || `https://placehold.co/400x200?text=${encodeURIComponent(blog.title)}`,
          tags: blog.tags || ['General'],
          author: blog.teacher_name
          || 'Author',
          sections: blog.sections || 0,
          read_time: blog.read_time || 10,
          is_active: blog.is_active !== undefined ? blog.is_active : true,
          created_at: blog.created_at || new Date().toISOString()
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

  const handleToggleActive = async (blogId: string, currentStatus: boolean) => {
    try {
      await updateBlogStatus(blogId, { is_active: !currentStatus });
      setBlogs(blogs.map(blog => 
        blog._id === blogId ? { ...blog, is_active: !currentStatus } : blog
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update blog status');
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    
    try {
      await deleteBlog(blogId);
      setBlogs(blogs.filter(blog => blog._id !== blogId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete blog');
    }
  };

  const resetFilters = () => {
    setAuthorFilter('');
    setBlogTitleFilter('');
    setStatusFilter('all');
    setReadTimeFilter([30]);
    setDateFilter(undefined);
  };

  const filteredBlogs = blogs.filter(blog => {
    // Author filter
    if (authorFilter && authorFilter !== "all" && 
        !blog.author.toLowerCase().includes(authorFilter.toLowerCase())) {
      return false;
    }
    
    // Blog title filter
    if (blogTitleFilter && !blog.title.toLowerCase().includes(blogTitleFilter.toLowerCase())) {
      return false;
    }
    
    // Status filter
    if (statusFilter === 'active' && !blog.is_active) {
      return false;
    }
    if (statusFilter === 'inactive' && blog.is_active) {
      return false;
    }
    
    // Read time filter
    if (blog.read_time > readTimeFilter[0]) {
      return false;
    }
    
    // Date filter
    if (dateFilter?.from || dateFilter?.to) {
      const blogDate = new Date(blog.created_at);
      if (dateFilter.from && blogDate < dateFilter.from) {
        return false;
      }
      if (dateFilter.to && blogDate > new Date(dateFilter.to.setHours(23, 59, 59, 999))) {
        return false;
      }
    }
    
    return true;
  });

  // Get unique authors for dropdown
  const uniqueAuthors = Array.from(new Set(blogs.map(blog => blog.author)));

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
        <h1 className="text-3xl font-bold tracking-tight">All Blogs</h1>
        <p className="text-muted-foreground mt-1">Browse and manage available blogs</p>
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
        
        <Button onClick={() => navigate('/create_blog')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Blog
        </Button>
      </div>

      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 border dark:border-gray-800">
          <div>
            <label className="block text-sm font-medium mb-1">Blog Title</label>
            <Input
              placeholder="Filter by blog title"
              value={blogTitleFilter}
              onChange={(e) => setBlogTitleFilter(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Author</label>
            <Select 
              onValueChange={(value) => setAuthorFilter(value === "all" ? "" : value)}
              value={authorFilter || "all"}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Authors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Authors</SelectItem>
                {uniqueAuthors.map(author => (
                  <SelectItem key={author} value={author}>
                    {author}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select 
              onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}
              value={statusFilter}
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
            <label className="block text-sm font-medium mb-5">
              Max Read Time: {readTimeFilter[0]} mins
            </label>
            <Slider
              defaultValue={[10]}
              max={50}
              min={1}
              step={1}
              value={readTimeFilter}
              onValueChange={setReadTimeFilter}
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
      
      {filteredBlogs.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-800 dark:text-gray-200">No blogs found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {showFilters ? 'Try adjusting your filters' : 'No blogs available yet'}
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate('/create_blog')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Blog
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <Card key={blog._id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
              {/* Status badge */}
              {!blog.is_active && (
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
                      onClick={() => handleToggleActive(blog._id, blog.is_active)}
                      className="flex items-center gap-2"
                    >
                      <Power className="h-4 w-4" />
                      {blog.is_active ? 'Deactivate' : 'Activate'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteBlog(blog._id)}
                      className="flex items-center gap-2 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Blog image */}
              <div className="relative h-48 w-full overflow-hidden">
                <img 
                  src={blog.image} 
                  alt={blog.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="flex gap-2">
                    {blog.tags?.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle>{blog.title}</CardTitle>
                <CardDescription className="line-clamp-2">{blog.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Author:</span>
                  <span>{blog.author}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Sections:</span>
                  <span>{blog.sections}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Read Time:</span>
                  <span>{blog.read_time} minutes</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="font-medium">Created:</span>
                  <span>{format(new Date(blog.created_at), 'MMM dd, yyyy')}</span>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/blogs/${blog._id}`)}
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