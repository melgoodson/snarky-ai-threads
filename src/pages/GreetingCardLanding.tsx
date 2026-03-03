import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Sparkles, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AIMockupGenerator } from "@/components/AIMockupGenerator";

const OCCASIONS = [
    { emoji: "🎂", title: "Birthdays", desc: "Because 'Happy Birthday' in Comic Sans just won't cut it" },
    { emoji: "💕", title: "Valentine's Day", desc: "For the love that deserves more than a generic heart" },
    { emoji: "🎄", title: "Christmas", desc: "When you want to spread cheer — with a side of snark" },
    { emoji: "🎓", title: "Graduation", desc: "Congrats, you did it. Now the real fun begins." },
    { emoji: "👶", title: "New Baby", desc: "Welcome to the world, tiny human. Your parents need sleep." },
    { emoji: "💍", title: "Wedding", desc: "For the couple who swipes right on sarcasm" },
];

const GreetingCardLanding = () => {
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
                                <span className="text-sm font-bold text-primary uppercase tracking-widest">5×7 • Coated One Side • Premium Stock</span>
                                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mt-4 mb-6">
                                    SNARKY <span className="text-primary">GREETING CARDS</span>
                                </h1>
                                <p className="text-xl text-muted-foreground font-medium mb-8 leading-relaxed">
                                    For when Hallmark is too wholesome. Bold, funny, and guaranteed to get a genuine laugh — not a polite one.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 items-start">
                                    <Button variant="hero" size="xl" className="group text-lg" onClick={() => navigate('/designs')}>
                                        BROWSE DESIGNS
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                    <Button variant="outline" size="xl" className="group text-lg" onClick={() => navigate('/custom-design?product=card')}>
                                        <Sparkles className="mr-2 h-5 w-5" />
                                        CUSTOMIZE YOUR OWN
                                    </Button>
                                </div>
                                <div className="mt-6 flex items-center gap-2">
                                    <p className="text-3xl font-black">Starting at <span className="text-primary">$4.99</span></p>
                                    <span className="text-lg text-muted-foreground line-through">$24.99</span>
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <img
                                    src="/images/greeting-card-hero.png"
                                    alt="Premium greeting card product mockup"
                                    className="w-full max-w-md rounded-xl shadow-2xl border border-border object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Specs */}
                <section className="py-16 md:py-24 bg-card/50">
                    <div className="container px-4">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-center mb-12">
                            CARD <span className="text-primary">DETAILS</span>
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            {[
                                { icon: Sparkles, title: "Premium Stock", desc: "Thick, high-quality card stock with a smooth, professional feel. No flimsy paper here." },
                                { icon: Heart, title: "Coated One Side", desc: "Glossy front for vibrant artwork, matte interior for writing your personal message." },
                                { icon: Send, title: "5×7 Standard Size", desc: "Fits standard envelopes. Easy to mail, display, or tuck into a gift." },
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

                        {/* Card specs badges */}
                        <div className="flex flex-wrap justify-center gap-3 mt-10">
                            {["5×7 inches", "Coated one side", "Premium card stock", "Envelope included"].map((spec) => (
                                <span key={spec} className="text-sm font-semibold bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20">
                                    {spec}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Occasions */}
                <section className="py-16 md:py-24">
                    <div className="container px-4">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-center mb-4">
                            PERFECT FOR <span className="text-primary">EVERY OCCASION</span>
                        </h2>
                        <p className="text-muted-foreground text-lg text-center mb-12 font-medium">
                            When you care enough to send the very snarkiest.
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
                                    PREVIEW YOUR <span className="text-primary">CARD</span>
                                </h2>
                                <p className="text-muted-foreground text-lg font-medium">
                                    Upload a design and see how it looks on a greeting card — powered by AI.
                                </p>
                            </div>
                            <AIMockupGenerator
                                productImage="/images/greeting-card-mockup.png"
                                productTitle="Greeting Card"
                                productColor="White"
                            />
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 md:py-24 text-center">
                    <div className="container px-4">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">
                            SAY IT WITH <span className="text-primary">SNARK</span>
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8 font-medium">
                            The card they'll actually keep on the shelf.
                        </p>
                        <Button variant="hero" size="xl" className="group text-lg" onClick={() => navigate('/designs')}>
                            SHOP GREETING CARDS
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default GreetingCardLanding;
