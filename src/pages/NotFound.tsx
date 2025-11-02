import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-gallery-surface to-background">
      <div className="text-center space-y-6 glass-panel p-12 rounded-2xl animate-scale-in">
        <h1 className="font-display text-6xl font-bold text-gradient">404</h1>
        <p className="text-xl text-muted-foreground">Oops! Page not found</p>
        <Button asChild className="gradient-gold text-black font-semibold">
          <a href="/">Return to Home</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
