import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { FaEnvelope, FaGithub, FaTwitter } from "react-icons/fa";

interface FooterModalProps {
  type: "privacy" | "terms" | "contact" | "about";
}

export function FooterModal({ type }: FooterModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const content = {
    privacy: {
      title: "Privacy Policy",
      description: "Last updated: January 2025",
      content: (
        <div className="space-y-4 text-sm leading-relaxed">
          <section>
            <h3 className="text-lg font-semibold mb-2">1. Information We Collect</h3>
            <p>We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Account information (name, email)</li>
              <li>Usage data and preferences</li>
              <li>Content generation history</li>
            </ul>
          </section>
          
          <section>
            <h3 className="text-lg font-semibold mb-2">2. How We Use Your Information</h3>
            <p>We use the collected information to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Provide and improve our services</li>
              <li>Personalize your experience</li>
              <li>Send important updates</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">3. Data Security</h3>
            <p>
              We implement appropriate security measures to protect your personal information.
              However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>
        </div>
      ),
    },
    terms: {
      title: "Terms of Service",
      description: "Please read these terms carefully before using our service",
      content: (
        <div className="space-y-4 text-sm leading-relaxed">
          <section>
            <h3 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h3>
            <p>
              By accessing and using Likhni, you accept and agree to be bound by these
              Terms and Conditions and our Privacy Policy.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">2. Use License</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Personal and non-commercial use only</li>
              <li>No modification or copying of the service</li>
              <li>No unauthorized use of our intellectual property</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">3. Content Guidelines</h3>
            <p>Users agree not to generate content that:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Is unlawful or promotes illegal activities</li>
              <li>Is harassing, abusive, or discriminatory</li>
              <li>Infringes on intellectual property rights</li>
            </ul>
          </section>
        </div>
      ),
    },
    contact: {
      title: "Contact Us",
      description: "Get in touch with our team",
      content: (
        <div className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input id="name" placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input id="email" type="email" placeholder="your@email.com" />
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message
              </label>
              <Textarea
                id="message"
                placeholder="How can we help?"
                className="min-h-[100px]"
              />
            </div>
          </div>
          <Button className="w-full">Send Message</Button>
          
          <div className="mt-6 pt-6 border-t">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">Other ways to reach us:</p>
              <div className="flex items-center gap-2">
                <FaEnvelope className="h-4 w-4" />
                <a href="mailto:support@likhni.com" className="hover:text-primary">
                  support@likhni.com
                </a>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    about: {
      title: "About Likhni",
      description: "AI-powered content generation platform",
      content: (
        <div className="space-y-4 text-sm leading-relaxed">
          <section>
            <h3 className="text-lg font-semibold mb-2">Our Mission</h3>
            <p>
              Likhni is dedicated to empowering creators with AI-driven tools that enhance
              their content creation process while maintaining authenticity and creativity.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">What We Offer</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Advanced AI content generation</li>
              <li>Multiple content types support</li>
              <li>Customizable outputs</li>
              <li>User-friendly interface</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Connect With Us</h3>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="gap-2">
                <FaGithub className="h-4 w-4" />
                GitHub
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <FaTwitter className="h-4 w-4" />
                Twitter
              </Button>
            </div>
          </section>
        </div>
      ),
    },
  };

  const modalContent = content[type];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="text-sm text-muted-foreground hover:text-primary transition-colors">
          {modalContent.title}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-primary">{modalContent.title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">{modalContent.description}</DialogDescription>
        </DialogHeader>
        <div className="mt-6">{modalContent.content}</div>
      </DialogContent>
    </Dialog>
  );
}
