import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { useMemo } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.response?.data?.message || 'Invalid email or password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground flex items-center justify-center p-6 overflow-hidden">
      {/* Bubble background */}
      <BubbleField count={28} />

      <div className="relative w-full max-w-md rounded-2xl p-[1px] [background:linear-gradient(90deg,rgba(99,102,241,0.6),rgba(236,72,153,0.5),rgba(59,130,246,0.5))]">
        <Card className="rounded-2xl border-0 bg-card/80 shadow-xl backdrop-blur-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Dress Bot Dashboard</CardTitle>
            <CardDescription className="text-center">Sign in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </span>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@dressbot.com"
                    autoComplete="email"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </span>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="pl-9 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox id="remember" checked={rememberMe} onCheckedChange={(v) => setRememberMe(Boolean(v))} />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary via-indigo-500 to-blue-500 text-white shadow-sm transition hover:brightness-110"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="inline-flex w-full items-center justify-center gap-2">
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By continuing you agree to our <span className="underline underline-offset-4">Terms</span> and <span className="underline underline-offset-4">Privacy Policy</span>.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BubbleField({ count = 20 }: { count?: number }) {
  // Precompute randoms to avoid hydration mismatch
  const bubbles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2; // random direction
      const distance = 300 + Math.random() * 800; // px to travel from center
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      const size = 8 + Math.random() * 18; // 8-26px
      const duration = 6 + Math.random() * 10; // 6-16s
      const delay = Math.random() * 6 * -1; // negative for staggered start
      const soft = Math.random() > 0.5;
      return { id: i, tx, ty, size, duration, delay, soft };
    });
  }, [count]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {bubbles.map((b) => (
        <span
          key={b.id}
          className={`bubble ${b.soft ? 'bubble--soft' : ''}`}
          style={{
            ['--tx' as any]: `${b.tx}px`,
            ['--ty' as any]: `${b.ty}px`,
            ['--size' as any]: `${b.size}px`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
