import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductGrid } from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";
import { Gift, Laugh, Package, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WhiteElephantLanding = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col">
            <Helmet>
                <title>Best White Elephant Gifts Under $25 and $50 | Snarky A$$ Apparel</title>
                <meta name="description" content="Win the office holiday party or family exchange with hilarious white elephant gifts. Sarcastic mugs, funny tees, and snarky stuff people will actually fight to steal." />
                <link rel="canonical" href="https://www.snarkyazzhumans.com/category/white-elephant-gifts" />
            </Helmet>
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="py-20 md:py-32 bg-card text-center relative overflow-hidden border-b border-border">
                    <div className="container px-4 relative z-10 max-w-4xl mx-auto">
                        <span className="text-sm font-bold text-primary uppercase tracking-widest">The Ultimate Party Winner</span>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mt-4 mb-6">
                            GIFTS THEY'LL <span className="text-primary">ACTUALLY</span> STEAL
                        </h1>
                        <p className="text-xl text-muted-foreground font-medium mb-8 leading-relaxed max-w-2xl mx-auto">
                            The secret to winning a white elephant exchange is bringing something everyone desperately wants. Forget the cheap plastic junk—bring premium snark.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Button variant="hero" size="xl" className="group text-lg" onClick={() => {
                                const productsEl = document.getElementById('products');
                                productsEl?.scrollIntoView({ behavior: 'smooth' });
                            }}>
                                SHOP WHITE ELEPHANT
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Value Add / Buyer Differentiator */}
                <section className="py-16 bg-background">
                    <div className="container px-4">
                        <h2 className="text-3xl md:text-4xl font-black text-center mb-12">WHY OUR GIFTS <span className="text-primary">WIN</span></h2>
                        <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
                            {[
                                { icon: Laugh, title: "Unfiltered Humor", desc: "No boring corporate jokes here. Pure edge and sarcasm." },
                                { icon: Star, title: "Premium Quality", desc: "Heavyweight cotton, plush blankets, and durable ceramics." },
                                { icon: Gift, title: "Budget Friendly", desc: "Under $25 and under $50 options to fit party rules." },
                                { icon: Package, title: "Direct Shipping", desc: "We print and ship within 3-7 days straight to your door." }
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
                        <h2 className="text-3xl font-black mb-8">White Elephant & Gag Gift FAQ</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-bold">What is the best white elephant gift under $25?</h3>
                                <p className="text-muted-foreground mt-2">
                                    Our snarky 11oz and 15oz coffee mugs are the perfect under-$25 gift. They're affordable, high-quality ceramic, and incredibly funny, meaning they fit almost every budget constraint without feeling cheap.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Will these gifts get me fired from the office party?</h3>
                                <p className="text-muted-foreground mt-2">
                                    We have a range of options from "mildly sarcastic" to "definitely borderline." Use your best judgment based on how chill HR is. For coworkers, our passive-aggressive meeting mugs usually ride the safe line perfectly.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">How fast do these ship for the holidays?</h3>
                                <p className="text-muted-foreground mt-2">
                                    Everything is made-to-order. Most items ship within 3-7 business days, but during the heavy holiday season (November/December), please allow a few extra days for printing. Order early to guarantee you have your gift before the exchange!
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

export default WhiteElephantLanding;
