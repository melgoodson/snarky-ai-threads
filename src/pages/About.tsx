import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShieldCheck, Truck, Droplet, Star } from "lucide-react";
import melFounder from "@/assets/mel-founder.png";

const About = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 bg-background text-foreground">
                <section className="py-16 md:py-24 border-b border-border">
                    <div className="container px-4 max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 uppercase">
                                About <span className="text-primary">Snarky A$$ Humans</span>
                            </h1>
                            <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                                We make premium snarky apparel, gag gifts, and custom accessories for people who are tired of filtering themselves.
                            </p>
                        </div>

                        {/* Reason to Buy / Trust Signals */}
                        <div className="grid md:grid-cols-2 gap-8 mb-16">
                            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                                <h2 className="text-2xl font-black mb-4">Why Shop With Us?</h2>
                                <ul className="space-y-4">
                                    <li className="flex gap-3">
                                        <Star className="text-primary h-6 w-6 shrink-0" />
                                        <div>
                                            <strong className="block text-lg">Premium Quality Material</strong>
                                            <span className="text-muted-foreground text-sm">We don't print on cheap, scratchy tees. We use 5.3 oz/yd² heavyweight cotton that lasts.</span>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <Droplet className="text-primary h-6 w-6 shrink-0" />
                                        <div>
                                            <strong className="block text-lg">Vibrant DTG Printing</strong>
                                            <span className="text-muted-foreground text-sm">Our Direct-to-Garment printing ensures your graphics won't crack or fade after two washes.</span>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <Truck className="text-primary h-6 w-6 shrink-0" />
                                        <div>
                                            <strong className="block text-lg">Fast, Reliable Fulfillment</strong>
                                            <span className="text-muted-foreground text-sm">Orders are typically printed and shipped within 3-7 business days directly to your door.</span>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <ShieldCheck className="text-primary h-6 w-6 shrink-0" />
                                        <div>
                                            <strong className="block text-lg">Veteran Owned</strong>
                                            <span className="text-muted-foreground text-sm">Built with unapologetic energy and supported by the community.</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="flex flex-col justify-center gap-6">
                                <h3 className="text-3xl font-black">Not Your Average Gift Shop</h3>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    Most gag gifts end up in the trash because they feel cheap. We built Snarky A$$ Apparel to solve that problem. 
                                </p>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    Whether you're buying a sarcastic hoodie for yourself, a funny mug for a coworker, or a custom photo blanket for a white elephant exchange, you are getting a high-quality product that commands respect (and laughs).
                                </p>
                                <div>
                                    <Button size="lg" asChild className="mr-4">
                                        <Link to="/shirts">Shop T-Shirts</Link>
                                    </Button>
                                    <Button size="lg" variant="outline" asChild>
                                        <Link to="/collections">All Collections</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Origin Story */}
                        <article className="space-y-8 text-lg mt-24">
                            <div className="text-center mb-12">
                                <h2 className="text-4xl font-black">THE ORIGIN STORY</h2>
                            </div>
                            
                            <div className="mb-12 overflow-hidden rounded-lg shadow-lg max-w-2xl mx-auto border border-border">
                                <img
                                    src={melFounder}
                                    alt="Mel, founder of Snarky Humans, relaxing at home with his pets"
                                    className="w-full block"
                                    style={{ marginBottom: '-80px' }}
                                />
                            </div>

                            <p className="text-xl font-bold">
                                Mel didn't plan to start a brand. He planned to make it home.
                            </p>

                            <p className="leading-relaxed text-muted-foreground">
                                He served overseas. There was a blast. There was a man who needed saving. Mel moved, acted, and did what he was trained to do. The man lived. Mel lived too, but he didn't come back the same. Call it a service-related brain injury. Call it a mind rewired by impact and adrenaline. What it felt like was static in the head and a pressure cooker in the chest.
                            </p>

                            <p className="leading-relaxed text-muted-foreground">
                                So he did what stubborn people do. He turned pain into a punchline and started writing the kind of jokes that make people snort-laugh in quiet rooms. Humor became a survival skill. Snark became a language.
                            </p>

                            <p className="text-2xl font-black text-primary my-8 text-center uppercase tracking-widest">
                                Snarky A$$ Humans was born.
                            </p>

                            <p className="leading-relaxed text-muted-foreground pb-12">
                                This brand isn't an accident. It is a little bit therapy, a little bit middle finger, and a lot of community. Veterans get it. First responders get it. Anyone who's walked through fire and still shows up with a grin gets it. If you believe in supporting veterans, you can do it the laid-back way. Put it on your chest. Put it on your desk.
                            </p>
                        </article>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default About;
