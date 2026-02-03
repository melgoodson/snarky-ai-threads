import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, User, Clock, Loader2 } from "lucide-react";

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
}

// Simple markdown to HTML conversion
function renderMarkdown(content: string): string {
  return content
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>')
    // Lists
    .replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p class="mb-4">')
    // Line breaks
    .replace(/\n/g, '<br />');
}

export default function BlogPostDynamic() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
  }, [slug]);

  const fetchPost = async (postSlug: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", postSlug)
        .eq("status", "published")
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        setNotFound(true);
        return;
      }

      setPost(data as BlogPost);
      fetchRelatedPosts(data.id);
    } catch (error) {
      console.error("Error fetching post:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (currentPostId: string) => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, published_at, featured_image_url")
        .eq("status", "published")
        .neq("id", currentPostId)
        .order("published_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      setRelatedPosts((data as BlogPost[]) || []);
    } catch (error) {
      console.error("Error fetching related posts:", error);
    }
  };

  const estimateReadTime = (content: string | null): string => {
    if (!content) return "1 min read";
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const blogPostSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.meta_description || post.excerpt,
    "datePublished": post.published_at,
    "dateModified": post.published_at,
    "author": {
      "@type": "Person",
      "name": post.author_name || "Snarky Humans Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Snarky Humans",
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${window.location.origin}/blog/${post.slug}`
    },
    ...(post.featured_image_url && { "image": post.featured_image_url })
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{post.title} | Snarky A$$ Humans Blog</title>
        <meta name="description" content={post.meta_description || post.excerpt || ""} />
        {post.seo_keywords && post.seo_keywords.length > 0 && (
          <meta name="keywords" content={post.seo_keywords.join(", ")} />
        )}
        <link rel="canonical" href={`${window.location.origin}/blog/${post.slug}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.meta_description || post.excerpt || ""} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${window.location.origin}/blog/${post.slug}`} />
        {post.featured_image_url && (
          <meta property="og:image" content={post.featured_image_url} />
        )}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.meta_description || post.excerpt || ""} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(blogPostSchema)}
        </script>
      </Helmet>

      <Header />

      <main className="flex-1">
        <article className="container px-4 py-12">
          <div className="max-w-3xl mx-auto">
            {/* Back link */}
            <Link 
              to="/blog" 
              className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>

            {/* Featured Image */}
            {post.featured_image_url && (
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
              />
            )}

            {/* Header */}
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {post.author_name && (
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {post.author_name}
                  </span>
                )}
                {post.published_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.published_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {estimateReadTime(post.content)}
                </span>
              </div>

              {/* Keywords */}
              {post.seo_keywords && post.seo_keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {post.seo_keywords.slice(0, 5).map((keyword, index) => (
                    <Badge key={index} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              )}
            </header>

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:text-muted-foreground prose-a:text-primary"
              dangerouslySetInnerHTML={{ 
                __html: `<p class="mb-4">${renderMarkdown(post.content || "")}</p>` 
              }}
            />

            {/* CTA */}
            <div className="mt-12 p-8 bg-primary/5 rounded-lg text-center">
              <h3 className="text-xl font-bold mb-2">Ready to wear your snark?</h3>
              <p className="text-muted-foreground mb-4">
                Check out our collection of snarky apparel and express yourself.
              </p>
              <Button asChild>
                <Link to="/#products">Shop Now</Link>
              </Button>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="container px-4 py-12 border-t">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-8">More from the Blog</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Card key={relatedPost.id} className="hover:shadow-lg transition-shadow">
                    {relatedPost.featured_image_url && (
                      <img
                        src={relatedPost.featured_image_url}
                        alt={relatedPost.title}
                        className="w-full h-40 object-cover rounded-t-lg"
                      />
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">
                        {relatedPost.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-2 mb-4">
                        {relatedPost.excerpt}
                      </p>
                      <Link 
                        to={`/blog/${relatedPost.slug}`}
                        className="text-primary font-medium hover:underline"
                      >
                        Read More →
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
