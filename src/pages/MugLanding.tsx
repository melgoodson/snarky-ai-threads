import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Coffee, Droplets, Palette, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AIMockupGenerator } from "@/components/AIMockupGenerator";

const MugLanding = () => {
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
                                <span className="text-sm font-bold text-primary uppercase tracking-widest">Ceramic • 11oz & 15oz</span>
                                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mt-4 mb-6">
                                    MOOD <span className="text-primary">MUGS</span>
                                </h1>
                                <p className="text-xl text-muted-foreground font-medium mb-8 leading-relaxed">
                                    Start your morning with a hot take. Premium ceramic mugs with bold, snarky designs that match your pre-coffee personality.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 items-start">
                                    <Button variant="hero" size="xl" className="group text-lg" onClick={() => navigate('/designs')}>
                                        BROWSE DESIGNS
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                    <Button variant="outline" size="xl" className="group text-lg" onClick={() => navigate('/custom-design?product=mug')}>
                                        <Sparkles className="mr-2 h-5 w-5" />
                                        CUSTOMIZE YOUR OWN
                                    </Button>
                                </div>
                                <div className="mt-6 flex items-center gap-2">
                                    <p className="text-3xl font-black">Starting at <span className="text-primary">$14.99</span></p>
                                    <span className="text-lg text-muted-foreground line-through">$34.99</span>
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <img
                                    src="/images/mug-hero.png"
                                    alt="Ceramic coffee mug product mockup"
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
                            MUG <span className="text-primary">SPECS</span>
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            {[
                                { icon: Coffee, title: "Premium Ceramic", desc: "High-quality white ceramic with a glossy finish. Feels substantial in your hand." },
                                { icon: Droplets, title: "Dishwasher & Microwave Safe", desc: "Because nobody has time for hand-washing. Pop it in, heat it up, zero drama." },
                                { icon: Palette, title: "Vibrant Wrap-Around Print", desc: "Full-color sublimation printing that wraps around the mug. Won't fade or peel." },
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

                {/* Sizes */}
                <section className="py-16 md:py-24">
                    <div className="container px-4">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-center mb-12">
                            TWO <span className="text-primary">SIZES</span>
                        </h2>
                        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                            {[
                                { size: "11 oz", label: "Standard", desc: "The classic coffee mug. Perfect for your daily dose of caffeine and cynicism.", price: "$14.99" },
                                { size: "15 oz", label: "Oversized", desc: "For those mornings when one cup isn't enough. Extra room for extra attitude.", price: "$17.99" },
                            ].map((item) => (
                                <div key={item.size} className="bg-card border border-border rounded-xl p-8 text-center hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)]">
                                    <h3 className="text-3xl font-black text-primary mb-2">{item.size}</h3>
                                    <p className="text-lg font-bold mb-3">{item.label}</p>
                                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">{item.desc}</p>
                                    <p className="text-2xl font-black">{item.price}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* AI Preview */}
                <section className="py-16 md:py-24 bg-card/50">
                    <div className="container px-4">
                        <div className="max-w-2xl mx-auto">
                            <div className="text-center mb-8">
                                <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                                    PREVIEW YOUR <span className="text-primary">MUG</span>
                                </h2>
                                <p className="text-muted-foreground text-lg font-medium">
                                    Upload a design and see how it looks on a mug — powered by AI.
                                </p>
                            </div>
                            <AIMockupGenerator
                                productImage="/images/mug-mockup.png"
                                productTitle="Ceramic Mug"
                                productColor="White"
                            />
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 md:py-24 text-center">
                    <div className="container px-4">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">
                            SARCASM, <span className="text-primary">SERVED HOT</span>
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8 font-medium">
                            The mug that speaks before you've had your coffee.
                        </p>
                        <Button variant="hero" size="xl" className="group text-lg" onClick={() => navigate('/designs')}>
                            SHOP MUGS
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default MugLanding;
