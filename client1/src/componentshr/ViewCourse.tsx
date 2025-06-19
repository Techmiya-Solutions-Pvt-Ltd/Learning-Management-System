import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, ChevronDown, ChevronUp, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { getCourseById } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';

interface Content {
  id: string;
  type: string;
  order: number;
  content: any;
}

interface Chapter {
  id: string;
  title: string;
  order: number;
  contents: Content[];
}

export const ViewCourse: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        console.log(courseId);
        const data = await getCourseById(courseId);
        console.log(data);
        setCourse(data);
        
        // Initialize expanded chapters state
        const expanded: Record<string, boolean> = {};
        // Use data.chapters directly instead of parsing JSON
        data.chapters.forEach((chapter: Chapter) => {
          expanded[chapter.id] = false;
        });
        setExpandedChapters(expanded);
      } catch (err) {
        setError(err.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };
  const getDrivePreviewUrl = (url: string) => {
    return url.replace('export=download', 'export=view');
  };
  if (loading) {
    return (
      <div className="page-container p-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-6 w-96 mb-8" />
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="mb-6">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
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

  if (!course) {
    return <div className="page-container p-6">Course not found</div>;
  }
  const getEmbedUrl = (url: string): string => {
    try {
      // Pick only the first valid URL (in case of multiple)
      const parts = url.split(' ').filter(part => part.includes('youtube.com'));
      const rawUrl = parts[0];
  
      const urlObj = new URL(rawUrl);
      const videoId = urlObj.searchParams.get("v") || urlObj.pathname.split("/").pop();
      const time = urlObj.searchParams.get("t");
  
      const seconds = time?.endsWith('s') ? time.slice(0, -1) : time;
  
      return `https://www.youtube.com/embed/${videoId}${seconds ? `?start=${seconds}` : ''}`;
    } catch (e) {
      return '';
    }
  };
  
  
//   const courseData = JSON.parse(course.course_data_json);
  const chapters = course.chapters || [];

  return (
    <div className="page-container p-6">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
          <p className="text-muted-foreground mt-1">{course.description}</p>
        </div>
        
        <Button onClick={() => navigate(`/courses/${courseId}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Course
        </Button>
      </header>
      <Button
  className="mr-1 mb-3"
  onClick={() => navigate('/admin')}
>
  Back to Courses
</Button>



      <div className="space-y-6">
      {chapters
          .sort((a: Chapter, b: Chapter) => a.order - b.order)
          .map((chapter: Chapter) => (
            <Card key={chapter.id} className="overflow-hidden">
              <CardHeader 
                className="cursor-pointer flex flex-row items-center justify-between pb-2" 
                onClick={() => toggleChapter(chapter.id)}
              >
                <div className="flex items-center space-x-4">
                  <CardTitle>{chapter.title}</CardTitle>
                </div>
                {expandedChapters[chapter.id] ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </CardHeader>
              
              {expandedChapters[chapter.id] && (
                <CardContent className="space-y-4">
                  {chapter.contents
                    .sort((a: Content, b: Content) => a.order - b.order)
                    .map((content: Content) => (
                      <div key={content.id} className="border rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <Badge variant="secondary" className="mr-2">
                            {content.type}
                          </Badge>
                        </div>
                        
                        <div className="mt-2">
                          {content.type === 'text' && <p>{content.content}</p>}
                          {content.type === 'link' && (
                            <a href={content.content} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {content.content}
                            </a>
                          )}
                          {content.type === 'youtube' && (
                            <div className="aspect-w-16 aspect-h-9">
                              <iframe
  src={getEmbedUrl(content.content)}
  className="w-full h-64"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
></iframe>

                            </div>
                          )}
                          {content.type === 'code' && (
                            <pre className="bg-gray-100 p-4 rounded overflow-auto">
                              <code className={`language-${content.content.language}`}>
                                {content.content.code}
                              </code>
                            </pre>
                          )}
                          {content.type === 'image' && (
                            
                            <iframe
                                            src={getDrivePreviewUrl(content.content.url || '')}
                                            title={content.content.filename || "Uploaded image"}
                                           className="max-w-full h-auto"
                                            allow="autoplay; fullscreen"
                                          ></iframe>
                          )}
                        </div>
                      </div>
                    ))}
                </CardContent>
              )}
            </Card>
          ))}
      </div>
    </div>
  );
};