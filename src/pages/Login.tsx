import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate("/dashboard");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };

  return (
    <div className="min-h-screen gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8 space-y-8">
          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Link2 className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">LinkDrop</h1>
            <p className="text-muted-foreground">
              Submit and manage your links effortlessly
            </p>
          </div>

          {/* Login options can be added here */}

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground">
            By continuing, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
