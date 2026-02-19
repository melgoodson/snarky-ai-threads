import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Truck, Clock, Globe, Package } from "lucide-react";

const ShippingInfo = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 bg-background">
                <section className="py-16 md:py-24">
                    <div className="container px-4 max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                                SHIPPING <span className="text-primary">INFO</span>
                            </h1>
                            <p className="text-xl text-muted-foreground">
                                Everything you need to know about getting your snarky goods delivered.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 mb-16">
                            <Card className="p-8">
                                <Truck className="h-8 w-8 mb-4 text-primary" />
                                <h3 className="text-xl font-bold mb-3">Standard Shipping</h3>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li>🇺🇸 US: 5–8 business days</li>
                                    <li>🇨🇦 Canada: 7–12 business days</li>
                                    <li>🌍 International: 10–20 business days</li>
                                </ul>
                            </Card>

                            <Card className="p-8">
                                <Clock className="h-8 w-8 mb-4 text-primary" />
                                <h3 className="text-xl font-bold mb-3">Production Time</h3>
                                <p className="text-muted-foreground">
                                    All products are made-to-order and typically take <strong>2–5 business days</strong> to produce before shipping. Custom/personalized items may take an additional 1–2 days.
                                </p>
                            </Card>

                            <Card className="p-8">
                                <Globe className="h-8 w-8 mb-4 text-primary" />
                                <h3 className="text-xl font-bold mb-3">International Orders</h3>
                                <p className="text-muted-foreground">
                                    We ship worldwide! International customers may be responsible for customs duties and taxes charged by their country. These fees are not included in our prices.
                                </p>
                            </Card>

                            <Card className="p-8">
                                <Package className="h-8 w-8 mb-4 text-primary" />
                                <h3 className="text-xl font-bold mb-3">Order Tracking</h3>
                                <p className="text-muted-foreground">
                                    Once your order ships, you'll receive a tracking number via email. You can also track your order from your{" "}
                                    <a href="/profile" className="text-primary hover:underline">profile page</a>.
                                </p>
                            </Card>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-black mb-4">Shipping Costs</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Shipping costs are calculated at checkout based on your location and the items in your cart. We partner with Printify's global fulfillment network to ensure the best rates and fastest delivery times.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-black mb-4">Lost or Damaged Packages</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    If your package arrives damaged or doesn't arrive at all, please contact us within 14 days of the expected delivery date. We'll work with our fulfillment partner to resolve the issue — whether that's a replacement or refund.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-black mb-4">Address Accuracy</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Please double-check your shipping address before placing your order. We are not responsible for orders shipped to incorrect addresses provided by the customer. If you notice an error, contact us immediately and we'll try to update it before production begins.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default ShippingInfo;
