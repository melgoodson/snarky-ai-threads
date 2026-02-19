import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Camera, Shield, Truck, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AIMockupGenerator } from "@/components/AIMockupGenerator";
import rbfChampion from "@/assets/rbf-champion.png";
import snarkyHumans from "@/assets/snarky-humans.png";
import freeHugs from "@/assets/free-hugs.png";

const FEATURED_SHIRTS = [
    { id: "rbf-champion", title: "RBF Champion", price: 21.36, image: rbfChampion, category: "ATTITUDE" },
    { id: "snarky-humans", title: "Snarky Humans", price: 20.69, image: snarkyHumans, category: "SNARKY" },
    { id: "free-hugs", title: "Free Hugs", price: 21.69, image: freeHugs, category: "SARCASM" },
];

const ShirtLanding = () => {
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
                                <span className="text-sm font-bold text-primary uppercase tracking-widest">Our Signature Product</span>
                                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mt-4 mb-6">
                                    SNARKY <span className="text-primary">SHIRTS</span>
                                </h1>
                                <p className="text-xl text-muted-foreground font-medium mb-8 leading-relaxed">
                                    Premium heavyweight cotton tees with bold, snarky graphics. 100% preshrunk cotton, DTG-printed, built to last.
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
                                <p className="text-3xl font-black mt-6">Starting at <span className="text-primary">$15.69</span></p>
                            </div>
                            <div className="flex justify-center">
                                <img
                                    src="/images/shirt-carousel-1.jpg"
                                    alt="Snarky t-shirt product mockup"
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

                {/* How It Works — numbered steps like blankets */}
                <section className="py-16 md:py-24 bg-card/50">
                    <div className="container px-4">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-center mb-12">
                            HOW IT <span className="text-primary">WORKS</span>
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            {[
                                { step: "01", icon: Camera, title: "Pick Your Design", desc: "Browse our collection of snarky, bold, and hilarious graphics — or create your own custom design with AI." },
                                { step: "02", icon: Heart, title: "We Print & Ship", desc: "Every shirt is DTG-printed on demand on premium Gildan® 5000 cotton. Quality-checked before it leaves." },
                                { step: "03", icon: Truck, title: "Delivered to You", desc: "Ships within 3–7 business days. Straight to your door, ready to make a statement." },
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

                {/* Material & Sizes — card grid like blankets */}
                <section className="py-16 md:py-24">
                    <div className="container px-4">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-center mb-4">
                            BUILT <span className="text-primary">DIFFERENT</span>
                        </h2>
                        <p className="text-muted-foreground text-lg text-center mb-12 font-medium max-w-xl mx-auto">
                            5.3 oz/yd² preshrunk heavyweight cotton. Seamless double-needle collar. Taped neck & shoulders.
                        </p>
                        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            {[
                                { size: "S – XL", label: "Regular Sizes", desc: "True-to-size unisex fit. Relaxed everyday wear that looks great on everyone.", price: "From $15.69" },
                                { size: "2XL – 3XL", label: "Extended Sizes", desc: "Same premium quality, same bold graphics. Designed for a comfortable, flattering fit.", price: "From $17.69" },
                                { size: "4XL – 5XL", label: "Plus Sizes", desc: "Big and bold — just like the attitude. Full size chart available on every product page.", price: "From $19.69" },
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

                {/* Featured Shirts — grid like blanket occasions */}
                <section className="py-16 md:py-24 bg-card/50">
                    <div className="container px-4">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-center mb-4">
                            FAN <span className="text-primary">FAVORITES</span>
                        </h2>
                        <p className="text-muted-foreground text-lg text-center mb-12 font-medium">
                            Our most popular snarky tees — picked by real snarky humans.
                        </p>
                        <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            {FEATURED_SHIRTS.map((shirt) => (
                                <div
                                    key={shirt.id}
                                    className="group cursor-pointer"
                                    onClick={() => navigate(`/product/${shirt.id}`)}
                                >
                                    <div className="relative overflow-hidden rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)]">
                                        <div className="aspect-square overflow-hidden">
                                            <img
                                                src={shirt.image}
                                                alt={`${shirt.title} snarky t-shirt`}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                        <div className="p-4 text-center">
                                            <span className="text-xs font-bold text-primary uppercase tracking-widest">{shirt.category}</span>
                                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors mt-1">{shirt.title}</h3>
                                            <p className="text-2xl font-black mt-1">${shirt.price.toFixed(2)}</p>
                                        </div>
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
                                    Upload your photo and see how our shirts look on you — powered by AI.
                                </p>
                            </div>
                            <AIMockupGenerator
                                productImage={rbfChampion}
                                productTitle="Snarky T-Shirt"
                                productColor="White"
                            />
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 md:py-24 text-center">
                    <div className="container px-4">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">
                            READY TO GET <span className="text-primary">SNARKY?</span>
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8 font-medium">
                            Life's too short for boring shirts.
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

export default ShirtLanding;
