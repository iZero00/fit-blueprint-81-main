import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Login | BassiniFit';
    const meta = document.querySelector('meta[name="description"]');
    if (meta instanceof HTMLMetaElement) {
      meta.content = 'Acesse sua conta BassiniFit para acompanhar seus treinos personalizados e evolução.';
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error('Email ou senha incorretos');
      } else {
        toast.success('Login realizado com sucesso!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Ocorreu um erro. Tente novamente.');
    }

    setIsLoading(false);
  };

  return (
    <>
      <div className="min-h-screen bg-background flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-4 animate-fade-in">
              Transforme seu corpo,
              <br />
              evolua sua vida.
            </h1>
            <p className="text-lg opacity-90 animate-fade-in delay-200">
              Acompanhe seus treinos personalizados, monitore seu progresso e alcance
              seus objetivos com o BassiniFit.
            </p>
          </div>
        </div>
      </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8 animate-slide-up">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <Logo size="lg" />
              </div>
              <h2 className="text-2xl font-bold">
                Bem-vindo de volta
              </h2>
              <p className="text-muted-foreground mt-2">
                Entre com suas credenciais para acessar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="pt-2 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                Ainda não tem acesso?
              </p>
              <a
                href="https://wa.me/5567993073133?text=Ol%C3%A1%2C%20gostaria%20de%20treinar%20com%20o%20BassiniFit%20e%20preciso%20de%20acesso%20%C3%A0%20plataforma."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                Falar com o treinador no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
