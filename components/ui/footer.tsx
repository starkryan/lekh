import { FaGithub, FaTwitter, FaHeart } from "react-icons/fa";
import { Button } from "./button";
import { Separator } from "./separator";
import { FooterModal } from "./footer-modals";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-[600px] mx-auto flex flex-col items-center gap-6 py-8 px-4">
        {/* Brand Section */}
        <div className="flex flex-col items-center gap-3 text-center">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Likhni
          </h3>
          <p className="text-sm text-muted-foreground max-w-[300px]">
            Empowering creators with AI-driven tools
          </p>
          <div className="flex items-center gap-4">
            <Link href="https://github.com/yourusername/likhni" target="_blank" rel="noopener noreferrer">
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
              >
                <FaGithub className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Button>
            </Link>
            <Link href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer">
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
              >
                <FaTwitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Button>
            </Link>
          </div>
        </div>

        <Separator className="bg-border/40 w-full" />

        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Home
          </Link>
          <FooterModal type="about" />
          <FooterModal type="contact" />
          <FooterModal type="privacy" />
          <FooterModal type="terms" />
        </nav>

        {/* Copyright */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span> {currentYear} Likhni.</span>
            <span className="hidden md:inline">·</span>
            <span className="flex items-center gap-1">
              Made with <FaHeart className="h-3 w-3 text-red-500" /> in India
            </span>
          </div>
          
        </div>
      </div>
    </footer>
  );
}
