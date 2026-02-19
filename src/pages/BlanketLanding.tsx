import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Camera, Gift, Truck, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AIMockupGenerator } from "@/components/AIMockupGenerator";
import personalizationBlanket from "@/assets/personalization-blanket.png";

const OCCASIONS = [
    { emoji: "❤️", title: "Valentine's Day", desc: "A gift that wraps them in your love" },
    { emoji: "🎄", title: "Christmas", desc: "The personalized gift they'll actually keep" },
    { emoji: "👩", title: "Mother's Day", desc: "Because she deserves more than flowers" },
    { emoji: "👨", title: "Father's Day", desc: "For the dad who says he doesn't want anything" },
    { emoji: "🎓", title: "Graduation", desc: "Celebrate their journey in cozy style" },
    { emoji: "💍", title: "Wedding", desc: "A keepsake they'll snuggle with forever" },
];

const BlanketLanding = () => {
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
                                <span className="text-sm font-bold text-primary uppercase tracking-widest">NEW • #1 Personalized Gift</span>
                                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mt-4 mb-6">
                                    CUSTOM PHOTO <span className="text-primary">BLANKETS</span>
                                </h1>
                                <p className="text-xl text-muted-foreground font-medium mb-8 leading-relaxed">
                                    Turn your favorite photos into the coziest personalized gift ever. Premium fleece + sherpa backing. Vibrant edge-to-edge printing.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 items-start">
                                    <Button variant="hero" size="xl" className="group text-lg" onClick={() => navigate('/product/personalization-blanket')}>
                                        DESIGN YOUR BLANKET
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                    <Button variant="outline" size="xl" className="text-lg" onClick={() => navigate('/designs')}>
                                        BROWSE DESIGNS
                                    </Button>
                                </div>
                                <p className="text-3xl font-black mt-6">Starting at <span className="text-primary">$49.99</span></p>
                            </div>
                            <div className="flex justify-center">
                                <img
                                    src={personalizationBlanket}
                                    alt="Custom personalized photo blanket with family photos"
                                    className="w-full max-w-md rounded-xl shadow-2xl border border-border"
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
                                { step: "01", icon: Camera, title: "Upload Photos", desc: "Choose 1–12 of your favorite photos. Family, pets, vacations — anything goes." },
                                { step: "02", icon: Heart, title: "We Print & QC", desc: "Edge-to-edge sublimation printing. Every blanket is quality-checked before shipping." },
                                { step: "03", icon: Truck, title: "Delivered to You", desc: "Ships within 5–7 business days. Arrives ready to gift or snuggle." },
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

                {/* Material & Sizes */}
                <section className="py-16 md:py-24">
                    <div className="container px-4">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-center mb-4">
                            THREE <span className="text-primary">SIZES</span>
                        </h2>
                        <p className="text-muted-foreground text-lg text-center mb-12 font-medium max-w-xl mx-auto">
                            Premium fleece front, cozy sherpa backing. Machine washable & dryer safe.
                        </p>
                        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            {[
                                { size: '30" × 40"', label: "Baby / Lap", desc: "Perfect for baby gifts, stroller blankets, or a cozy lap throw.", price: "$49.99" },
                                { size: '50" × 60"', label: "Classic Throw", desc: "The go-to couch blanket. Great for movie nights and napping.", price: "$59.99" },
                                { size: '60" × 80"', label: "Full Size", desc: "Fits a queen bed. Maximum comfort, maximum photos.", price: "$69.99" },
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

                {/* Gift Occasions */}
                <section className="py-16 md:py-24 bg-card/50">
                    <div className="container px-4">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-center mb-4">
                            PERFECT FOR <span className="text-primary">EVERY OCCASION</span>
                        </h2>
                        <p className="text-muted-foreground text-lg text-center mb-12 font-medium">
                            No generic gifts — just your memories, wrapped in softness.
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

                {/* AI Try It On */}
                <section className="py-16 md:py-24">
                    <div className="container px-4">
                        <div className="max-w-2xl mx-auto">
                            <div className="text-center mb-8">
                                <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                                    PREVIEW YOUR <span className="text-primary">BLANKET</span>
                                </h2>
                                <p className="text-muted-foreground text-lg font-medium">
                                    Upload a photo and see a preview of your custom blanket — powered by AI.
                                </p>
                            </div>
                            <AIMockupGenerator
                                productImage={personalizationBlanket}
                                productTitle="Custom Photo Blanket"
                                productColor="Custom"
                            />
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 md:py-24 text-center">
                    <div className="container px-4">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">
                            YOUR PHOTOS, <span className="text-primary">YOUR BLANKET</span>
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8 font-medium">
                            The gift that actually means something.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button variant="hero" size="xl" className="group text-lg" onClick={() => navigate('/product/personalization-blanket')}>
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

export default BlanketLanding;
