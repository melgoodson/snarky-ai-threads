import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";

const TermsOfService = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 bg-background">
                <section className="py-16 md:py-24">
                    <div className="container px-4 max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                            TERMS OF <span className="text-primary">SERVICE</span>
                        </h1>
                        <p className="text-sm text-muted-foreground mb-12">
                            Last updated: February 2026
                        </p>

                        <article className="prose prose-sm max-w-none space-y-8">
                            <section>
                                <h2 className="text-2xl font-bold mb-4">1. Agreement to Terms</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    By accessing or using Snarky A$$ Apparel ("we," "our," or "us"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website or services.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">2. Products & Orders</h2>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    <li>All products are made-to-order and printed through our fulfillment partner, Printify.</li>
                                    <li>Product colors may vary slightly from images shown on screen due to monitor settings.</li>
                                    <li>We reserve the right to cancel any order for any reason, including suspected fraud.</li>
                                    <li>Prices are listed in USD and are subject to change without notice.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">3. Custom Designs</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    When using our AI design tool, you retain ownership of the text prompts you submit. However, AI-generated images are provided under a limited license for use on our products. You may not use AI-generated designs for purposes outside of ordering from our store. We reserve the right to reject any custom design that violates intellectual property rights or contains inappropriate content.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">4. User Accounts</h2>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    <li>You are responsible for maintaining the security of your account credentials.</li>
                                    <li>You must provide accurate information when creating an account.</li>
                                    <li>You may not create multiple accounts or share account access.</li>
                                    <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">5. Intellectual Property</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    All content on this website, including designs, text, graphics, and logos, is the property of Snarky A$$ Apparel or its licensors and is protected by copyright and trademark laws. You may not copy, reproduce, or distribute any content without written permission.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">6. Limitation of Liability</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    We are not liable for any indirect, incidental, or consequential damages arising from your use of our website or products. Our total liability is limited to the amount you paid for the specific product in question.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">7. Changes to Terms</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    We may update these terms at any time. Continued use of the site after changes constitutes acceptance of the new terms.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">8. Contact</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Questions about these terms? Reach out at{" "}
                                    <Link to="/contact" className="text-primary hover:underline">
                                        our contact page
                                    </Link>{" "}
                                    or email{" "}
                                    <a href="mailto:support@snarkyassthreads.com" className="text-primary hover:underline">
                                        support@snarkyassthreads.com
                                    </a>
                                </p>
                            </section>
                        </article>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default TermsOfService;
