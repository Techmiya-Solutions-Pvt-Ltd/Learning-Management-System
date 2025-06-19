import React, { useEffect, useState, useRef } from "react";
import { ChevronDown, ChevronUp, Download, ArrowLeft, Search, User, Book, Award, Check, BookOpen, Globe, FileText, Clock, Calendar, FileSearch } from "lucide-react";
import styles from './CourseDisplay.module.css';
import { getCourseById } from "@/services/api";
import { useParams, useNavigate } from 'react-router-dom';

interface ContentItem {
  id: string;
  type: string;
  order: number;
  content?: string | {
    url?: string;
    filename?: string;
    text?: string;
    code?: string;
    language?: string;
    [key: string]: any;
  };
}

interface Chapter {
  id: string;
  title: string;
  template: string;
  order: number;
  contents: ContentItem[];
}

interface Course {
  _id: string;
  title: string;
  created_at: string;
  updated_at: string;
  teacher_id: string;
  chapters: Chapter[];
  [key: string]: any;
}

interface StudentData {
  name: string;
  email: string;
  enrollmentDate: string;
  assignedBy: string;
}

const CourseDisplay: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<{ [key: string]: boolean }>({});
  const [completedChapters, setCompletedChapters] = useState<{ [key: string]: boolean }>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [webSearchTerm, setWebSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("outline");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  const studentData: StudentData = {
    name: "John Doe",
    email: "john.doe@example.com",
    enrollmentDate: "2025-03-15",
    assignedBy: "Prof. Jane Smith"
  };


    useEffect(() => {
      const fetchCourse = async () => {
        try {
          if (!courseId) {
            throw new Error("No course ID provided");
          }
          
          const data = await getCourseById(courseId);
          if (!data) {
            throw new Error("Course not found");
          }
  
          // Normalize the course data structure
          const normalizedCourse = {
            ...data,
            // Ensure chapters and contents exist
            chapters: data.chapters?.map(chapter => ({
              ...chapter,
              id: chapter.id || Math.random().toString(36).substring(2, 9),
              contents: chapter.contents?.map(content => ({
                ...content,
                id: content.id || Math.random().toString(36).substring(2, 9),
                // Normalize content structure
                content: (() => {
                  if (content.type === 'youtube' && typeof content.content === 'string') {
                    return { url: content.content };
                  }
                  if (typeof content.content === 'string' && content.type !== 'text') {
                    try {
                      return JSON.parse(content.content);
                    } catch {
                      return content.content;
                    }
                  }
                  return content.content || (content.type === 'text' ? '' : {});
                })()
              })) || []
            })) || []
          };
  
          console.log("Normalized course data:", normalizedCourse);
          setCourse(normalizedCourse);
          
          if (normalizedCourse.chapters?.length > 0) {
            setExpandedChapters({ [normalizedCourse.chapters[0].id]: true });
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to fetch course");
          console.error("Failed to fetch course:", err);
        } finally {
          setLoading(false);
        }
      };
  

    fetchCourse();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, [courseId]);

  const toggleChapterExpansion = (chapterId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const markChapterAsRead = (chapterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // Handle youtu.be short links
    if (url.includes('youtu.be')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Handle standard YouTube URLs
    const regExp = /^.*(youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/watch\?.*v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // If we couldn't extract an ID, return the original URL
    return url;
  };

  const getDirectImageUrl = (content: any): string => {
    if (typeof content === 'string') return content;
    if (content?.url) {
      const url = content.url;
      const fileIdMatch = url.match(/\/file\/d\/([^\/]+)/) || 
                         url.match(/\/uc\?id=([^&]+)/) || 
                         url.match(/\/d\/([^\/]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
      }
      return url;
    }
    return '';
  };

  const renderContentItem = (content: ContentItem) => {
    if (!content) {
      return <div className={styles.invalidContent}>Invalid content</div>;
    }

    const contentValue = content.content;
    const contentType = content.type;

    // Handle YouTube content
    if (contentType === "youtube") {
      let youtubeUrl = '';
      
      if (typeof contentValue === 'string') {
        youtubeUrl = contentValue;
      } else if (typeof contentValue === 'object' && contentValue.url) {
        youtubeUrl = contentValue.url;
      }
      
      const embedUrl = getYouTubeEmbedUrl(youtubeUrl);
      
      if (!embedUrl) {
        return (
          <div className={styles.invalidContent}>
            Invalid YouTube URL: {youtubeUrl}
            <br />
            <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
              Open in YouTube
            </a>
          </div>
        );
      }
      
      return (
        <div className={styles.videoContentContainer}>
          <div className={styles.videoContainer}>
            <iframe
              width="100%"
              height="400"
              src={embedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onError={(e) => {
                const iframe = e.target as HTMLIFrameElement;
                iframe.style.display = 'none';
                const container = iframe.parentElement!;
                container.innerHTML = `
                  <div class="${styles.videoError}">
                    <p>Could not load YouTube video.</p>
                    <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer">
                      Open in YouTube
                    </a>
                  </div>
                `;
              }}
            />
          </div>
          <div className={styles.videoFallbackLink}>
            <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
              Open in YouTube
            </a>
          </div>
        </div>
      );
    }
    // Handle text content
    if (contentType === "text") {
      
      const text = typeof contentValue === 'string' ? contentValue : 
                  (typeof contentValue === 'object' ? contentValue.text : '');
      return (

        <div className={styles.textContentContainer}>
          <p className={contentType}>{text || 'No text available'}</p>
        </div>
      );
    }

    // Handle link content
    if (contentType === "link") {
      const url = typeof contentValue === 'string' ? contentValue : 
                 (typeof contentValue === 'object' ? contentValue.url : '');
      return (
        <div className={styles.linkContentContainer}>
          <a 
            href={url || '#'} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.link}
          >
            {url || 'Untitled link'}
          </a>
        </div>
      );
    }

    // Handle image content
    if (contentType === "image") {
      const imageUrl = getDirectImageUrl(contentValue);
      const filename = typeof contentValue === 'object' ? contentValue.filename : undefined;
      
      if (!imageUrl) return <div className={styles.invalidContent}>Invalid image URL</div>;
      
      return (
        <div className={styles.imageContentContainer}>
          <div className={styles.imagePreview}>
            <img
              src={imageUrl}
              alt={filename || "Course image"}
              className={styles.image}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.innerHTML = 
                  `<div class="${styles.imageError}">Image failed to load: ${filename || 'No filename'}</div>`;
              }}
            />
          </div>
          {filename && (
            <div className={styles.imageMeta}>
              <a
                href={imageUrl}
                download={filename}
                className={styles.downloadLink}
              >
                <Download size={16} /> Download {filename}
              </a>
            </div>
          )}
        </div>
      );
    }

    // Handle code content
    if (contentType === "code") {
      const code = typeof contentValue === 'object' ? contentValue.code : '';
      const language = typeof contentValue === 'object' ? contentValue.language : undefined;
      
      return (
        <div className={styles.codeContentContainer}>
          <pre className={styles.codeBlock}>
            <code>{code || '// No code provided'}</code>
          </pre>
          {language && (
            <div className={styles.codeLanguage}>
              {language}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={styles.unsupported}>
        Unsupported content type: {contentType}
      </div>
    );
  };

  const calculateProgress = () => {
    if (!course?.chapters) return 0;
    const totalChapters = course.chapters.length;
    const completedCount = Object.values(completedChapters).filter(Boolean).length;
    return Math.round((completedCount / totalChapters) * 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Loading course...</div>;
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>{error}</div>
        <button 
          className={styles.backButton}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} /> Back to courses
        </button>
      </div>
    );
  }

  if (!course) {
    return <div className={styles.loadingContainer}>Course not found</div>;
  }

  return (
    <div className={styles.appContainer}>
      <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <div className={styles.sidebarContent}>
          <div className={styles.studentProfile}>
            <div className={styles.profileAvatar}>
              <User size={48} />
            </div>
            <h3>{studentData.name}</h3>
            <p>{studentData.email}</p>
            <div className={styles.currentTime}>
              <Clock size={16} />
              <span>{formatTime(currentTime)}</span>
            </div>
          </div>
          
          <div className={styles.courseProgress}>
            <h4>Course Progress</h4>
            <div className={styles.progressContainer}>
              <div 
                className={styles.progressBar} 
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
            <p>{calculateProgress()}% Complete</p>
          </div>
          
          <div className={styles.sidebarTabs}>
            <button 
              className={`${styles.tabButton} ${activeTab === "outline" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("outline")}
            >
              <BookOpen size={18} />
              <span>Outline</span>
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === "info" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("info")}
            >
              <FileText size={18} />
              <span>Info</span>
            </button>
          </div>
          
          {activeTab === "outline" && (
            <div className={styles.courseOutline}>
              <h4>Course Outline</h4>
              <ul>
                {course.chapters?.map((chapter, index) => (
                  <li 
                    key={chapter.id} 
                    className={`${styles.outlineItem} ${completedChapters[chapter.id] ? styles.completedChapter : ""}`}
                    onClick={() => {
                      toggleChapterExpansion(chapter.id);
                      document.getElementById(`chapter-${chapter.id}`)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <div className={styles.outlineItemContent}>
                      <span className={styles.outlineChapterNumber}>{index + 1}</span>
                      <span className={styles.outlineChapterTitle}>{chapter.title}</span>
                    </div>
                    {completedChapters[chapter.id] && <Check size={16} className={styles.checkIcon} />}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {activeTab === "info" && (
            <div className={styles.courseInfo}>
              <div className={styles.infoCard}>
                <h4>Course Details</h4>
                <div className={styles.infoItem}>
                  <Book size={16} />
                  <span>{course.chapters?.length || 0} Chapters</span>
                </div>
                <div className={styles.infoItem}>
                  <Award size={16} />
                  <span>Assigned by: {studentData.assignedBy}</span>
                </div>
                <div className={styles.infoItem}>
                  <Calendar size={16} />
                  <span>Enrolled: {studentData.enrollmentDate}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.mainContent}>
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <button className={styles.menuToggle} onClick={toggleSidebar}>
              {sidebarOpen ? <ArrowLeft size={20} /> : <Book size={20} />}
            </button>
            <button 
              className={styles.backButton}
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={20} /> Back to Dashboard
            </button>
          </div>
          <div className={styles.searchContainer}>
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search in course..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
        
        <div className={styles.header}>
          <h1 className={styles.courseTitle}>{course.title}</h1>
          <div className={styles.courseBadges}>
            <span className={styles.courseBadge}>{course.chapters?.length || 0} Chapters</span>
          </div>
        </div>

        {course.chapters?.map((chapter, index) => (
          <div
            id={`chapter-${chapter.id}`}
            key={chapter.id}
            className={`${styles.chapterDisplay} ${completedChapters[chapter.id] ? styles.completedChapterCard : ""}`}
          >
            <div
              className={styles.chapterHeader}
              onClick={() => toggleChapterExpansion(chapter.id)}
            >
              <div className={styles.chapterHeaderLeft}>
                <span className={styles.chapterNumber}>{index + 1}</span>
                <h2 className={styles.chapterTitle}>{chapter.title}</h2>
                {completedChapters[chapter.id] && <Check size={20} className={styles.completedIcon} />}
              </div>
              
              <div className={styles.chapterHeaderRight}>
                <button 
                  className={`${styles.markReadButton} ${completedChapters[chapter.id] ? styles.marked : ''}`}
                  onClick={(e) => markChapterAsRead(chapter.id, e)}
                >
                  {completedChapters[chapter.id] ? 'Completed' : 'Mark as Read'}
                </button>
                <button className={styles.expandButton}>
                  {expandedChapters[chapter.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
            </div>

            {expandedChapters[chapter.id] && (
              <div className={styles.chapterContents}>
                {chapter.contents?.map((contentItem) => (
                  <div key={contentItem.id} className={styles.contentItemWrapper}>
                    {renderContentItem(contentItem)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseDisplay;