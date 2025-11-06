import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Heart, LogIn, UserPlus } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Auth = () => {
  const navigate = useNavigate();
  const { signUp, signIn, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(loginData.email, loginData.password);

    if (error) {
      toast({
        title: "Erro ao fazer login",
        description: error.message === "Invalid login credentials" 
          ? "Email ou senha incorretos" 
          : error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta à APABB."
      });
      navigate("/");
    }

    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    if (signupData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(
      signupData.email,
      signupData.password,
      signupData.fullName,
      signupData.phone
    );

    if (error) {
      toast({
        title: "Erro ao criar conta",
        description: error.message === "User already registered" 
          ? "Este email já está cadastrado" 
          : error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Conta criada com sucesso!",
        description: "Você já pode fazer login."
      });
      setSignupData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center">
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Bem-vindo à APABB</h1>
            <p className="text-muted-foreground">
              Faça login ou crie sua conta para doar
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Criar Conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Entrar</CardTitle>
                  <CardDescription>
                    Acesse sua conta para continuar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="login-password">Senha</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                    </div>

                    <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                      <LogIn className="w-4 h-4 mr-2" />
                      {isLoading ? "Entrando..." : "Entrar"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Criar Conta</CardTitle>
                  <CardDescription>
                    Preencha seus dados para criar uma conta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                      <Label htmlFor="signup-name">Nome Completo</Label>
                      <Input
                        id="signup-name"
                        value={signupData.fullName}
                        onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="signup-phone">Telefone</Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        value={signupData.phone}
                        onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="signup-password">Senha</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="signup-confirm-password">Confirmar Senha</Label>
                      <Input
                        id="signup-confirm-password"
                        type="password"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>

                    <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      {isLoading ? "Criando conta..." : "Criar Conta"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
