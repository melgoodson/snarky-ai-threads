import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, MailOpen } from "lucide-react";

const ThankYou = () => {
    const [searchParams] = useSearchParams();
    const isAccountSignup = searchParams.get("type") === "signup";

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 bg-background text-foreground flex items-center justify-center py-16 md:py-24">
                <div className="container px-4 max-w-xl mx-auto text-center">
                    {isAccountSignup ? (
                        <>
                            <MailOpen className="h-16 w-16 mx-auto mb-6 text-primary" />
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 uppercase">
                                CHECK YOUR <span className="text-primary">INBOX</span>
                            </h1>
                            <p className="text-xl text-muted-foreground font-medium mb-8 leading-relaxed">
                                We've sent a verification link to your email. Click it to complete your registration and unlock your account.
                            </p>
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="h-16 w-16 mx-auto mb-6 text-primary" />
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 uppercase">
                                YOU'RE IN <span className="text-primary">THE LOOP</span>
                            </h1>
                            <p className="text-xl text-muted-foreground font-medium mb-8 leading-relaxed">
                                Thanks for subscribing! Your welcome discount is heading straight to your inbox. Get ready for drops, deals, and some unapologetic snark.
                            </p>
                        </>
                    )}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" asChild>
                            <Link to="/shirts">Shop T-Shirts</Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link to="/collections">Browse Collections</Link>
                        </Button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ThankYou;
