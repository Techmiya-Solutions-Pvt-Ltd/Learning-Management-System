import React, { useState, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PlusCircle, Settings, ChevronDown, ChevronUp, Trash2, Move, Edit, Save, X } from 'lucide-react';
import '../CourseCreation.css';
import { createBlog, createCourse } from '@/services/api';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Template options
const chapterTemplates = [
  { id: 'clean', name: 'Clean', icon: '🧼' },
  { id: 'professional', name: 'Professional', icon: '💼' },
  { id: 'modern', name: 'Modern', icon: '🚀' },
  { id: 'academic', name: 'Academic', icon: '🎓' },
  { id: 'creative', name: 'Creative', icon: '🎨' },
  { id: 'dark', name: 'Dark', icon: '⬛' },
  { id: 'minimal', name: 'Minimal', icon: '⚪' },
  { id: 'minimal', name: '', icon: '' },
  { id: 'minimal', name: '', icon: '' },
  { id: 'minimal', name: '', icon: '' },
  { id: 'minimal', name: '', icon: '' },
  { id: 'minimal', name: '', icon: '' },
  { id: 'minimal', name: '', icon: '' },
  { id: 'minimal', name: '', icon: '' },
  { id: 'minimal', name: '', icon: '' },
];

// Content type options
const defaultContentTypes = [
  { id: 'text', name: 'Text', icon: '📝' },
  { id: 'image', name: 'Image', icon: '🖼️' },
  { id: 'link', name: 'Link', icon: '🔗' },
  { id: 'youtube', name: 'YouTube Video', icon: '▶️' },
  // { id: 'video', name: 'Video Upload', icon: '🎥' },
  
  { id: 'pdf', name: 'PDF', icon: '📄' },
 
  { id: 'code', name: 'Code Snippet', icon: '💻' },
];




interface ContentType {
  id: string;
  name: string;
  icon: string;
  isCustom?: boolean;
}

interface ContentItem {
  id: string;
  type: string;
  content: any;
}

interface Chapter {
  id: string;
  title: string;
  template: string;
  isExpanded: boolean;
  contents: ContentItem[];
}

