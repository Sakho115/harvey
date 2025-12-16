import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Shield, Eye, EyeOff, Zap } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Welcome to HARVEY');
    navigate('/');
    setIsLoading(false);
  };

  const handleDemoMode = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    toast.success('Demo mode activated');
    navigate('/');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10 animate-gradient-shift" />
      
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float-delayed" />
      
      {/* AI Ring Animation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] border border-primary/10 rounded-full animate-spin-slow" />
        <div className="absolute w-[500px] h-[500px] border border-primary/5 rounded-full animate-spin-reverse" />
        <div className="absolute w-[400px] h-[400px] border border-accent/10 rounded-full animate-spin-slow" />
      </div>

      {/* Login Card */}
      <Card className="relative z-10 w-full max-w-md bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl animate-fade-in">
        {/* Glow effect */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-lg blur-sm animate-pulse-glow" />
        
        <div className="relative bg-card rounded-lg">
          <CardHeader className="text-center space-y-4 pb-6">
            {/* Logo */}
            <div className="mx-auto relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg animate-logo-pulse">
                <Shield className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="absolute -inset-2 bg-primary/20 rounded-2xl blur-xl animate-pulse" />
            </div>
            
            {/* Title */}
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                HARVEY
              </h1>
              <p className="text-sm text-muted-foreground tracking-wide">
                Cognitive Safety Agent
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground/80">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="agent@harvey.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50 border-border/50 focus:border-primary transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground/80">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background/50 border-border/50 focus:border-primary transition-all duration-300 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Authenticating...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleDemoMode}
              className="w-full border-border/50 hover:bg-accent/50 hover:border-primary/50 transition-all duration-300 group"
              disabled={isLoading}
            >
              <Zap className="w-4 h-4 mr-2 text-primary group-hover:animate-pulse" />
              Enter Demo Mode
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Skip login for hackathon demonstration
            </p>
          </CardContent>
        </div>
      </Card>

      {/* Version tag */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/50">
        v1.0.0 | Cognitive AI Platform
      </div>
    </div>
  );
};

export default Login;
