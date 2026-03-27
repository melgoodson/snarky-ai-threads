import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ShieldCheck, ArrowRight, KeyRound, Mail } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Already logged in — check if admin
        const { data: roles } = await (supabase as any)
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (roles) {
          navigate('/admin/dashboard');
          return;
        }
      }
    } catch {
      // Not logged in, show form
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (!data.user) {
        toast.error('Login failed');
        return;
      }

      // Check admin role
      const { data: roles } = await (supabase as any)
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roles) {
        await supabase.auth.signOut();
        toast.error('Access denied: Admin privileges required');
        return;
      }

      toast.success('Welcome back, admin!');
      navigate('/admin/dashboard');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Admin Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            Admin Portal
          </h1>
          <p className="text-muted-foreground text-sm">
            Authorized personnel only
          </p>
        </div>

        <Card className="border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold">Sign In</CardTitle>
            <CardDescription>
              Enter your admin credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                    disabled={submitting}
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                    disabled={submitting}
                    minLength={6}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? (
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
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