const BlogCreator: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: 'Blog-1',
      title: 'Blog 1',
      template: 'clean',
      isExpanded: true,
      contents: [],
    },
  ]);

  const [contentTypes, setContentTypes] = useState<ContentType[]>(defaultContentTypes);
  const [isCreatingCustomContent, setIsCreatingCustomContent] = useState(false);
  const [newCustomContent, setNewCustomContent] = useState({ name: '', icon: '📄' });
  const [activeChapterId, setActiveChapterId] = useState<string>('Blog-1');
  const [courseTitle, setCourseTitle] = useState("New Blog");
  const [isSaving, setIsSaving] = useState(false);
  // File upload state
  const [fileUploads, setFileUploads] = useState<Record<string, { file: File | null; preview: string | null }>>({});

  const [isUploading, setIsUploading] = useState(false);


  // Quiz state
  const [quizData, setQuizData] = useState<{
    [key: string]: {
      question: string;
      options: string[];
      correctAnswer: number;
    }
  }>({});

  // Configuration modal state
  const [showConfigModal, setShowConfigModal] = useState<{
    visible: boolean;
    type: string;
    contentId: string;
    chapterId: string;
  }>({ visible: false, type: '', contentId: '', chapterId: '' });

  // Assignment state
  const [assignmentData, setAssignmentData] = useState<{
    [key: string]: {
      title: string;
      description: string;
      dueDate: string;
      points: number;
    }
  }>({});

  // Assessment state
  const [assessmentData, setAssessmentData] = useState<{
    [key: string]: {
      title: string;
      questions: Array<{
        question: string;
        type: 'multiple-choice' | 'true-false' | 'short-answer';
        options?: string[];
        correctAnswer: string | number;
      }>;
    }
  }>({});

  const nextChapterId = useRef(2);
  const nextContentId = useRef(1);
  const nextCustomContentId = useRef(1);

  // Add new chapter
  const addChapter = () => {
    const newChapter: Chapter = {
      id: `chapter-${nextChapterId.current}`,
      title: `Blog ${nextChapterId.current}`,
      template: 'clean',
      isExpanded: true,
      contents: [],
    };

    setChapters([...chapters, newChapter]);
    setActiveChapterId(newChapter.id);
    nextChapterId.current += 1;
  };

  // Handle chapter title change
  const handleTitleChange = (chapterId: string, newTitle: string) => {
    setChapters(
      chapters.map(chapter =>
        chapter.id === chapterId ? { ...chapter, title: newTitle } : chapter
      )
    );
  };

  // Toggle chapter expansion
  const toggleChapterExpansion = (chapterId: string) => {
    setChapters(
      chapters.map(chapter => {
        const isExpanded = chapter.id === chapterId ? !chapter.isExpanded : false;
        return { ...chapter, isExpanded };
      })
    );
    if (chapters.find(chapter => chapter.id === chapterId)?.isExpanded === false) {
      setActiveChapterId(chapterId);
    }
  };

  // Delete chapter
  const deleteChapter = (chapterId: string) => {
    setChapters(chapters.filter(chapter => chapter.id !== chapterId));
    if (activeChapterId === chapterId && chapters.length > 1) {
      const remainingChapters = chapters.filter(chapter => chapter.id !== chapterId);
      setActiveChapterId(remainingChapters[0].id);
    }
  };

  // Set chapter template
  const setChapterTemplate = (chapterId: string, templateId: string) => {
    setChapters(
      chapters.map(chapter =>
        chapter.id === chapterId ? { ...chapter, template: templateId } : chapter
      )
    );
  };

  // Add content to chapter
  const addContent = (contentType: string) => {
    const contentId = `content-${nextContentId.current}`;
    nextContentId.current += 1;

    let defaultContent = '';
    if (contentType === 'text') defaultContent = 'Enter your text here...';
    else if (contentType === 'link') defaultContent = 'https://';
    else if (contentType === 'youtube') defaultContent = 'https://www.youtube.com/embed/';

    const newContentItem: ContentItem = {
      id: contentId,
      type: contentType,
      content: defaultContent,
    };

    setChapters(
      chapters.map(chapter => {
        if (chapter.id === activeChapterId) {
          return {
            ...chapter,
            contents: [...chapter.contents, newContentItem],
          };
        }
        return chapter;
      })
    );
  };

  // Create new custom content type
  const addCustomContentType = () => {
    if (newCustomContent.name.trim() === '') return;

    const customId = `custom-${nextCustomContentId.current}`;
    nextCustomContentId.current += 1;

    const newType: ContentType = {
      id: customId,
      name: newCustomContent.name,
      icon: newCustomContent.icon || '📄',
      isCustom: true,
    };

    setContentTypes([...contentTypes, newType]);
    setNewCustomContent({ name: '', icon: '📄' });
    setIsCreatingCustomContent(false);
  };
  const navigate = useNavigate();

  // Delete custom content type
  const deleteCustomContentType = (event: React.MouseEvent, typeId: string) => {
    event.stopPropagation();
    setContentTypes(contentTypes.filter(type => type.id !== typeId));
  };

  // Update content
  const updateContent = (chapterId: string, contentId: string, newContent: any) => {
    setChapters(
      chapters.map(chapter => {
        if (chapter.id === chapterId) {
          return {
            ...chapter,
            contents: chapter.contents.map(content =>
              content.id === contentId ? { ...content, content: newContent } : content
            ),
          };
        }
        return chapter;
      })
    );
  };

  // Delete content
  const deleteContent = (chapterId: string, contentId: string) => {
    setChapters(
      chapters.map(chapter => {
        if (chapter.id === chapterId) {
          return {
            ...chapter,
            contents: chapter.contents.filter(content => content.id !== contentId),
          };
        }
        return chapter;
      })
    );
  };

  // Handle file uploads
  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    contentId: string,
    type: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log(`File uploaded: ${file.name}, Type: ${type}`);

    const preview = URL.createObjectURL(file); // Generate preview URL for all types

    setFileUploads(prev => {
      const updatedUploads = {
        ...prev,
        [contentId]: { file, preview }
      };
      console.log("Updated file uploads:", updatedUploads);
      return updatedUploads;
    });

    updateContent(activeChapterId, contentId, file.name);
  };




  // Quiz handlers
  const handleQuizChange = (contentId: string, field: string, value: string | string[] | number) => {
    setQuizData(prev => ({
      ...prev,
      [contentId]: {
        ...(prev[contentId] || { question: '', options: ['', '', '', ''], correctAnswer: 0 }),
        [field]: value
      }
    }));
  };

  // Assignment handlers
  const handleAssignmentChange = (contentId: string, field: string, value: string | number) => {
    setAssignmentData(prev => ({
      ...prev,
      [contentId]: {
        ...(prev[contentId] || { title: '', description: '', dueDate: '', points: 100 }),
        [field]: value
      }
    }));
  };

  // Assessment handlers
  const handleAssessmentChange = (contentId: string, questionIndex: number, field: string, value: any) => {
    setAssessmentData(prev => ({
      ...prev,
      [contentId]: {
        ...(prev[contentId] || { title: 'Assessment', questions: [] }),
        questions: prev[contentId]?.questions?.map((q, i) =>
          i === questionIndex ? { ...q, [field]: value } : q
        ) || []
      }
    }));
  };

  const addAssessmentQuestion = (contentId: string) => {
    setAssessmentData(prev => ({
      ...prev,
      [contentId]: {
        ...(prev[contentId] || { title: 'Assessment', questions: [] }),
        questions: [
          ...(prev[contentId]?.questions || []),
          {
            question: '',
            type: 'multiple-choice',
            options: ['', '', '', ''],
            correctAnswer: 0
          }
        ]
      }
    }));
  };

  // Modal handlers
  const openConfigModal = (type: string, contentId: string, chapterId: string) => {
    setShowConfigModal({ visible: true, type, contentId, chapterId });
  };

  const closeConfigModal = () => {
    setShowConfigModal({ visible: false, type: '', contentId: '', chapterId: '' });
  };



  async function getAccessToken(): Promise<string> {
    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
        refresh_token: import.meta.env.VITE_GOOGLE_REFRESH_TOKEN,
        grant_type: 'refresh_token',
      });
      return response.data.access_token;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw new Error('Google Drive authentication failed');
    }
  }

  // Upload file to Google Drive
  // Function to generate a random unique name for the file
  const generateUniqueFileName = (originalFileName: string): string => {
    const timestamp = Date.now(); // or you can use a UUID library
    const extension = originalFileName.split('.').pop();
    return `${timestamp}.${extension}`;
  };

  // Function to upload a file to Google Drive
  const uploadToGoogleDrive = async (file: File): Promise<string> => {
    try {
      // Get a fresh access token
      const accessToken = await getAccessToken();
      // console.log("Access Token:", accessToken);
      const formData = new FormData();
      const uniqueFileName = generateUniqueFileName(file.name);

      formData.append('metadata', new Blob([JSON.stringify({
        name: uniqueFileName,
        mimeType: file.type,
      })], { type: 'application/json' }));

      formData.append('file', file);

      // Upload file
      const response = await axios.post(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/related',
          },
        }
      );

      // Make file public
      const fileId = response.data.id;
      console.log("File ID:", fileId); // Debug

      // 3. Set public permissions (FIXED)
      try {
        await axios.post(
          `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
          {
            role: 'reader',
            type: 'anyone',
            supportsAllDrives: true
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        console.log(`Made file ${fileId} (${file.type}) public`);
      } catch (permissionError) {
        console.error(`Failed to make file public:`, permissionError);
        // Continue even if permission setting fails
      }

      // Return direct download link
      console.log('File uploaded successfully:', response.data);
      return `https://drive.google.com/file/d/${fileId}/preview`;
    } catch (error) {
      console.error('Google Drive upload error:', error);
      throw error;
    }
  };
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};
const handleSaveCourse = async () => {
  setIsSaving(true);
  
  try {
    // Convert all files to Base64
    const fileConversionPromises = Object.entries(fileUploads).map(async ([contentId, upload]) => {
      if (upload.file) {
        const base64Data = await fileToBase64(upload.file);
        return {
          contentId,
          file_data: base64Data,
          file_name: upload.file.name,
          file_type: upload.file.type
        };
      }
      return null;
    });

    const fileData = (await Promise.all(fileConversionPromises)).filter(Boolean);

    // Prepare the complete blog data
    const blogData = {
      title: courseTitle,
      description: "",
      teacher_id: JSON.parse(localStorage.getItem('user') || '{}').id,
      chapters: chapters.map(chapter => ({
        title: chapter.title,
        template: chapter.template,
        order: chapters.indexOf(chapter),
        contents: chapter.contents.map(content => {
          const fileInfo = fileData.find(f => f.contentId === content.id);
          
          if (fileInfo) {
            return {
              type: content.type,
              order: chapter.contents.indexOf(content),
              file: fileInfo.file_data,
              file_name: fileInfo.file_name,
              file_type: fileInfo.file_type
            };
          } else if (content.type === 'youtube') {
            return {
              type: content.type,
              order: chapter.contents.indexOf(content),
              content: content.content // YouTube URL
            };
          } else {
            return {
              type: content.type,
              order: chapter.contents.indexOf(content),
              content: content.content // Text content
            };
          }
        })
      })),
      featured_image: {}, // Add if you have featured images
      tags: [], // Add tags if needed
      is_published: false // Or true if you want to publish immediately
    };

    // Call API to save blog
    const result = await createBlog(blogData);
    console.log("Blog saved successfully:", result);
    alert("Blog added successfully!");
    navigate(-1);

  } catch (error) {
    console.error("Error saving blog:", error);
    alert("Failed to add blog. Please try again.");
  } finally {
    setIsSaving(false);
  }
};

  const saveConfig = () => {
    closeConfigModal();
  };

  // Handle drag end for reordering
  const onDragEnd = (result: any) => {
    const { source, destination, type } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Reordering chapters
    if (type === 'chapter') {
      const reorderedChapters = Array.from(chapters);
      const [removed] = reorderedChapters.splice(source.index, 1);
      reorderedChapters.splice(destination.index, 0, removed);
      setChapters(reorderedChapters);
      return;
    }

    // Reordering content within the same chapter
    if (source.droppableId === destination.droppableId) {
      const chapterId = source.droppableId;
      const chapter = chapters.find(c => c.id === chapterId);

      if (chapter) {
        const newContents = Array.from(chapter.contents);
        const [removed] = newContents.splice(source.index, 1);
        newContents.splice(destination.index, 0, removed);

        setChapters(
          chapters.map(c =>
            c.id === chapterId ? { ...c, contents: newContents } : c
          )
        );
      }
    }
    // Moving content between chapters
    else {
      const sourceChapterId = source.droppableId;
      const destChapterId = destination.droppableId;

      const sourceChapter = chapters.find(c => c.id === sourceChapterId);
      const destChapter = chapters.find(c => c.id === destChapterId);

      if (sourceChapter && destChapter) {
        const sourceContents = Array.from(sourceChapter.contents);
        const destContents = Array.from(destChapter.contents);

        const [removed] = sourceContents.splice(source.index, 1);
        destContents.splice(destination.index, 0, removed);

        setChapters(
          chapters.map(c => {
            if (c.id === sourceChapterId) return { ...c, contents: sourceContents };
            if (c.id === destChapterId) return { ...c, contents: destContents };
            return c;
          })
        );
      }
    }
  };

  // Render content item based on type
  const renderContentItem = (item: ContentItem, chapterId: string) => {
    switch (item.type) {
      case 'text':
        return (
          <div className="content-item text-content">
            <textarea
              value={item.content}
              onChange={(e) => updateContent(chapterId, item.id, e.target.value)}
              placeholder="Enter your text here..."
              rows={4}
            />
          </div>
        );
      case 'image':
        return (
          <div className="content-item image-content">
            {fileUploads[item.id]?.preview ? (
              <div className="image-preview">
                <img src={fileUploads[item.id].preview || ''} alt="Uploaded" />
                <button
                  className="btn-change-image"
                  onClick={() => {
                    document.getElementById(`image-upload-${item.id}`)?.click();
                  }}
                >
                  Change Image
                </button>

                <input
                  id={`image-upload-${item.id}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, item.id, 'image')}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div className="image-upload-area">
                <span className="upload-icon">🖼️</span>
                <p>Drag & drop an image here or</p>
                <button
                  className="btn-upload"
                  onClick={() => document.getElementById(`image-upload-${item.id}`)?.click()}
                >
                  Upload Image
                </button>
                <input
                  id={`image-upload-${item.id}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, item.id, 'image')}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>
        );



      case 'video':
        return (
          <div className="content-item video-content">
            {fileUploads[item.id]?.file ? (
              <div className="video-preview">
                <video controls>
                  <source src={fileUploads[item.id].preview || ''} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <button
                  className="btn-change-video"
                  onClick={() => document.getElementById(`video-upload-${item.id}`)?.click()}
                >
                  Change Video
                </button>
              </div>
            ) : (
              <div className="video-upload-area">
                <span className="upload-icon">🎬</span>
                <p>Upload a video file</p>
                <button
                  className="btn-upload"
                  onClick={() => document.getElementById(`video-upload-${item.id}`)?.click()}
                >
                  <input
                    id={`video-upload-${item.id}`}
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e, item.id, 'video')}
                    style={{ display: 'none' }}
                  />
                  Upload Video
                </button>
                <input
                  id={`video-upload-${item.id}`}
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileUpload(e, item.id, 'video')}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>
        );

      case 'pdf':
        return (
          <div className="content-item pdf-content">
            {fileUploads[item.id]?.file ? (
              <div className="pdf-preview">
                <span className="pdf-icon">📄</span>
                <p><a
                  href={fileUploads[item.id].preview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pdf-link"
                >
                  {fileUploads[item.id].file?.name}
                </a></p>
                <button
                  className="btn-change-pdf"
                  onClick={() => document.getElementById(`pdf-upload-${item.id}`)?.click()}
                >
                  Change PDF
                </button>
                <input
                  id={`pdf-upload-${item.id}`}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e, item.id, 'pdf')}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div className="pdf-upload-area">
                <span className="upload-icon">📄</span>
                <p>Upload a PDF file</p>
                <button
                  className="btn-upload"
                  onClick={() => document.getElementById(`pdf-upload-${item.id}`)?.click()}
                >
                  Upload PDF
                </button>
                <input
                  id={`pdf-upload-${item.id}`}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e, item.id, 'pdf')}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>
        );

      case 'quiz':
        const quiz = quizData[item.id] || { question: '', options: ['', '', '', ''], correctAnswer: 0 };
        return (
          <div className="content-item quiz-content">
            <h4>Quiz Question</h4>
            <input
              type="text"
              value={quiz.question}
              onChange={(e) => handleQuizChange(item.id, 'question', e.target.value)}
              placeholder="Enter your question"
            />

            <h5>Options</h5>
            {quiz.options.map((option, idx) => (
              <div key={idx} className="quiz-option">
                <input
                  type="radio"
                  name={`quiz-${item.id}`}
                  checked={quiz.correctAnswer === idx}
                  onChange={() => handleQuizChange(item.id, 'correctAnswer', idx)}
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...quiz.options];
                    newOptions[idx] = e.target.value;
                    handleQuizChange(item.id, 'options', newOptions);
                  }}
                  placeholder={`Option ${idx + 1}`}
                />
              </div>
            ))}
          </div>
        );
      
      case 'link':
        return (
          <div className="content-item link-content">
            <input
              type="url"
              value={item.content}
              onChange={(e) => updateContent(chapterId, item.id, e.target.value)}
              placeholder="Enter URL"
            />
            <button className="btn-secondary">Add Link Text</button>
          </div>
        );
      case 'youtube':
        // Function to extract video ID from a YouTube URL
        const getYouTubeVideoId = (url: string) => {
          const match = url.match(
            /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
          );
          return match ? match[1] : null;
        };

        const videoId = getYouTubeVideoId(item.content);

        return (
          <div className="content-item youtube-content">
            <input
              type="url"
              value={item.content}
              onChange={(e) => updateContent(chapterId, item.id, e.target.value)}
              placeholder="YouTube Video URL"
            />

            <div className="video-preview">
              {videoId ? (
                <iframe
                  width="100%"
                  height="315"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video preview"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="video-placeholder">
                  <span>Enter a valid YouTube URL to preview</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'code':
        return (
          <div className="content-item code-content">
            <textarea
              value={item.content}
              onChange={(e) => updateContent(chapterId, item.id, e.target.value)}
              placeholder="Enter your code here..."
              rows={8}
              className="code-editor"
            />
            <div className="code-tools">
              <select className="language-selector">
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="csharp">C#</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
              </select>
            </div>
          </div>
        );
      default:
        return (
          <div className="content-item generic-content">
            <div className="placeholder-container">
              <span>{contentTypes.find(type => type.id === item.type)?.icon || '📄'}</span>
              <span>{contentTypes.find(type => type.id === item.type)?.name || 'Content'}</span>
              <button className="btn-configure">Configure</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="course-creator-layout">
      {/* Sidebar with clickable content types */}
      <aside className="content-sidebar">
        <h3 className="sidebar-title">Content Types</h3>
        {isCreatingCustomContent ? (
          <div className="custom-content-form">
            <input
              type="text"
              placeholder="Content Name"
              value={newCustomContent.name}
              onChange={(e) => setNewCustomContent({ ...newCustomContent, name: e.target.value })}
            />
            <div className="icon-selector">
              <label>Icon:</label>
              <select
                value={newCustomContent.icon}
                onChange={(e) => setNewCustomContent({ ...newCustomContent, icon: e.target.value })}
              >
                <option value="📄">📄 Document</option>
                <option value="🔢">🔢 Numbers</option>
                <option value="📊">📊 Chart</option>
                <option value="🧩">🧩 Puzzle</option>
                <option value="🎯">🎯 Target</option>
                <option value="🎮">🎮 Game</option>
                <option value="🎬">🎬 Media</option>
              </select>
            </div>
            <div className="custom-content-actions">
              <button className="btn-primary" onClick={addCustomContentType}>
                <Save size={14} /> Save
              </button>
              <button className="btn-secondary" onClick={() => setIsCreatingCustomContent(false)}>
                <X size={14} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            className="btn-add-custom-content"
            onClick={() => setIsCreatingCustomContent(true)}
          >
            <PlusCircle size={16} /> Add Custom Content
          </button>
        )}

        <div className="sidebar-content-list">
          {contentTypes.map((type) => (
            <div
              key={`sidebar-${type.id}`}
              className="sidebar-content-item"
              onClick={() => addContent(type.id)}
            >
              <span className="sidebar-item-icon">{type.icon}</span>
              <span className="sidebar-item-name">{type.name}</span>
              {type.isCustom && (
                <button
                  className="btn-icon btn-delete-small"
                  onClick={(e) => deleteCustomContentType(e, type.id)}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content with DragDropContext for reordering */}
      <DragDropContext onDragEnd={onDragEnd}>
        <main className="course-content">
          <header className="course-header">
            <input
              type="text"
              className="course-title"
              placeholder="Course Title"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
            />
            <div className="course-actions">

              <button
                className="btn-primary"
                onClick={handleSaveCourse}
                disabled={isSaving || isUploading}
              >
                {isSaving ? "Adding..." : "Add Blog"}
              </button>
            </div>
          </header>

          <Droppable droppableId="chapters" type="chapter">
            {(provided) => (
              <div
                className="chapters-container"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {chapters.map((chapter, index) => (
                  <Draggable key={chapter.id} draggableId={chapter.id} index={index}>
                    {(provided) => (
                      <div
                        className={`chapter-card ${chapter.template} ${chapter.id === activeChapterId ? 'active-chapter' : ''}`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <div className="chapter-header">
                          <div
                            className="drag-handle"
                            {...provided.dragHandleProps}
                          >
                            <Move size={20} />
                          </div>
                          <input
                            type="text"
                            className="chapter-title"
                            value={chapter.title}
                            onChange={(e) => handleTitleChange(chapter.id, e.target.value)}
                          />
                          <div className="chapter-controls">
                            <button
                              className="btn-icon"
                              onClick={() => toggleChapterExpansion(chapter.id)}
                            >
                              {chapter.isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            <div className="template-selector">
                              {/* <button className="btn-template">
                                <span>{chapterTemplates.find(t => t.id === chapter.template)?.icon}</span>
                                <Settings size={16} />
                              </button> */}
                              <div className="template-dropdown">
                                {chapterTemplates.map(template => (
                                  <button
                                    key={template.id}
                                    className={`template-option ${chapter.template === template.id ? 'active' : ''}`}
                                    onClick={() => setChapterTemplate(chapter.id, template.id)}
                                  >
                                    <span>{template.icon}</span>
                                    <span>{template.name}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <button
                              className="btn-icon btn-delete"
                              onClick={() => deleteChapter(chapter.id)}
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>

                        {chapter.isExpanded && (
                          <Droppable droppableId={chapter.id} type="content">
                            {(provided) => (
                              <div
                                className="chapter-content"
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                              >
                                {chapter.contents.map((contentItem, contentIndex) => (
                                  <Draggable
                                    key={contentItem.id}
                                    draggableId={contentItem.id}
                                    index={contentIndex}
                                  >
                                    {(provided) => (
                                      <div
                                        className="content-wrapper"
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                      >
                                        <div className="content-header">
                                          <div
                                            className="content-drag-handle"
                                            {...provided.dragHandleProps}
                                          >
                                            <Move size={16} />
                                          </div>
                                          <span className="content-type">
                                            {contentTypes.find(type => type.id === contentItem.type)?.icon}
                                            {contentTypes.find(type => type.id === contentItem.type)?.name}
                                          </span>
                                          <button
                                            className="btn-icon btn-delete-content"
                                            onClick={() => deleteContent(chapter.id, contentItem.id)}
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        </div>
                                        {renderContentItem(contentItem, chapter.id)}
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}

                                {chapter.contents.length === 0 && (
                                  <div className="chapter-empty-state">
                                    <p>Click content types from the sidebar to add to this Blog</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </Droppable>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <div className="add-chapter-section">
            <button className="btn-add-chapter" onClick={addChapter}>
              <PlusCircle size={24} />
              <span>Add New Section</span>
            </button>
          </div>
          <p
  style={{
    textAlign: 'center',
    marginTop: '20px',
    cursor: 'pointer',
    color: '#007bff',
    textDecoration: 'underline',
  }}
  onClick={() => {
    const confirmLeave = window.confirm("Warning: Unsaved changes will be lost. Do you want to go back?");
    if (confirmLeave) {
      window.history.back();
    }
  }}
>
  Back to portal
</p>


        </main>
      </DragDropContext>

      {/* Configuration Modal */}
      {showConfigModal.visible && (
        <div className="config-modal-overlay">
          <div className="config-modal">
            <div className="modal-header">
              <h3>Configure {showConfigModal.type}</h3>
              <button className="btn-icon" onClick={closeConfigModal}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-content">
              {showConfigModal.type === 'assignment' && (
                <>
                  <div className="form-group">
                    <label>Assignment Title</label>
                    <input
                      type="text"
                      value={assignmentData[showConfigModal.contentId]?.title || ''}
                      onChange={(e) => handleAssignmentChange(showConfigModal.contentId, 'title', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={assignmentData[showConfigModal.contentId]?.description || ''}
                      onChange={(e) => handleAssignmentChange(showConfigModal.contentId, 'description', e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Due Date</label>
                      <input
                        type="date"
                        value={assignmentData[showConfigModal.contentId]?.dueDate || ''}
                        onChange={(e) => handleAssignmentChange(showConfigModal.contentId, 'dueDate', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Points</label>
                      <input
                        type="number"
                        value={assignmentData[showConfigModal.contentId]?.points || 100}
                        onChange={(e) => handleAssignmentChange(showConfigModal.contentId, 'points', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </>
              )}

              {showConfigModal.type === 'assessment' && (
                <>
                  <div className="form-group">
                    <label>Assessment Title</label>
                    <input
                      type="text"
                      value={assessmentData[showConfigModal.contentId]?.title || 'Assessment'}
                      onChange={(e) => setAssessmentData(prev => ({
                        ...prev,
                        [showConfigModal.contentId]: {
                          ...(prev[showConfigModal.contentId] || { title: 'Assessment', questions: [] }),
                          title: e.target.value
                        }
                      }))}
                    />
                  </div>

                  <div className="assessment-questions">
                    <h4>Questions</h4>
                    {(assessmentData[showConfigModal.contentId]?.questions || []).map((q, idx) => (
                      <div key={idx} className="question-item">
                        <div className="form-group">
                          <label>Question {idx + 1}</label>
                          <input
                            type="text"
                            value={q.question}
                            onChange={(e) => handleAssessmentChange(showConfigModal.contentId, idx, 'question', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Type</label>
                          <select
                            value={q.type}
                            onChange={(e) => handleAssessmentChange(showConfigModal.contentId, idx, 'type', e.target.value)}
                          >
                            <option value="multiple-choice">Multiple Choice</option>
                            <option value="true-false">True/False</option>
                            <option value="short-answer">Short Answer</option>
                          </select>
                        </div>

                        {q.type === 'multiple-choice' && (
                          <div className="form-group">
                            <label>Options</label>
                            {q.options?.map((opt, optIdx) => (
                              <div key={optIdx} className="option-item">
                                <input
                                  type="radio"
                                  name={`assessment-${showConfigModal.contentId}-${idx}`}
                                  checked={q.correctAnswer === optIdx}
                                  onChange={() => handleAssessmentChange(showConfigModal.contentId, idx, 'correctAnswer', optIdx)}
                                />
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const newOptions = [...(q.options || [])];
                                    newOptions[optIdx] = e.target.value;
                                    handleAssessmentChange(showConfigModal.contentId, idx, 'options', newOptions);
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {q.type === 'true-false' && (
                          <div className="form-group">
                            <label>Correct Answer</label>
                            <select
                              value={q.correctAnswer as string}
                              onChange={(e) => handleAssessmentChange(showConfigModal.contentId, idx, 'correctAnswer', e.target.value)}
                            >
                              <option value="true">True</option>
                              <option value="false">False</option>
                            </select>
                          </div>
                        )}

                        {q.type === 'short-answer' && (
                          <div className="form-group">
                            <label>Correct Answer</label>
                            <input
                              type="text"
                              value={q.correctAnswer as string}
                              onChange={(e) => handleAssessmentChange(showConfigModal.contentId, idx, 'correctAnswer', e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      className="btn-secondary"
                      onClick={() => addAssessmentQuestion(showConfigModal.contentId)}
                    >
                      Add Question
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={closeConfigModal}>
                Cancel
              </button>
              <button className="btn-primary" onClick={saveConfig}>
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogCreator;