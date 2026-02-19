import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag, Leaf, Ruler } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AIMockupGenerator } from "@/components/AIMockupGenerator";

const ToteBagLanding = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero */}
                <section className="py-20 md:py-32 bg-gradient-to-br from-background via-card to-background relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.08)_0%,transparent_70%)]" />
                    <div className="container px-4 relative z-10">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <span className="text-sm font-bold text-primary uppercase tracking-widest">Eco-Friendly • Made to Last</span>
                                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mt-4 mb-6">
                                    SNARKY <span className="text-primary">TOTE BAGS</span>
                                </h1>
                                <p className="text-xl text-muted-foreground font-medium mb-8 leading-relaxed">
                                    Carry your attitude everywhere. Durable canvas, bold designs, and enough room for your groceries, laptop, or emotional baggage.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 items-start">
                                    <Button variant="hero" size="xl" className="group text-lg" onClick={() => navigate('/designs')}>
                                        BROWSE DESIGNS
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                                <div className="mt-6 flex items-center gap-2">
                                    <p className="text-3xl font-black">Starting at <span className="text-primary">$18.99</span></p>
                                    <span className="text-lg text-muted-foreground line-through">$38.99</span>
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <img
                                    src="/images/tote-mockup.png"
                                    alt="Canvas tote bag product mockup"
                                    className="w-full max-w-md rounded-xl shadow-2xl border border-border object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="py-16 md:py-24 bg-card/50">
                    <div className="container px-4">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-center mb-12">
                            WHY OUR <span className="text-primary">TOTES</span>
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            {[
                                { icon: ShoppingBag, title: "Heavy-Duty Canvas", desc: "100% cotton canvas that can handle the weight of your sarcasm and your weekly haul." },
                                { icon: Leaf, title: "Eco-Friendly", desc: "Reusable, washable, and way better for the planet than single-use bags." },
                                { icon: Ruler, title: "Roomy & Practical", desc: "15\" × 16\" with reinforced handles. Fits a laptop, books, or a suspicious amount of snacks." },
                            ].map((item) => (
                                <div key={item.title} className="text-center space-y-4">
                                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/20">
                                        <item.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-black">{item.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 md:py-24 text-center">
                    <div className="container px-4">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">
                            YOUR DESIGN, <span className="text-primary">YOUR TOTE</span>
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8 font-medium">
                            Pick a design and we'll print it on a premium canvas tote bag.
                        </p>
                        <Button variant="hero" size="xl" className="group text-lg" onClick={() => navigate('/designs')}>
                            SHOP TOTE BAGS
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default ToteBagLanding;
