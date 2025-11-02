import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface AuthFormProps {
  onLogin: (username: string) => void;
}

export const AuthForm = ({ onLogin }: AuthFormProps) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("memora_users") || "[]");

    if (isRegister) {
      if (users.find((u: any) => u.username === username)) {
        toast.error("Username already exists!");
        return;
      }
      users.push({ username, password });
      localStorage.setItem("memora_users", JSON.stringify(users));
      toast.success("Registered successfully! Please login.");
      setIsRegister(false);
      setUsername("");
      setPassword("");
    } else {
      const user = users.find((u: any) => u.username === username && u.password === password);
      if (user) {
        toast.success(`Welcome back, ${username}!`);
        onLogin(username);
      } else {
        toast.error("Invalid credentials!");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-gallery-surface to-background">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1920&h=1080')] bg-cover bg-center opacity-10" />
      
      <Card className="relative w-full max-w-md glass-panel p-8 animate-scale-in">
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl font-bold mb-2 text-gradient">
            Memora
          </h1>
          <p className="text-muted-foreground">
            {isRegister ? "Create your gallery account" : "Welcome back"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-gallery-elevated border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-gallery-elevated border-border"
            />
          </div>

          <Button type="submit" className="w-full gradient-gold text-black font-semibold hover:opacity-90 transition-smooth">
            {isRegister ? "Register" : "Login"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-primary hover:text-primary/80 transition-smooth font-medium"
          >
            {isRegister ? "Already have an account? Login" : "New here? Register"}
          </button>
        </div>
      </Card>
    </div>
  );
};
