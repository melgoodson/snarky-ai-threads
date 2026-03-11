import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Mail, Sparkles, ArrowRight } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as any)?.returnTo || '/';
  const getRedirectUrl = () => `${window.location.origin}${returnTo}`;

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) navigate(returnTo);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate(returnTo);
    });

    return () => subscription.unsubscribe();
  }, [navigate, returnTo]);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getRedirectUrl(),
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        setSent(true);
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">
            <span className="text-primary">SNARKY</span> HUMANS
          </h1>
          <p className="text-muted-foreground text-sm">
            Sign in to save designs, track orders, and check out
          </p>
        </div>

        <Card className="border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold">
              {sent ? 'Check your inbox' : 'Sign in with Magic Link'}
            </CardTitle>
            <CardDescription>
              {sent
                ? `We sent a sign-in link to ${email}`
                : "No password needed — we'll email you a one-click sign-in link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-foreground">Magic link sent!</p>
                  <p className="text-sm text-muted-foreground">
                    Click the link in your email to sign in instantly. Check your spam folder if you don't see it.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSent(false);
                    setEmail('');
                  }}
                >
                  Use a different email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSendLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="auth-email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="auth-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      required
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending link...
                    </>
                  ) : (
                    <>
                      Send Magic Link
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  New here? Just enter your email — we'll create your account automatically.
                </p>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By signing in, you agree to our{' '}
          <a href="/terms" className="text-primary hover:underline">Terms of Service</a>{' '}
          and{' '}
          <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default Auth;
