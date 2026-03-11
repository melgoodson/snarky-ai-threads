import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Mail, MessageSquare, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    // Simulate sending (replace with actual email/backend integration)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Message sent! We'll get back to you within 24–48 hours.");
    setFormData({ name: "", email: "", subject: "", message: "" });
    setSending(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <section className="py-16 md:py-24">
          <div className="container px-4 max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                GET IN <span className="text-primary">TOUCH</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Got questions? We've got snarky answers. And helpful ones too.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="p-6 text-center">
                <Mail className="h-8 w-8 mx-auto mb-4 text-primary" />
                <h3 className="font-bold mb-2">Email Us</h3>
                <a
                  href="mailto:support@snarkyhumans.com"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  support@snarkyhumans.com
                </a>
              </Card>

              <Card className="p-6 text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-4 text-primary" />
                <h3 className="font-bold mb-2">Social Media</h3>
                <p className="text-sm text-muted-foreground">
                  DM us on Instagram or Facebook
                </p>
              </Card>

              <Card className="p-6 text-center">
                <Clock className="h-8 w-8 mx-auto mb-4 text-primary" />
                <h3 className="font-bold mb-2">Response Time</h3>
                <p className="text-sm text-muted-foreground">
                  24–48 hours on business days
                </p>
              </Card>
            </div>

            <Card className="p-8">
              <h2 className="text-2xl font-black mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <textarea
                    id="message"
                    className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <Button type="submit" size="lg" disabled={sending}>
                  {sending ? "SENDING..." : "SEND MESSAGE"}
                </Button>
              </form>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
