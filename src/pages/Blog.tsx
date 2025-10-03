import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Blog = () => {
  const blogPosts = [
    {
      title: "The Rise of Snarky Apparel: Why Humor Sells",
      excerpt: "Explore how snarky, irreverent designs have taken over the apparel industry and why customers can't get enough of edgy humor.",
      date: "March 15, 2024",
      category: "Industry Trends",
      readTime: "5 min read"
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

  return (
    <div className="min-h-screen flex flex-col">
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
                    <button className="mt-4 text-primary font-medium hover:underline">
                      Read More →
                    </button>
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
