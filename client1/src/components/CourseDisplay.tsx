import React, { useEffect, useState, useRef } from "react";
import { ChevronDown, ChevronUp, Download, ArrowLeft, Search, User, Book, Award, Check, BookOpen, Globe, FileText, Clock, Calendar, FileSearch } from "lucide-react";
import styles from './CourseDisplay.module.css';
import { getCourseById } from "@/services/api";
import { useParams, useNavigate } from 'react-router-dom';

interface ContentItem {
  id: string;
  type: string;
  order: number;
  fileName?: string;
  file_data?: string; // Base64 encoded file data
  content?: any;
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
  custom_content_types: any[];
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

  // Mock student data
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

        // Normalize course data
        const normalizedCourse = {
          ...data,
          chapters: data.chapters?.map(chapter => ({
            ...chapter,
            contents: chapter.contents?.map(content => ({
              ...content,
              content: content.content || {}
            })) || []
          })) || []
        };

        setCourse(normalizedCourse);
        
        // Initialize expanded state for first chapter
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

    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, [courseId]);

  const toggleChapterExpansion = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const markChapterAsRead = (chapterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleWebSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (webSearchTerm) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(webSearchTerm + " " + (course?.title || ""))}`, "_blank");
    }
  };

  const handleSaveNotes = () => {
    const text = notesRef.current?.value || '';
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'course-notes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearNotes = () => {
    if (notesRef.current) notesRef.current.value = '';
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

  const renderContentItem = (content: ContentItem) => {
  switch (content.type) {
    case "text":
      return (
        <p className={styles.textContent}>
          {content.content || "No text available"} {/* Changed from content.content?.text */}
        </p>
      );

      case "link":
        return (
          <a 
            href={content.content?.url || '#'} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.link}
          >
            {content.content?.url || 'Untitled link'}
          </a>
        );

      case "youtube":
        return content.content?.url ? (
          <div className={styles.videoContainer}>
            <iframe
              width="100%"
              height="400"
              src={content.content.url.replace("watch?v=", "embed/")}
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : null;

      case "code":
        return (
          <pre className={styles.codeBlock}>
            <code>{content.content?.code || '// No code provided'}</code>
          </pre>
        );

      case "image":
        return content.file_data ? (
          <div className={styles.imageContent}>
            <div className={styles.imagePreview}>
              <img
                src={content.file_data}
                alt={content.fileName || "Course image"}
                className={styles.image}
              />
            </div>
            {content.fileName && (
              <a
                href={content.file_data}
                download={content.fileName}
                className={styles.downloadLink}
              >
                <Download size={16} /> Download Image
              </a>
            )}
          </div>
        ) : null;

case "pdf":
  return content.file_data ? (
    <div className={styles.pdfContent}>
      <div className={styles.pdfPreview}>
        {/* Updated iframe with proper sandbox attributes */}
        <iframe
          src={`data:application/pdf;base64,${content.file_data.split(',')[1]}`}
          title={content.fileName || "PDF Preview"}
          className={styles.pdfFrame}
          sandbox="allow-scripts allow-same-origin"
          loading="lazy"
        />
        <p className={styles.pdfFallbackText}>
          If the PDF doesn't display, <a 
            href={`data:application/pdf;base64,${content.file_data.split(',')[1]}`} 
            download={content.fileName || "document.pdf"}
          >download it</a> instead.
        </p>
      </div>
      <a
        href={`data:application/pdf;base64,${content.file_data.split(',')[1]}`}
        download={content.fileName || "document.pdf"}
        className={styles.downloadLink}
      >
        <Download size={16} /> Download PDF
      </a>
    </div>
  ) : null;
        return content.file_data ? (
          <div className={styles.pdfContent}>
            <div className={styles.pdfPreview}>
              <iframe
                src={content.file_data}
                title={content.fileName || "PDF Preview"}
                className={styles.pdfFrame}
              />
            </div>
            {content.fileName && (
              <a
                href={content.file_data}
                download={content.fileName}
                className={styles.downloadLink}
              >
                <Download size={16} /> Download PDF
              </a>
            )}
          </div>
        ) : null;

      case "video":
        return content.file_data ? (
          <div className={styles.videoContent}>
            <video controls className={styles.videoPlayer}>
              <source src={content.file_data} type={`video/${content.fileName?.split('.').pop() || 'mp4'}`} />
              Your browser does not support the video tag.
            </video>
            {content.fileName && (
              <a
                href={content.file_data}
                download={content.fileName}
                className={styles.downloadLink}
              >
                <Download size={16} /> Download Video
              </a>
            )}
          </div>
        ) : null;

      default:
        return (
          <div className={styles.unsupported}>
            Unsupported content type: {content.type}
          </div>
        );
    }
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
      {/* Sidebar - remains the same as before */}
      {/* ... */}

      {/* Main Content - updated to handle new data structure */}
      <div className={styles.mainContent}>
        <div className={styles.topBar}>
          {/* Top bar content remains the same */}
          {/* ... */}
        </div>
        
        <div className={styles.header}>
          <h1 className={styles.courseTitle}>{course.title}</h1>
          <div className={styles.courseBadges}>
            <span className={styles.courseBadge}>{course.chapters?.length || 0} Chapters</span>
            <span className={styles.courseBadge}>
              Created: {new Date(course.created_at).toLocaleDateString()}
            </span>
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
                    <div className={styles.contentItem}>
                      {renderContentItem(contentItem)}
                    </div>
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