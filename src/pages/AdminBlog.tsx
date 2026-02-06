import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Loader2, 
  Plus, 
  Pencil, 
  Trash2, 
  Sparkles, 
  Eye,
  ArrowLeft,
  Save,
  X,
  FileText,
  Calendar
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  meta_description: string | null;
  featured_image_url: string | null;
  seo_keywords: string[];
  long_tail_queries: string[];
  author_name: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminBlog() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // AI Generation state
  const [aiTopic, setAiTopic] = useState("");
  const [aiContext, setAiContext] = useState("");
  const [generating, setGenerating] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    meta_description: "",
    featured_image_url: "",
    seo_keywords: "",
    long_tail_queries: "",
    author_name: "",
    status: "draft" as "draft" | "published",
  });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchPosts();
    }
  }, [isAdmin]);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please log in to access admin dashboard");
        navigate("/auth");
        return;
      }

      const { data: roles } = await (supabase as any)
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roles) {
        toast.error("Access denied: Admin privileges required");
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Admin check error:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts((data as BlogPost[]) || []);
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load blog posts");
    }
  };

  const generateWithAI = async () => {
    if (!aiTopic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-blog`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          topic: aiTopic,
          additionalContext: aiContext,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate blog post");
      }

      const generated = await response.json();
      
      setFormData({
        title: generated.title || "",
        slug: generated.slug || "",
        content: generated.content || "",
        excerpt: generated.excerpt || "",
        meta_description: generated.meta_description || "",
        featured_image_url: "",
        seo_keywords: (generated.seo_keywords || []).join(", "),
        long_tail_queries: (generated.long_tail_queries || []).join(", "),
        author_name: "",
        status: "draft",
      });
      
      setEditingPost(null);
      setIsDialogOpen(true);
      toast.success("Blog post generated! Review and save.");
    } catch (error: any) {
      console.error("AI generation error:", error);
      toast.error(error.message || "Failed to generate blog post");
    } finally {
      setGenerating(false);
    }
  };

  const openEditDialog = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content || "",
      excerpt: post.excerpt || "",
      meta_description: post.meta_description || "",
      featured_image_url: post.featured_image_url || "",
      seo_keywords: (post.seo_keywords || []).join(", "),
      long_tail_queries: (post.long_tail_queries || []).join(", "),
      author_name: post.author_name || "",
      status: post.status as "draft" | "published",
    });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      meta_description: "",
      featured_image_url: "",
      seo_keywords: "",
      long_tail_queries: "",
      author_name: "",
      status: "draft",
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `blog-${Date.now()}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('design-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('design-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, featured_image_url: publicUrl }));
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 80);
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: editingPost ? prev.slug : generateSlug(title),
    }));
  };

  const savePost = async () => {
    if (!formData.title.trim() || !formData.slug.trim()) {
      toast.error("Title and slug are required");
      return;
    }

    setSaving(true);
    try {
      const postData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content || null,
        excerpt: formData.excerpt || null,
        meta_description: formData.meta_description || null,
        featured_image_url: formData.featured_image_url || null,
        seo_keywords: formData.seo_keywords ? formData.seo_keywords.split(",").map(k => k.trim()).filter(Boolean) : [],
        long_tail_queries: formData.long_tail_queries ? formData.long_tail_queries.split(",").map(q => q.trim()).filter(Boolean) : [],
        author_name: formData.author_name || null,
        status: formData.status,
        published_at: formData.status === "published" && !editingPost?.published_at ? new Date().toISOString() : editingPost?.published_at,
      };

      if (editingPost) {
        const { error } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", editingPost.id);

        if (error) throw error;
        toast.success("Blog post updated");
      } else {
        const { error } = await supabase
          .from("blog_posts")
          .insert([postData]);

        if (error) throw error;
        toast.success("Blog post created");
      }

      setIsDialogOpen(false);
      fetchPosts();
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save blog post");
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Blog post deleted");
      fetchPosts();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error("Failed to delete blog post");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-4xl font-black tracking-tighter">Website SEAL Generator</h1>
              <p className="text-muted-foreground mt-2">
                Create, edit, and manage website content with AI assistance
              </p>
            </div>
            
            <Button onClick={openNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </div>

          <Tabs defaultValue="posts" className="space-y-6">
            <TabsList>
              <TabsTrigger value="posts">
                <FileText className="h-4 w-4 mr-2" />
                All Content
              </TabsTrigger>
              <TabsTrigger value="generate">
                <Sparkles className="h-4 w-4 mr-2" />
                SEAL Generator
              </TabsTrigger>
            </TabsList>

            {/* Posts Tab */}
            <TabsContent value="posts">
              <Card>
                <CardHeader>
                  <CardTitle>Website Content</CardTitle>
                  <CardDescription>
                    {posts.length} total items • {posts.filter(p => p.status === "published").length} published
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {posts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No blog posts yet</p>
                      <p className="text-sm">Create your first post or use AI to generate one</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {posts.map((post) => (
                          <TableRow key={post.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{post.title}</p>
                                <p className="text-sm text-muted-foreground">/blog/{post.slug}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={post.status === "published" ? "default" : "secondary"}>
                                {post.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(post.created_at).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {post.status === "published" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(post)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deletePost(post.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Generator Tab */}
            <TabsContent value="generate">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Website SEAL Generator
                  </CardTitle>
                  <CardDescription>
                    Generate AEO-optimized website content with AI. The content will match your brand's snarky, irreverent tone.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Blog Topic *</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., Why snarky shirts are the best conversation starters"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="context">Additional Context (optional)</Label>
                    <Textarea
                      id="context"
                      placeholder="Any specific points, keywords, or angle you want the AI to focus on..."
                      value={aiContext}
                      onChange={(e) => setAiContext(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button 
                    onClick={generateWithAI} 
                    disabled={generating || !aiTopic.trim()}
                    className="w-full"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Blog Post
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    AI-generated content will open in the editor for review before saving.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "Edit Blog Post" : "Create Blog Post"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="form-title">Title *</Label>
                <Input
                  id="form-title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Blog post title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="form-slug">Slug *</Label>
                <Input
                  id="form-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-friendly-slug"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-excerpt">Excerpt</Label>
              <Textarea
                id="form-excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Short preview for blog listings..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-content">Content (Markdown)</Label>
              <Textarea
                id="form-content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your blog post in Markdown..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="form-meta">Meta Description</Label>
                <Textarea
                  id="form-meta"
                  value={formData.meta_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="SEO meta description (under 160 chars)..."
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.meta_description.length}/160 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label>Featured Image</Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      id="form-image"
                      value={formData.featured_image_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                      placeholder="https://... or upload below"
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="flex-1"
                    />
                    {uploadingImage && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {formData.featured_image_url && (
                    <div className="relative w-32 h-20 rounded-md overflow-hidden border">
                      <img 
                        src={formData.featured_image_url} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="form-keywords">SEO Keywords (comma-separated)</Label>
                <Input
                  id="form-keywords"
                  value={formData.seo_keywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo_keywords: e.target.value }))}
                  placeholder="snarky shirts, funny apparel, graphic tees"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-queries">Long-tail Queries (comma-separated)</Label>
                <Input
                  id="form-queries"
                  value={formData.long_tail_queries}
                  onChange={(e) => setFormData(prev => ({ ...prev, long_tail_queries: e.target.value }))}
                  placeholder="best snarky shirts for introverts"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="form-author">Author Name</Label>
                <Input
                  id="form-author"
                  value={formData.author_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                  placeholder="Author name (optional)"
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {formData.status === "published" ? "Visible to public" : "Hidden draft"}
                  </p>
                </div>
                <Switch
                  checked={formData.status === "published"}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, status: checked ? "published" : "draft" }))
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={savePost} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {editingPost ? "Update" : "Create"} Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
