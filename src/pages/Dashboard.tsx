import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link2, LogOut, Send, User, ExternalLink } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  picture: string;
}

interface LinkItem {
  id: number;
  url: string;
  createdAt: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [link, setLink] = useState("");
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Fetch User
    fetch("http://localhost:4000/api/user", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          navigate("/login");
        } else {
          setUser(data.user);
          // Fetch Links only if user exists
          fetchLinks();
        }
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  const fetchLinks = () => {
    fetch("http://localhost:4000/api/links", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data.links) {
          setLinks(data.links);
        }
      });
  };

  const handleLogout = async () => {
    await fetch("http://localhost:4000/logout", {
      method: "GET",
      credentials: "include"
    });
    navigate("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let formattedLink = link.trim();
    if (!/^https:\/\//i.test(formattedLink)) {
      formattedLink = "https://" + formattedLink.replace(/^https?:\/\//i, "");
    }

    let isValid = true;
    try {
      new URL(formattedLink);
    } catch {
      isValid = false;
    }

    if (!isValid) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with https://",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:4000/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url: formattedLink })
      });

      if (res.ok) {
        toast({
          title: "Success!",
          description: "Your link has been submitted successfully",
        });
        setLink("");
        fetchLinks(); // Refresh links
      } else {
        throw new Error("Failed to submit");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen gradient-subtle">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <Link2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">LinkDrop</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {user?.picture ? (
                <img src={user.picture} alt={user.name} className="w-6 h-6 rounded-full" />
              ) : (
                <User className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{user?.name || user?.email}</span>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Drop your link
          </h1>
          <p className="text-muted-foreground text-lg">
            Paste a URL below and submit to your session
          </p>
        </div>

        {/* Link Submission Card */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="link"
                className="text-sm font-medium text-foreground"
              >
                Enter your link
              </label>
              <div className="relative">
                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="link"
                  type="url"
                  placeholder="https://example.com"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="pl-12 h-14 text-base border-2 focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-base font-medium gradient-primary hover:opacity-90 transition-opacity gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Link
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Links List */}
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-xl font-semibold text-foreground">Your Links</h2>
          {links.length === 0 ? (
            <div className="text-center p-8 bg-card/50 rounded-xl border border-dashed border-border">
              <p className="text-muted-foreground">No links yet. Add your first one above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {links.map((linkItem) => (
                <div key={linkItem.id} className="bg-card p-4 rounded-xl border border-border flex items-center justify-between group hover:border-primary/30 transition-colors">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm font-medium text-foreground truncate">{linkItem.url}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(linkItem.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <a
                    href={linkItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
