import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Heart, Truck, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AIMockupGenerator } from "@/components/AIMockupGenerator";
import notebookMockup from "/images/notebook-mockup.png";

const OCCASIONS = [
    { emoji: "📓", title: "Daily Journaling", desc: "Write down your goals, daily rants, or secrets" },
    { emoji: "🎓", title: "Graduation & School", desc: "The perfect custom companion for lectures and notes" },
    { emoji: "💼", title: "Office & Work", desc: "Bring some attitude to your boring team meetings" },
    { emoji: "🎁", title: "Personalized Gift", desc: "A thoughtful notebook they'll actually use daily" },
    { emoji: "🎨", title: "Sketches & Ideas", desc: "Capture your sudden bursts of creative genius" },
    { emoji: "🎄", title: "Holiday Exchange", desc: "The white elephant gift that everyone will fight for" },
];

const JournalLanding = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col">
            <Helmet>
                <title>Custom Hardcover Journals &amp; Notebooks | Snarky</title>
                <meta name="description" content="Design custom hardcover journals and notebooks. Premium matte finishes make the perfect personalized gift for writing down all your snarky thoughts." />
                <link rel="canonical" href="https://www.snarkyhumans.com/journals" />
            </Helmet>
            <Header />
            <main className="flex-1">
                {/* Hero */}
                <section className="py-20 md:py-32 bg-gradient-to-br from-background via-card to-background relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.08)_0%,transparent_70%)]" />
                    <div className="container px-4 relative z-10">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <span className="text-sm font-bold text-primary uppercase tracking-widest">NEW • #1 Office Gift</span>
                                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mt-4 mb-6">
                                    CUSTOM <span className="text-primary">JOURNALS</span>
                                </h1>
                                <p className="text-xl text-muted-foreground font-medium mb-8 leading-relaxed">
                                    Write down your thoughts, rants, or million-dollar ideas in style. Premium matte hardcover. 150 ruled pages. Vibrant custom prints.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 items-start">
                                    <Button variant="hero" size="xl" className="group text-lg" onClick={() => navigate('/custom-design')}>
                                        DESIGN YOUR JOURNAL
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                    <Button variant="outline" size="xl" className="text-lg" onClick={() => navigate('/designs')}>
                                        BROWSE DESIGNS
                                    </Button>
                                </div>
                                <div className="mt-6 flex items-center gap-2">
                                    <p className="text-3xl font-black">Starting at <span className="text-primary">$19.99</span></p>
                                    <span className="text-lg text-muted-foreground line-through">$29.99</span>
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <img
                                    src={notebookMockup}
                                    alt="Custom personalized hardcover journal notebook"
                                    className="w-full max-w-sm rounded-xl shadow-2xl border border-border bg-white p-4"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-16 md:py-24 bg-card/50">
                    <div className="container px-4">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-center mb-12">
                            HOW IT <span className="text-primary">WORKS</span>
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            {[
                                { step: "01", icon: BookOpen, title: "Choose Your Design", desc: "Select from our library of snarky templates or generate custom cover art using AI." },
                                { step: "02", icon: Heart, title: "We Print & QC", desc: "High-definition matte finish printing on both front and back covers. Individually checked." },
                                { step: "03", icon: Truck, title: "Delivered to You", desc: "Ethically printed on demand and shipped within 3–5 business days. Ready to use." },
                            ].map((item) => (
                                <div key={item.step} className="text-center space-y-4">
                                    <div className="text-5xl font-black text-primary/20">{item.step}</div>
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

                {/* Specs */}
                <section className="py-16 md:py-24">
                    <div className="container px-4">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-center mb-4">
                            PREMIUM <span className="text-primary">SPECS</span>
                        </h2>
                        <p className="text-muted-foreground text-lg text-center mb-12 font-medium max-w-xl mx-auto">
                            Quality materials that make writing down your internal monologue feel extra satisfying.
                        </p>
                        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            {[
                                { spec: "5.7\" × 8\" (A5)", label: "Perfect Size", desc: "Fits easily into backpacks, messenger bags, or desk drawers for quick thoughts." },
                                { spec: "150 Ruled Pages", label: "Premium Paper", desc: "Plenty of room for ideas, daily reflections, checklist tasks, or doodles." },
                                { spec: "Matte Cover", label: "Durable Hardcover", desc: "Sturdy hardback binding with a premium smooth matte coating that feels amazing." },
                            ].map((item) => (
                                <div key={item.spec} className="bg-card border border-border rounded-xl p-8 text-center hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)]">
                                    <h3 className="text-3xl font-black text-primary mb-2">{item.spec}</h3>
                                    <p className="text-lg font-bold mb-3">{item.label}</p>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Gift Occasions */}
                <section className="py-16 md:py-24 bg-card/50">
                    <div className="container px-4">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-center mb-4">
                            PERFECT FOR <span className="text-primary">EVERY OCCASION</span>
                        </h2>
                        <p className="text-muted-foreground text-lg text-center mb-12 font-medium">
                            No generic notebooks — just pure attitude and custom style.
                        </p>
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            {OCCASIONS.map((occ) => (
                                <div key={occ.title} className="flex items-start gap-4 bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all">
                                    <span className="text-3xl">{occ.emoji}</span>
                                    <div>
                                        <h3 className="font-bold text-lg">{occ.title}</h3>
                                        <p className="text-muted-foreground text-sm">{occ.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* AI Preview */}
                <section className="py-16 md:py-24">
                    <div className="container px-4">
                        <div className="max-w-2xl mx-auto">
                            <div className="text-center mb-8">
                                <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                                    PREVIEW YOUR <span className="text-primary">JOURNAL</span>
                                </h2>
                                <p className="text-muted-foreground text-lg font-medium">
                                    Upload a photo and see a preview of your custom notebook cover.
                                </p>
                            </div>
                            <AIMockupGenerator
                                productImage={notebookMockup}
                                productTitle="Custom Hardcover Journal"
                                productColor="White"
                            />
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 md:py-24 text-center">
                    <div className="container px-4">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">
                            YOUR DESIGNS, <span className="text-primary">YOUR JOURNAL</span>
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8 font-medium">
                            The custom notebook you'll actually want to carry around.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button variant="hero" size="xl" className="group text-lg" onClick={() => navigate('/custom-design')}>
                                DESIGN YOURS NOW
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button variant="outline" size="xl" className="text-lg" onClick={() => navigate('/designs')}>
                                BROWSE DESIGNS
                              </Button>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default JournalLanding;
