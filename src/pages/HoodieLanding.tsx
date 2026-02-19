import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Camera, Shield, Truck, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AIMockupGenerator } from "@/components/AIMockupGenerator";
import rbfChampion from "@/assets/rbf-champion.png";

const HoodieLanding = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero — split layout like blankets */}
                <section className="py-20 md:py-32 bg-gradient-to-br from-background via-card to-background relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.08)_0%,transparent_70%)]" />
                    <div className="container px-4 relative z-10">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <span className="text-sm font-bold text-primary uppercase tracking-widest">Cozy Meets Snarky</span>
                                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mt-4 mb-6">
                                    SNARKY <span className="text-primary">HOODIES</span>
                                </h1>
                                <p className="text-xl text-muted-foreground font-medium mb-8 leading-relaxed">
                                    Premium fleece-lined hoodies with bold graphics. 50/50 cotton-poly blend, kangaroo pocket, ribbed cuffs. Because cozy and snarky aren't mutually exclusive.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 items-start">
                                    <Button variant="hero" size="xl" className="group text-lg" onClick={() => navigate('/custom-design')}>
                                        DESIGN YOUR OWN
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                    <Button variant="outline" size="xl" className="text-lg" onClick={() => navigate('/designs')}>
                                        BROWSE DESIGNS
                                    </Button>
                                </div>
                                <p className="text-3xl font-black mt-6">Starting at <span className="text-primary">$39.99</span></p>
                            </div>
                            <div className="flex justify-center">
                                <img
                                    src="/images/hoodie-mockup.png"
                                    alt="Snarky hoodie product mockup"
                                    className="w-full max-w-md rounded-xl shadow-2xl border border-border"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        if (target.src !== rbfChampion) {
                                            target.src = rbfChampion;
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works — numbered steps */}
                <section className="py-16 md:py-24 bg-card/50">
                    <div className="container px-4">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-center mb-12">
                            HOW IT <span className="text-primary">WORKS</span>
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            {[
                                { step: "01", icon: Camera, title: "Pick Your Design", desc: "Choose from our snarky collection or create a custom design with AI. Every graphic is printed to perfection." },
                                { step: "02", icon: Heart, title: "We Print & QC", desc: "DTG-printed on premium fleece-lined blanks. Double-lined hood, matching drawstrings, quality-checked before shipping." },
                                { step: "03", icon: Truck, title: "Delivered to You", desc: "Ships within 3–7 business days. Arrives ready to wear, cozy up, or gift." },
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

                {/* Material & Sizes — card grid */}
                <section className="py-16 md:py-24">
                    <div className="container px-4">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-center mb-4">
                            THREE <span className="text-primary">SIZES</span>
                        </h2>
                        <p className="text-muted-foreground text-lg text-center mb-12 font-medium max-w-xl mx-auto">
                            50/50 cotton-poly blend. Fleece-lined. Kangaroo pocket. Ribbed cuffs and waistband.
                        </p>
                        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            {[
                                { size: "S – M", label: "Regular Fit", desc: "True-to-size for a classic hoodie look. Perfect for layering or wearing on its own.", price: "From $39.99" },
                                { size: "L – XL", label: "Relaxed Fit", desc: "A bit more room for maximum comfort. Ideal for everyday wear and cozy nights in.", price: "From $39.99" },
                                { size: "2XL – 3XL", label: "Oversized Fit", desc: "Big, bold, and extra cozy. For those who like their hoodies roomy and their snark louder.", price: "From $44.99" },
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

                {/* Why Our Hoodies — card grid like occasions */}
                <section className="py-16 md:py-24 bg-card/50">
                    <div className="container px-4">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-center mb-4">
                            WHY OUR <span className="text-primary">HOODIES?</span>
                        </h2>
                        <p className="text-muted-foreground text-lg text-center mb-12 font-medium">
                            Not your average hoodie. Every detail is built for comfort, durability, and maximum snark.
                        </p>
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            {[
                                { emoji: "🎨", title: "Bold Graphics", desc: "High-quality DTG printing that stays vibrant wash after wash" },
                                { emoji: "🧵", title: "Premium Construction", desc: "Double-lined hood, matching drawstrings, twin needle stitching" },
                                { emoji: "☁️", title: "Fleece-Lined", desc: "Soft fleece interior for all-day, all-season warmth" },
                                { emoji: "👕", title: "Kangaroo Pocket", desc: "Front pouch pocket for hands, snacks, or hiding from small talk" },
                                { emoji: "💪", title: "Ribbed Cuffs", desc: "1×1 ribbed cuffs and waistband for shape retention" },
                                { emoji: "🚚", title: "Made to Order", desc: "Printed on demand — no waste, no compromise on quality" },
                            ].map((item) => (
                                <div key={item.title} className="flex items-start gap-4 bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all">
                                    <span className="text-3xl">{item.emoji}</span>
                                    <div>
                                        <h3 className="font-bold text-lg">{item.title}</h3>
                                        <p className="text-muted-foreground text-sm">{item.desc}</p>
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
                                    TRY IT <span className="text-primary">ON</span>
                                </h2>
                                <p className="text-muted-foreground text-lg font-medium">
                                    Upload your photo and see how our hoodies look on you — powered by AI.
                                </p>
                            </div>
                            <AIMockupGenerator
                                productImage={rbfChampion}
                                productTitle="Snarky Hoodie"
                                productColor="Black"
                            />
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 md:py-24 text-center">
                    <div className="container px-4">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">
                            SNARK UP, <span className="text-primary">BUNDLE UP</span>
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8 font-medium">
                            Cozy never looked this dangerous.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button variant="hero" size="xl" className="group text-lg" onClick={() => navigate('/custom-design')}>
                                DESIGN YOUR OWN
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

export default HoodieLanding;
