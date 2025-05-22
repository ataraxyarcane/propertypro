import { useEffect } from "react";
import LoginForm from "@/components/auth/login-form";
import { useAuth } from "@/hooks/use-simple-auth";
import { useLocation } from "wouter";
import SEO from "@/components/seo";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

export default function Login() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Redirect to home if already authenticated
    if (isAuthenticated) {
      setLocation("/");
    }
    
    // Track page view
    trackEvent('view_login', 'authentication', 'login_page');
  }, [isAuthenticated, setLocation]);

  return (
    <>
      <SEO 
        title="Sign In" 
        description="Sign in to your PropertyPro account" 
      />
      
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-light">
        <div className="absolute top-4 left-4">
          <Button variant="ghost" asChild>
            <Link href="/" className="flex items-center font-medium">
              <span className="text-primary mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-building">
                  <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
                  <path d="M9 22v-4h6v4" />
                  <path d="M8 6h.01" />
                  <path d="M16 6h.01" />
                  <path d="M8 10h.01" />
                  <path d="M16 10h.01" />
                  <path d="M8 14h.01" />
                  <path d="M16 14h.01" />
                </svg>
              </span>
              <span className="text-primary">PropertyPro</span>
            </Link>
          </Button>
        </div>
        
        <div className="p-4 w-full max-w-md">
          <LoginForm />
          
          <div className="mt-6 text-center text-sm text-neutral-mid">
            <p>Need help? Contact us at <a href="mailto:support@propertypro.com" className="text-primary hover:underline">support@propertypro.com</a></p>
          </div>
        </div>
      </div>
    </>
  );
}
