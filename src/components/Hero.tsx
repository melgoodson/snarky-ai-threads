import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoAnimation from "@/assets/logo-animation.mp4";

export const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Placeholder for hero image - will be added later */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.1)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 w-full flex justify-center px-4 text-center">
        <div className="max-w-3xl w-full space-y-8">
          {/* Animated Logo */}
          <div className="flex justify-center mb-8">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full max-w-2xl h-auto object-contain"
            >
              <source src={logoAnimation} type="video/mp4" />
            </video>
          </div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
            WEAR YOUR
            <span className="block text-primary mt-2">ATTITUDE</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Bold designs for people who don't give a damn. Drop-shipped straight to your door.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="hero" size="xl" className="group" onClick={() => {
              const productsSection = document.getElementById('products');
              if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}>
              SHOP NOW
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="xl" onClick={() => navigate('/collections')}>
              VIEW COLLECTIONS
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
