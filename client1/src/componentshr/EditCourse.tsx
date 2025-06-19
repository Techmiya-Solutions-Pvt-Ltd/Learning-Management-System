import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, ChevronDown, ChevronUp, Edit, Save, Trash2, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getCourseById, updateCourse } from '@/services/api';

interface Content {
  id: string;
  type: string;
  order: number;
  content: any;
}

interface Chapter {
  id: string;
  title: string;
  template: string;
  order: number;
  contents: Content[];
}

interface CourseData {
  title: string;
  description: string;
  teacher_id: string;
  chapters: Chapter[];
  custom_content_types: any[];
}

export const EditCourse: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        console.log(courseId);
        const data = await getCourseById(courseId);
        setCourse(data);
        console.log(data);
        
        // Parse the course_data_json
        const parsedData = data;
        setCourseData(parsedData);
        console.log(parsedData)
        
        // Initialize expanded chapters state
        const expanded: Record<string, boolean> = {};
        parsedData.chapters.forEach((chapter: Chapter) => {
          expanded[chapter.id] = true; // Auto-expand all chapters in edit mode
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

  const handleSave = async () => {
    try {
      if (!course || !courseData) return;
      
      // Prepare the updated course data
      const updatedCourse = {
        ...course,
        title: courseData.title, // Use title from courseData to keep consistent
        course_data_json: JSON.stringify(courseData),
        updated_at: new Date().toISOString()
      };
      
      await updateCourse(courseId, updatedCourse);
      navigate(`/courses/${courseId}`);
    } catch (err) {
      setError(err.message || 'Failed to save course');
    }
  };

  const updateChapterTitle = (chapterId: string, newTitle: string) => {
    if (!courseData) return;
    
    setCourseData({
      ...courseData,
      chapters: courseData.chapters.map(chapter => 
        chapter.id === chapterId ? { ...chapter, title: newTitle } : chapter
      )
    });
  };

  const updateContent = (chapterId: string, contentId: string, newContent: any) => {
    if (!courseData) return;
    
    setCourseData({
      ...courseData,
      chapters: courseData.chapters.map(chapter => {
        if (chapter.id !== chapterId) return chapter;
        
        return {
          ...chapter,
          contents: chapter.contents.map(content => 
            content.id === contentId ? { ...content, content: newContent } : content
          )
        };
      })
    });
  };

  const moveContent = (chapterId: string, contentId: string, direction: 'up' | 'down') => {
    if (!courseData) return;
    
    setCourseData({
      ...courseData,
      chapters: courseData.chapters.map(chapter => {
        if (chapter.id !== chapterId) return chapter;
        
        const contents = [...chapter.contents];
        const index = contents.findIndex(c => c.id === contentId);
        
        if (index === -1 || 
            (direction === 'up' && index === 0) || 
            (direction === 'down' && index === contents.length - 1)) {
          return chapter;
        }
        
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        [contents[index], contents[newIndex]] = [contents[newIndex], contents[index]];
        
        // Update the order fields
        contents.forEach((content, i) => {
          content.order = i;
        });
        
        return {
          ...chapter,
          contents
        };
      })
    });
  };

  const deleteContent = (chapterId: string, contentId: string) => {
    if (!courseData) return;
    
    setCourseData({
      ...courseData,
      chapters: courseData.chapters.map(chapter => {
        if (chapter.id !== chapterId) return chapter;
        
        return {
          ...chapter,
          contents: chapter.contents.filter(content => content.id !== contentId)
        };
      })
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!course || !courseData) return <div>Course not found</div>;

    function toggleChapter(id: string): void {
        throw new Error('Function not implemented.');
    }

  return (
    <div className="page-container p-6">
      <header className="mb-8 flex justify-between items-start">
        <div className="w-full">
          <Input
            value={courseData.title}
            onChange={(e) => setCourseData({...courseData, title: e.target.value})}
            className="text-3xl font-bold mb-2"
          />
          <Textarea
            value={courseData.description}
            onChange={(e) => setCourseData({...courseData, description: e.target.value})}
            placeholder="Course description"
          />
        </div>
      </header>

      <div className="space-y-6">
        {courseData.chapters
          .sort((a, b) => a.order - b.order)
          .map((chapter) => (
            <Card key={chapter.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <Input
                  value={chapter.title}
                  onChange={(e) => updateChapterTitle(chapter.id, e.target.value)}
                  className="text-xl font-semibold"
                />
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => toggleChapter(chapter.id)}>
                    {expandedChapters[chapter.id] ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              {expandedChapters[chapter.id] && (
                <CardContent className="space-y-4">
                  {chapter.contents
                    .sort((a, b) => a.order - b.order)
                    .map((content) => (
                      <div key={content.id} className="border rounded-lg p-4 relative">
                        <div className="flex items-center mb-2">
                          <Badge variant="secondary" className="mr-2">
                            {content.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Order: {content.order}
                          </span>
                        </div>
                        
                        <div className="mt-2">
                          {content.type === 'text' && (
                            <Textarea
                              value={content.content}
                              onChange={(e) => updateContent(chapter.id, content.id, e.target.value)}
                            />
                          )}
                          {content.type === 'link' && (
                            <Input
                              type="url"
                              value={content.content}
                              onChange={(e) => updateContent(chapter.id, content.id, e.target.value)}
                            />
                          )}
                          {content.type === 'youtube' && (
                            <Input
                              type="url"
                              value={content.content}
                              onChange={(e) => updateContent(chapter.id, content.id, e.target.value)}
                            />
                          )}
                          {content.type === 'code' && (
                            <div className="space-y-2">
                              <select
                                value={content.content.language || 'javascript'}
                                onChange={(e) => updateContent(chapter.id, content.id, {
                                  ...content.content,
                                  language: e.target.value
                                })}
                                className="border rounded px-2 py-1 text-sm"
                              >
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                              </select>
                              <Textarea
                                value={content.content.code}
                                onChange={(e) => updateContent(chapter.id, content.id, {
                                  ...content.content,
                                  code: e.target.value
                                })}
                                className="font-mono text-sm h-32"
                              />
                            </div>
                          )}
                          {content.type === 'image' && (
                            <div className="space-y-2">
                              <Input
                                type="url"
                                value={content.content.url}
                                onChange={(e) => updateContent(chapter.id, content.id, {
                                  ...content.content,
                                  url: e.target.value
                                })}
                              />
                              <Input
                                value={content.content.filename}
                                onChange={(e) => updateContent(chapter.id, content.id, {
                                  ...content.content,
                                  filename: e.target.value
                                })}
                                placeholder="Filename"
                              />
                            </div>
                          )}
                        </div>
                        
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => moveContent(chapter.id, content.id, 'up')}
                            disabled={content.order === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => moveContent(chapter.id, content.id, 'down')}
                            disabled={content.order === chapter.contents.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => deleteContent(chapter.id, content.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </CardContent>
              )}
            </Card>
          ))}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(`/courses/${courseId}`)}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};