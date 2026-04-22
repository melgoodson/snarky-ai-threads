import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductGrid } from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";
import { Coffee, Monitor, MessageSquare, Clock } from "lucide-react";

const CoworkerGiftsLanding = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Helmet>
                <title>Funny Coworker Gifts & Office Gag Gifts | Snarky A$$ Apparel</title>
                <meta name="description" content="Survive the corporate grind with funny coworker gifts. Passive-aggressive mugs, sarcastic office hoodies, and snarky stuff for the work bestie." />
                <link rel="canonical" href="https://www.snarkyazzhumans.com/category/funny-coworker-gifts" />
            </Helmet>
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="py-20 md:py-32 bg-card text-center relative overflow-hidden border-b border-border">
                    <div className="container px-4 relative z-10 max-w-4xl mx-auto">
                        <span className="text-sm font-bold text-primary uppercase tracking-widest">Survive The 9-to-5</span>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mt-4 mb-6">
                            GIFTS FOR THE <span className="text-primary">WORK BESTIE</span>
                        </h1>
                        <p className="text-xl text-muted-foreground font-medium mb-8 leading-relaxed max-w-2xl mx-auto">
                            Let's be honest, half your meetings could have been an email. Help your favorite coworker survive the corporate grind with our office-approved (mostly) sarcastic gifts.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Button variant="hero" size="xl" className="group text-lg" onClick={() => {
                                const productsEl = document.getElementById('products');
                                productsEl?.scrollIntoView({ behavior: 'smooth' });
                            }}>
                                BROWSE OFFICE GEAR
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Office Humor Block */}
                <section className="py-16 bg-background">
                    <div className="container px-4">
                        <h2 className="text-3xl font-black text-center mb-12">ESSENTIAL OFFICE <span className="text-primary">SURVIVAL TACTICS</span></h2>
                        <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
                            {[
                                { icon: Coffee, title: "The Morning Shield", desc: "A mug that clearly states 'Do Not Talk To Me Yet.'" },
                                { icon: Monitor, title: "Zoom Call Friendly", desc: "Hoodies that look professional-ish on camera." },
                                { icon: MessageSquare, title: "Passive Aggressive", desc: "Say what everyone is thinking, but on a tote bag." },
                                { icon: Clock, title: "Friday Energy", desc: "Apparel for when you've physically, but not mentally, clocked in." }
                            ].map((feature, i) => (
                                <div key={i} className="flex flex-col items-center space-y-3">
                                    <div className="p-4 rounded-full bg-primary/10 text-primary">
                                        <feature.icon className="h-8 w-8" />
                                    </div>
                                    <h3 className="font-bold text-lg">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div id="products" className="py-16 bg-card/30">
                    <div className="container mx-auto px-4">
                        <ProductGrid />
                    </div>
                </div>

                {/* Specific FAQ Section */}
                <section className="py-16 bg-card border-t border-border">
                    <div className="container px-4 max-w-4xl mx-auto">
                        <h2 className="text-3xl font-black mb-8">Office Gifting Guidelines</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-bold">What's the best gift for Boss's Day?</h3>
                                <p className="text-muted-foreground mt-2">
                                    If your boss has a great sense of humor, a snarky coffee mug or a sarcastic desk accessory makes the perfect statement. It shows you appreciate them without kissing up too hard.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Are these appropriate for secret Santa?</h3>
                                <p className="text-muted-foreground mt-2">
                                    Absolutely. For office Secret Santa under $25, our snarky mugs and tote bags are always a hit. Just make sure you know who you're drawing—we've got varying levels of snark to match their personality.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Can I send it directly to my coworker?</h3>
                                <p className="text-muted-foreground mt-2">
                                    Yes! Simply put their office or home address as the shipping destination. Since we print on demand, the package arrives fresh and ready to make their day.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default CoworkerGiftsLanding;
