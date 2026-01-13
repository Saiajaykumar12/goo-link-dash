
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
    return (
        <div className="min-h-screen gradient-subtle flex flex-col">
            {/* Header */}
            <header className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                        <Link2 className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold text-foreground">LinkDrop</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/login?mode=login">
                        <Button variant="ghost" className="font-semibold text-muted-foreground hover:text-foreground">
                            Sign In
                        </Button>
                    </Link>
                    <Link to="/login?mode=signup">
                        <Button className="font-semibold gradient-primary hover:opacity-90">
                            Sign Up
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-8 max-w-4xl mx-auto">
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-foreground">
                        Share links with <br />
                        <span className="gradient-primary bg-clip-text text-transparent">
                            zero friction
                        </span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        The easiest way to manage and share your links.
                        Secure, fast, and designed for you.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                    <Link to="/login?mode=signup">
                        <Button size="lg" className="h-14 px-8 text-lg gap-2 gradient-primary hover:opacity-90 transition-opacity">
                            Get Started for Free
                            <Link2 className="w-5 h-5" />
                        </Button>
                    </Link>
                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                        Learn More
                    </Button>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 text-left w-full">
                    {[
                        {
                            title: "Instant Sharing",
                            desc: "Paste your link and share it instantly with anyone, anywhere."
                        },
                        {
                            title: "Secure & Private",
                            desc: "Your links are encrypted and only accessible to you."
                        },
                        {
                            title: "Analytics",
                            desc: "Track clicks and engagement on your shared links in real-time."
                        }
                    ].map((feature, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/20 transition-colors">
                            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="py-6 text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} LinkDrop. All rights reserved.
            </footer>
        </div>
    );
};

export default Landing;
