import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Variant = "homepage" | "footer" | "blog";

interface EmailCaptureProps {
    variant: Variant;
    source?: string;
}

export function EmailCapture({ variant, source }: EmailCaptureProps) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const captureSource = source ?? variant;

    const isValidEmail = (e: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValidEmail(email)) {
            toast.error("Enter a valid email address.");
            return;
        }

        setLoading(true);
        try {
            const { error } = await (supabase as any)
                .from("email_subscribers")
                .insert({ email: email.trim().toLowerCase(), source: captureSource });

            if (error) {
                // Unique constraint = already subscribed
                if (error.code === "23505") {
                    toast.info("You're already on the list. We'll keep you posted. 😎");
                    setDone(true);
                    return;
                }
                throw error;
            }

            // Fire welcome email — best effort, don't block UX on failure
            supabase.functions
                .invoke("send-welcome-email", { body: { email: email.trim().toLowerCase() } })
                .catch((err) => console.warn("[EmailCapture] welcome email failed:", err));

            setDone(true);
            toast.success("You're in! Check your inbox for a welcome from us. 🔥");
        } catch (err: any) {
            console.error("[EmailCapture] subscribe error:", err);
            toast.error("Something went wrong. Try again in a second.");
        } finally {
            setLoading(false);
            setEmail("");
        }
    };

    // ─── Homepage Banner ──────────────────────────────────────────────────────
    if (variant === "homepage") {
        return (
            <section className="w-full bg-primary text-primary-foreground py-14 px-4">
                <div className="max-w-2xl mx-auto text-center space-y-4">
                    <p className="text-xs font-bold tracking-[0.25em] uppercase opacity-70">
                        For subscribers only
                    </p>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter">
                        GET THE GOOD STUFF FIRST
                    </h2>
                    <p className="text-base md:text-lg opacity-90 max-w-lg mx-auto">
                        Drops. Promos. Free design credits. Subscriber-only deals.
                        <br />
                        We're snarky, not spammy. One email when it matters.
                    </p>

                    {done ? (
                        <div className="inline-block bg-primary-foreground/10 border border-primary-foreground/20 rounded-xl px-8 py-4 mt-2">
                            <p className="text-lg font-bold">You're in. 😈</p>
                            <p className="text-sm opacity-80 mt-1">Watch your inbox. The good stuff is coming.</p>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col sm:flex-row gap-3 justify-center mt-4 max-w-md mx-auto"
                        >
                            <Input
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                required
                                className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-primary-foreground flex-1"
                                id="homepage-email-capture"
                            />
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-black tracking-wide shrink-0"
                                id="homepage-email-submit"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "I'M IN"}
                            </Button>
                        </form>
                    )}

                    <p className="text-xs opacity-50 mt-2">
                        No spam. Unsubscribe whenever. We're not clingy.
                    </p>
                </div>
            </section>
        );
    }

    // ─── Footer ───────────────────────────────────────────────────────────────
    if (variant === "footer") {
        return (
            <div className="space-y-2">
                <h4 className="font-bold text-foreground">STAY IN THE LOOP</h4>
                <p className="text-sm text-muted-foreground">
                    Deals, drops, and free stuff — first look for subscribers.
                </p>
                {done ? (
                    <p className="text-sm text-primary font-semibold">You're on the list. 🔥</p>
                ) : (
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <Input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                            className="text-sm flex-1 min-w-0"
                            id="footer-email-capture"
                        />
                        <Button
                            type="submit"
                            disabled={loading}
                            size="sm"
                            className="shrink-0 font-bold"
                            id="footer-email-submit"
                        >
                            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "JOIN"}
                        </Button>
                    </form>
                )}
            </div>
        );
    }

    // ─── Blog Article ─────────────────────────────────────────────────────────
    return (
        <div className="mt-12 p-8 bg-primary/5 border border-primary/15 rounded-xl text-center space-y-4">
            <h3 className="text-xl font-black text-foreground">Like what you're reading?</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
                Get exclusive deals, new drop alerts, and free design credits delivered to your inbox.
                We only email when it's worth it.
            </p>

            {done ? (
                <div className="inline-block">
                    <p className="text-lg font-bold text-primary">You're on the list. 😈</p>
                    <p className="text-sm text-muted-foreground mt-1">Good things incoming.</p>
                </div>
            ) : (
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto"
                >
                    <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        required
                        className="flex-1"
                        id="blog-email-capture"
                    />
                    <Button
                        type="submit"
                        disabled={loading}
                        className="shrink-0 font-black"
                        id="blog-email-submit"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "GET THE GOOD STUFF"}
                    </Button>
                </form>
            )}

            <p className="text-xs text-muted-foreground">
                No spam. Unsubscribe anytime. We're snarky, not shady.
            </p>
        </div>
    );
}
