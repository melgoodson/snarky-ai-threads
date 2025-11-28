import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Blog = () => {
  const blogPosts = [
    {
      title: "How Funny Snarky Shirts Make You New Friends: The Ultimate Ice Breaker",
      excerpt: "Discover why wearing snarky, funny graphic tees is the secret weapon for making friends, starting conversations, and building instant connections with like-minded people.",
      date: "March 15, 2024",
      category: "Lifestyle & Culture",
      readTime: "8 min read",
      slug: "funny-snarky-shirts-make-friends"
    },
    {
      title: "The Rise of Snarky Apparel: Why Humor Sells",
      excerpt: "Explore how snarky, irreverent designs have taken over the apparel industry and why customers can't get enough of edgy humor.",
      date: "March 15, 2024",
      category: "Industry Trends",
      readTime: "5 min read",
      slug: null
    },
    {
      title: "Understanding Our Spicy Meter: A Guide",
      excerpt: "Learn how we rate our designs from Mild to Nuclear and find the perfect level of snark for any occasion.",
      date: "March 10, 2024",
      category: "Product Guide",
      readTime: "3 min read"
    },
    {
      title: "Bachelor Party Tees: The Ultimate Group Gift Guide",
      excerpt: "Planning a bachelor or bachelorette party? Discover our most popular group designs and bundle deals.",
      date: "March 5, 2024",
      category: "Gift Ideas",
      readTime: "4 min read"
    },
    {
      title: "Caring for Your Graphic Tees: Pro Tips",
      excerpt: "Keep your snarky designs looking fresh with our expert care instructions and washing tips.",
      date: "February 28, 2024",
      category: "Care Tips",
      readTime: "3 min read"
    },
    {
      title: "The Art of Gifting Inappropriate Humor",
      excerpt: "Navigate the delicate balance of giving edgy gifts that land perfectly without crossing the line.",
      date: "February 20, 2024",
      category: "Gift Ideas",
      readTime: "6 min read"
    },
    {
      title: "Behind the Designs: Our Creative Process",
      excerpt: "Take a peek behind the curtain to see how we develop designs that make people laugh (and sometimes gasp).",
      date: "February 15, 2024",
      category: "Behind the Scenes",
      readTime: "5 min read"
    }
  ];

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Snarky A$$ Threads Blog",
    "description": "Tips, stories, and insights from the world of snarky apparel",
    "url": `${window.location.origin}/blog`,
    "blogPost": blogPosts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "datePublished": post.date,
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

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{post.category}</Badge>
                      <span className="text-xs text-muted-foreground">{post.readTime}</span>
                    </div>
                    <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {post.date}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{post.excerpt}</p>
                    {post.slug ? (
                      <a href={`/blog/${post.slug}`} className="inline-block mt-4 text-primary font-medium hover:underline">
                        Read More →
                      </a>
                    ) : (
                      <button className="mt-4 text-primary font-medium hover:underline">
                        Read More →
                      </button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
