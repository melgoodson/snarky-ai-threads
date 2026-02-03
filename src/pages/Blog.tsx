import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string | null;
  seo_keywords: string[];
  featured_image_url: string | null;
}

// Static posts for backwards compatibility
const staticPosts = [
  {
    id: "static-1",
    title: "How Funny Snarky Shirts Make You New Friends: The Ultimate Ice Breaker",
    excerpt: "Discover why wearing snarky, funny graphic tees is the secret weapon for making friends, starting conversations, and building instant connections with like-minded people.",
    published_at: "2024-03-15",
    seo_keywords: ["Lifestyle & Culture"],
    slug: "funny-snarky-shirts-make-friends",
    featured_image_url: null,
    readTime: "8 min read",
  },
];

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, published_at, seo_keywords, featured_image_url")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (error) throw error;
      
      // Combine database posts with static posts
      const dbPosts = (data as BlogPost[]) || [];
      // Filter out any static post that has a matching slug in database
      const filteredStatic = staticPosts.filter(
        sp => !dbPosts.some(dp => dp.slug === sp.slug)
      );
      setPosts([...dbPosts, ...filteredStatic]);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts(staticPosts);
    } finally {
      setLoading(false);
    }
  };

  const estimateReadTime = (excerpt: string | null): string => {
    if (!excerpt) return "3 min read";
    const words = excerpt.split(/\s+/).length;
    const minutes = Math.max(3, Math.ceil(words / 50));
    return `${minutes} min read`;
  };

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Snarky A$$ Threads Blog",
    "description": "Tips, stories, and insights from the world of snarky apparel",
    "url": `${window.location.origin}/blog`,
    "blogPost": posts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "datePublished": post.published_at,
      "author": {
        "@type": "Organization",
        "name": "Snarky Humans"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Snarky Humans",
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/logo.png`
        }
      }
    }))
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Blog - Snarky A$$ Humans Presents Snarky A$$ Apparel | Humor Apparel Tips & Stories</title>
        <meta name="description" content="Discover tips, stories, and insights about snarky apparel. Learn about our Spicy Meter, care tips for graphic tees, gifting guides, and the culture of irreverent humor." />
        <meta name="keywords" content="snarky apparel blog, graphic tee tips, humor tshirt guide, spicy meter explained, bachelor party gifts, tshirt care, irreverent fashion, edgy humor apparel" />
        <link rel="canonical" href={`${window.location.origin}/blog`} />
        
        {/* Open Graph */}
        <meta property="og:title" content="Blog - Snarky A$$ Threads | Humor Apparel Insights" />
        <meta property="og:description" content="Tips, stories, and insights from the world of snarky apparel. Learn about designs, care, and irreverent humor culture." />
        <meta property="og:type" content="blog" />
        <meta property="og:url" content={`${window.location.origin}/blog`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog - Snarky A$$ Threads" />
        <meta name="twitter:description" content="Tips and insights from the world of snarky, irreverent apparel." />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(blogSchema)}
        </script>
      </Helmet>
      <Header />
      <main className="flex-1">
        <section className="container px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-center">
              Blog
            </h1>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Tips, stories, and insights from the world of snarky apparel. Learn about our designs, care tips, and the culture of irreverent humor.
            </p>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow flex flex-col">
                    {post.featured_image_url && (
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    )}
                    <CardHeader className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {post.seo_keywords && post.seo_keywords[0] && (
                          <Badge variant="secondary">{post.seo_keywords[0]}</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {estimateReadTime(post.excerpt)}
                        </span>
                      </div>
                      <CardTitle className="text-xl mb-2 line-clamp-2">{post.title}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {post.published_at && new Date(post.published_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-3 mb-4">{post.excerpt}</p>
                      <Link 
                        to={`/blog/${post.slug}`} 
                        className="inline-block text-primary font-medium hover:underline"
                      >
                        Read More →
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && posts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No blog posts yet. Check back soon!</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
