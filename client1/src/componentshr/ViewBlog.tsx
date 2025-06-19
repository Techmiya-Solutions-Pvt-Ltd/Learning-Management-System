import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useParams, useNavigate } from 'react-router-dom';
import { getBlogById, updateBlog } from '@/services/api';
import { Loader2, Save, Pencil, Download, ArrowLeft, Calendar, Tag, User, Eye } from 'lucide-react';

interface ContentItem {
  id: string;
  type: string;
  order: number;
  content: string | { url: string; filename?: string };
  file_data?: string;
  file_name?: string;
}

interface Chapter {
  id: string;
  title: string;
  template: string;
  order: number;
  contents: ContentItem[];
}

interface BlogData {
  category: string;
  featured_image: string;
  is_published: boolean;
  tags: string[];
  author_id: string;
  title: string;
  description: string;
  chapters: Chapter[];
  created_at?: string;
  updated_at?: string;
}

export const ViewBlog: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [blogData, setBlogData] = useState<BlogData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const data = await getBlogById(id!); 
        setBlogData(data);
      } catch (error) {
        console.error('Failed to fetch blog', error);
      }
    };

    fetchBlog();
  }, [id]);

  const handleSave = async () => {
    if (!blogData) return;
  
    setSaving(true);
    try {
      const updatePayload = {
        title: blogData.title,
        description: blogData.description,
        author_id: blogData.author_id,
        tags: blogData.tags || [],
        is_published: blogData.is_published || false,
        featured_image: blogData.featured_image || "",
        category: blogData.category || "General",
        chapters: blogData.chapters
      };
  
      await updateBlog(id!, updatePayload);
      setEditMode(false);
    } catch (error) {
      console.error('Failed to save blog', error);
    } finally {
      setSaving(false);
    }
  };

  const renderContentItem = (content: ContentItem) => {
    switch (content.type) {
      case 'text':
        return (
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <p className="mb-6 text-justify">{content.content as string}</p>
          </div>
        );

      case 'youtube':
        const youtubeUrl = typeof content.content === 'string' ? content.content : content.content.url;
        return youtubeUrl ? (
          <div className="my-8 rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-900 to-black p-1">
            <iframe
              width="100%"
              height="400"
              src={youtubeUrl}
              title="YouTube video"
              className="rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : null;

      case 'image':
        const imageUrl = content.file_data || 
                        (typeof content.content === 'string' ? content.content : content.content.url);
        return imageUrl ? (
          <div className="my-8 group">
            <div className="relative overflow-hidden rounded-xl shadow-2xl transform transition-all duration-300 hover:scale-[1.02]">
              <img
                src={imageUrl}
                alt={content.file_name || "Blog image"}
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            {content.file_name && (
              <div className="mt-4 flex justify-center">
                <a
                  href={imageUrl}
                  download={content.file_name}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  <Download size={16} /> Download Image
                </a>
              </div>
            )}
          </div>
        ) : null;

      case 'pdf':
        const pdfData = content.file_data || 
                       (typeof content.content === 'string' ? content.content : content.content.url);
        
        if (!pdfData) {
          return (
            <div className="my-8 p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
              PDF content not available
            </div>
          );
        }

        return (
          <div className="my-8 bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 font-bold text-xl">PDF</span>
              </div>
              <p className="text-gray-600 mb-4">
                {content.file_name || 'PDF Document'}
              </p>
              <a
                href={pdfData}
                download={content.file_name || 'document.pdf'}
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                <Download size={16} /> Download PDF
              </a>
            </div>
          </div>
        );

      default:
        return (
          <div className="my-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-center">
            Unsupported content type: {content.type}
          </div>
        );
    }
  };

  if (!blogData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your blog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative">
        {blogData.featured_image && (
          <div className="h-40 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
            <img
              src={blogData.featured_image}
              alt={blogData.title}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        )}
        
        {/* Navigation */}
        <div className="absolute top-6 left-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="bg-white/90 backdrop-blur-sm border-white/20 hover:bg-white text-gray-800 shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Edit Actions */}
        <div className="absolute top-6 right-6">
          {editMode ? (
            <div className="flex gap-3">
              <Button 
                onClick={handleSave} 
                disabled={saving} 
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditMode(false)}
                className="bg-white/90 backdrop-blur-sm border-white/20 hover:bg-white text-gray-800 shadow-lg"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => setEditMode(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            >
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 -mt-20 relative z-10">
        {/* Article Header */}
        <article className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
          <div className="p-8 md:p-12">
            {/* Title */}
            <div className="mb-8">
              {editMode ? (
                <Input
                  value={blogData.title}
                  onChange={(e) => setBlogData({ ...blogData, title: e.target.value })}
                  className="text-4xl font-bold border-0 p-0 h-auto bg-transparent text-gray-900 placeholder:text-gray-400"
                  placeholder="Blog title..."
                />
              ) : (
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                  {blogData.title}
                </h1>
              )}
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-medium">{blogData.author_id}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{blogData.created_at ? new Date(blogData.created_at).toLocaleDateString() : 'Date not available'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {blogData.category}
                </span>
              </div>
              {blogData.is_published && (
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Published
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            {blogData.tags && blogData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {blogData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              {editMode ? (
                <Textarea
                  value={blogData.description}
                  onChange={(e) => setBlogData({ ...blogData, description: e.target.value })}
                  className="text-lg text-gray-600 leading-relaxed border-gray-200"
                  placeholder="Blog description..."
                  rows={3}
                />
              ) : (
                <p className="text-lg text-gray-600 leading-relaxed font-light">
                  {blogData.description || 'No description provided'}
                </p>
              )}
            </div>
          </div>
        </article>

        {/* Chapters */}
        <div className="space-y-8">
          {blogData.chapters.map((chapter, chapterIndex) => (
            <article key={chapter.id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-8 md:p-12">
                {/* Chapter Title */}
                <div className="mb-8">
                  {editMode ? (
                    <Input
                      value={chapter.title}
                      onChange={(e) => {
                        const updatedChapters = [...blogData.chapters];
                        const chapterIndex = updatedChapters.findIndex(c => c.id === chapter.id);
                        if (chapterIndex !== -1) {
                          updatedChapters[chapterIndex].title = e.target.value;
                          setBlogData({ ...blogData, chapters: updatedChapters });
                        }
                      }}
                      className="text-3xl font-bold border-0 p-0 h-auto bg-transparent text-gray-900 placeholder:text-gray-400"
                    />
                  ) : (
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 relative">
                      <span className="absolute -left-6 top-0 text-6xl font-black text-blue-100 -z-10">
                        {(chapterIndex + 1).toString().padStart(2, '0')}
                      </span>
                      {chapter.title}
                    </h2>
                  )}
                </div>

                {/* Chapter Contents */}
                <div className="space-y-8">
                  {chapter.contents.map((content) => (
                    <div key={content.id} className="relative">
                      {editMode ? (
                        <div className="p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                          <label className="block text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">
                            {content.type} Content
                          </label>
                          {content.type === 'text' ? (
                            <Textarea
                              value={content.content as string}
                              onChange={(e) => {
                                const updatedChapters = [...blogData.chapters];
                                const chapterIndex = updatedChapters.findIndex(c => c.id === chapter.id);
                                if (chapterIndex !== -1) {
                                  const contentIndex = updatedChapters[chapterIndex].contents.findIndex(c => c.id === content.id);
                                  if (contentIndex !== -1) {
                                    updatedChapters[chapterIndex].contents[contentIndex].content = e.target.value;
                                    setBlogData({ ...blogData, chapters: updatedChapters });
                                  }
                                }
                              }}
                              className="min-h-32"
                              rows={4}
                            />
                          ) : (
                            <Input
                              value={typeof content.content === 'string' ? content.content : content.content.url}
                              onChange={(e) => {
                                const updatedChapters = [...blogData.chapters];
                                const chapterIndex = updatedChapters.findIndex(c => c.id === chapter.id);
                                if (chapterIndex !== -1) {
                                  const contentIndex = updatedChapters[chapterIndex].contents.findIndex(c => c.id === content.id);
                                  if (contentIndex !== -1) {
                                    if (typeof content.content === 'string') {
                                      updatedChapters[chapterIndex].contents[contentIndex].content = e.target.value;
                                    } else {
                                      updatedChapters[chapterIndex].contents[contentIndex].content = {
                                        ...content.content,
                                        url: e.target.value
                                      };
                                    }
                                    setBlogData({ ...blogData, chapters: updatedChapters });
                                  }
                                }
                              }}
                              placeholder={`Enter ${content.type} URL...`}
                            />
                          )}
                        </div>
                      ) : (
                        renderContentItem(content)
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Footer */}
        {blogData.updated_at && (
          <div className="mt-16 text-center text-gray-500">
            <p className="text-sm">
              Last updated: {new Date(blogData.updated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long', 
                day: 'numeric'
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}