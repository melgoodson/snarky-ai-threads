import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Mail, Sparkles, ArrowRight, KeyRound } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as any)?.returnTo || '/';
  const getRedirectUrl = () => `${window.location.origin}${returnTo}`;

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [activeTab, setActiveTab] = useState<'signup' | 'signin'>('signup');
  const [authMethod, setAuthMethod] = useState<'password' | 'magic-link'>('password');

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
      // Store the intended destination — email redirect is always to site root
      // (Supabase only whitelists the root domain). App.tsx global listener picks this up.
      if (returnTo && returnTo !== '/') {
        localStorage.setItem('auth_return_to', returnTo);
      }
      const { data, error } = await supabase.functions.invoke("send-auth-email", {
        body: {
          email,
          type: "magiclink",
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        toast.error(error.message);
      } else if (data?.error) {
        toast.error(data.error);
      } else {
        setSent(true);
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Successfully signed in!');
          navigate(returnTo);
        }
      } else {
        // Store the intended destination — email redirect is always to site root
        // (Supabase only whitelists the root domain). App.tsx global listener picks this up.
        if (returnTo && returnTo !== '/') {
          localStorage.setItem('auth_return_to', returnTo);
        }
        const { data, error } = await supabase.functions.invoke("send-auth-email", {
          body: {
            email,
            password,
            type: "signup",
            redirectTo: window.location.origin,
          },
        });

        if (error) {
          toast.error(error.message);
        } else if (data?.error) {
          toast.error(data.error);
        } else {
          toast.success('Sign up successful! Check your email to verify your account.');
          setSent(true);
        }
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCardTitleAndDesc = () => {
    if (sent) {
      return {
        title: 'Check your inbox',
        desc: activeTab === 'signup' && authMethod === 'password'
          ? `We sent a confirmation link to ${email}`
          : `We sent a sign-in link to ${email}`
      };
    }
    if (activeTab === 'signup') {
      if (authMethod === 'password') {
        return {
          title: 'Create your account',
          desc: 'Choose a password to register a new account'
        };
      }
      return {
        title: 'Sign up with Magic Link',
        desc: "No password needed — we'll email you a one-click sign-up link"
      };
    } else {
      if (authMethod === 'password') {
        return {
          title: 'Sign in with Password',
          desc: 'Enter your credentials below to log in'
        };
      }
      return {
        title: 'Sign in with Magic Link',
        desc: "No password needed — we'll email you a one-click sign-in link"
      };
    }
  };

  const { title, desc } = getCardTitleAndDesc();

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
            Create an account to save designs, track orders, and check out
          </p>
        </div>

        <Card className="border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold">
              {title}
            </CardTitle>
            <CardDescription>
              {desc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-foreground">
                    {activeTab === 'signup' && authMethod === 'password' ? 'Confirmation email sent!' : 'Magic link sent!'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activeTab === 'signup' && authMethod === 'password'
                      ? 'Click the confirmation link in your email to complete registration. Check your spam folder if you don\'t see it.'
                      : 'Click the link in your email to sign in instantly. Check your spam folder if you don\'t see it.'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSent(false);
                    setEmail('');
                    setPassword('');
                  }}
                >
                  Use a different email
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="signup" value={activeTab} onValueChange={(val) => {
                setActiveTab(val as 'signup' | 'signin');
                setAuthMethod('password'); // reset to password method when switching tabs
              }} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signup">Create Account</TabsTrigger>
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signup" className="mt-0">
                  {authMethod === 'password' ? (
                    <form onSubmit={handlePasswordAuth} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-email"
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

                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-9"
                            required
                            disabled={loading}
                            minLength={6}
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full" size="lg" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing up...
                          </>
                        ) : (
                          <>
                            Create Account
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>

                      <div className="text-center text-sm mt-4">
                        <button
                          type="button"
                          onClick={() => setAuthMethod('magic-link')}
                          className="text-primary hover:underline font-semibold"
                        >
                          Or sign up passwordless with a Magic Link
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleSendLink} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-magic-email">Email address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-magic-email"
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

                      <div className="text-center text-sm mt-4">
                        <button
                          type="button"
                          onClick={() => setAuthMethod('password')}
                          className="text-primary hover:underline font-semibold"
                        >
                          Or sign up with a password
                        </button>
                      </div>
                    </form>
                  )}
                </TabsContent>

                <TabsContent value="signin" className="mt-0">
                  {authMethod === 'password' ? (
                    <form onSubmit={handlePasswordAuth} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email">Email address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signin-email"
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

                      <div className="space-y-2">
                        <Label htmlFor="signin-password">Password</Label>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signin-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-9"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full" size="lg" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>

                      <div className="text-center text-sm mt-4">
                        <button
                          type="button"
                          onClick={() => setAuthMethod('magic-link')}
                          className="text-primary hover:underline font-semibold"
                        >
                          Or sign in passwordless with a Magic Link
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleSendLink} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-magic-email">Email address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signin-magic-email"
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

                      <div className="text-center text-sm mt-4">
                        <button
                          type="button"
                          onClick={() => setAuthMethod('password')}
                          className="text-primary hover:underline font-semibold"
                        >
                          Or sign in with a password
                        </button>
                      </div>
                    </form>
                  )}
                </TabsContent>
              </Tabs>
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
