import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react";

const Returns = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 bg-background">
                <section className="py-16 md:py-24">
                    <div className="container px-4 max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                                RETURNS & <span className="text-primary">REFUNDS</span>
                            </h1>
                            <p className="text-xl text-muted-foreground">
                                We want you to love your snarky gear. Here's what to do if something's off.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 mb-16">
                            <Card className="p-8">
                                <CheckCircle className="h-8 w-8 mb-4 text-green-500" />
                                <h3 className="text-xl font-bold mb-3">We'll Replace or Refund If:</h3>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li>• The item arrived damaged or defective</li>
                                    <li>• The print is significantly different from the preview</li>
                                    <li>• You received the wrong item or size</li>
                                    <li>• The package was lost in transit</li>
                                </ul>
                            </Card>

                            <Card className="p-8">
                                <XCircle className="h-8 w-8 mb-4 text-red-500" />
                                <h3 className="text-xl font-bold mb-3">We Can't Accept Returns For:</h3>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li>• Change of mind or buyer's remorse</li>
                                    <li>• Incorrect size ordered (check size charts!)</li>
                                    <li>• Minor color variations due to screen differences</li>
                                    <li>• Items washed or worn before reporting an issue</li>
                                </ul>
                            </Card>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <RefreshCw className="h-6 w-6 text-primary" />
                                    <h2 className="text-2xl font-black">How to Request a Return</h2>
                                </div>
                                <ol className="list-decimal pl-6 space-y-3 text-muted-foreground">
                                    <li>
                                        <strong>Contact us within 14 days</strong> of receiving your order via our{" "}
                                        <Link to="/contact" className="text-primary hover:underline">
                                            contact page
                                        </Link>{" "}
                                        or email{" "}
                                        <a href="mailto:support@snarkyhumans.com" className="text-primary hover:underline">
                                            support@snarkyhumans.com
                                        </a>
                                    </li>
                                    <li>
                                        <strong>Include your order number</strong> and photos of the issue (for damaged/defective items).
                                    </li>
                                    <li>
                                        <strong>We'll review your request</strong> within 1–2 business days and let you know the next steps.
                                    </li>
                                    <li>
                                        <strong>Replacement or refund</strong> will be processed within 5–7 business days once approved.
                                    </li>
                                </ol>
                            </div>

                            <Card className="p-6 border-primary/30 bg-primary/5">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-bold mb-2">Important Note About Made-to-Order Products</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Since all our products are printed on demand, we cannot accept general returns or exchanges. Each item is custom-made for you, which is why we take quality very seriously. If there's a genuine problem with your order, we'll make it right — no snarky responses, we promise.
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <div>
                                <h2 className="text-2xl font-black mb-4">Refund Method</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Approved refunds will be returned to the original payment method used at checkout. Please allow 5–10 business days for the refund to appear on your statement, depending on your bank or credit card provider.
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

export default Returns;
