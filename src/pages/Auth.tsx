import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Heart, LogIn, UserPlus, Mail } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const { signUp, signIn, signInWithGoogle, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setForgotLoading(false);
    setForgotSent(true);
  };

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    birthDay: "",
    birthMonth: "",
    birthYear: ""
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

    // Calculate birth date and age
    const birthDay = parseInt(signupData.birthDay);
    const birthMonth = parseInt(signupData.birthMonth);
    const birthYear = parseInt(signupData.birthYear);

    if (!birthDay || !birthMonth || !birthYear || birthDay < 1 || birthDay > 31 || birthMonth < 1 || birthMonth > 12 || birthYear < 1900 || birthYear > new Date().getFullYear()) {
      toast({
        title: "Erro",
        description: "Data de nascimento inválida",
        variant: "destructive"
      });
      return;
    }

    const birthDateStr = `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;
    const birthDateObj = new Date(birthYear, birthMonth - 1, birthDay);
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }

    if (age < 18 || age > 100) {
      toast({
        title: "Erro",
        description: "Insira idade válida",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(
      signupData.email,
      signupData.password,
      signupData.fullName,
      signupData.phone,
      birthDateStr,
      age
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
        confirmPassword: "",
        birthDay: "",
        birthMonth: "",
        birthYear: ""
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

                    <div className="flex justify-end -mt-2">
                      <button
                        type="button"
                        onClick={() => { setForgotEmail(loginData.email); setForgotSent(false); setForgotOpen(true); }}
                        className="text-sm text-primary hover:underline"
                      >
                        Esqueci minha senha
                      </button>
                    </div>

                    <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                      <LogIn className="w-4 h-4 mr-2" />
                      {isLoading ? "Entrando..." : "Entrar"}
                    </Button>

                    <div className="relative my-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">ou</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={async () => {
                        const { error } = await signInWithGoogle();
                        if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
                      }}
                    >
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 mr-2" />
                      Entrar com Google
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
                      <Label>Data de Nascimento</Label>
                      <div className="flex space-x-2">
                        <div className="flex-1">
                          <Input
                            id="signup-birth-day"
                            type="number"
                            placeholder="Dia"
                            value={signupData.birthDay}
                            onChange={(e) => setSignupData({ ...signupData, birthDay: e.target.value })}
                            min="1"
                            max="31"
                            required
                          />
                        </div>
                        <div className="flex-1">
                          <Input
                            id="signup-birth-month"
                            type="number"
                            placeholder="Mês"
                            value={signupData.birthMonth}
                            onChange={(e) => setSignupData({ ...signupData, birthMonth: e.target.value })}
                            min="1"
                            max="12"
                            required
                          />
                        </div>
                        <div className="flex-1">
                          <Input
                            id="signup-birth-year"
                            type="number"
                            placeholder="Ano"
                            value={signupData.birthYear}
                            onChange={(e) => setSignupData({ ...signupData, birthYear: e.target.value })}
                            min="1900"
                            max={new Date().getFullYear().toString()}
                            required
                          />
                        </div>
                      </div>
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

                    <div className="relative my-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">ou</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={async () => {
                        const { error } = await signInWithGoogle();
                        if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
                      }}
                    >
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 mr-2" />
                      Entrar com Google
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={forgotOpen} onOpenChange={(o) => { setForgotOpen(o); if (!o) { setForgotSent(false); setForgotEmail(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recuperar senha</DialogTitle>
            <DialogDescription>
              Informe o e-mail cadastrado para receber um link de recuperação.
            </DialogDescription>
          </DialogHeader>
          {forgotSent ? (
            <div className="py-4 text-sm text-muted-foreground">
              Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha.
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <Label htmlFor="forgot-email">E-mail</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" variant="hero" className="w-full" disabled={forgotLoading}>
                  <Mail className="w-4 h-4 mr-2" />
                  {forgotLoading ? "Enviando..." : "Enviar link de recuperação"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Auth;
