import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 bg-background">
                <section className="py-16 md:py-24">
                    <div className="container px-4 max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                            PRIVACY <span className="text-primary">POLICY</span>
                        </h1>
                        <p className="text-sm text-muted-foreground mb-12">
                            Last updated: February 2026
                        </p>

                        <article className="prose prose-sm max-w-none space-y-8">
                            <section>
                                <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    When you visit our site, we may collect the following information:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    <li><strong>Account Information:</strong> Email address, username, and password when you create an account.</li>
                                    <li><strong>Order Information:</strong> Name, shipping address, phone number, and payment details when you place an order.</li>
                                    <li><strong>Usage Data:</strong> Pages visited, time spent on pages, and interactions with site features.</li>
                                    <li><strong>Device Information:</strong> Browser type, operating system, and IP address.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    <li>Process and fulfill your orders</li>
                                    <li>Send order confirmations and shipping updates</li>
                                    <li>Improve our website and customer experience</li>
                                    <li>Respond to your inquiries and support requests</li>
                                    <li>Send promotional emails (only with your consent)</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">3. Third-Party Services</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    We use trusted third-party services to operate our store:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    <li><strong>Stripe:</strong> For secure payment processing. We never store your credit card information.</li>
                                    <li><strong>Printify:</strong> For order fulfillment and printing. Your shipping address is shared to deliver your order.</li>
                                    <li><strong>Supabase:</strong> For authentication and data storage.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">4. Cookies</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    We use essential cookies for authentication and cart functionality. We do not use tracking cookies for advertising purposes. Your cart data is stored locally in your browser's localStorage.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    We implement industry-standard security measures to protect your personal information. All data is transmitted via HTTPS encryption. Payment processing is handled entirely by Stripe and is PCI-DSS compliant.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    You have the right to:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    <li>Access the personal information we hold about you</li>
                                    <li>Request correction of inaccurate data</li>
                                    <li>Request deletion of your account and data</li>
                                    <li>Opt out of promotional communications</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">7. Contact Us</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    For privacy-related questions, contact us at{" "}
                                    <a href="mailto:support@snarkyhumans.com" className="text-primary hover:underline">
                                        support@snarkyhumans.com
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

export default PrivacyPolicy;
