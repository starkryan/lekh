import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MainNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
      

        {/* Center Logo */}
        <div className="flex justify-center md:w-1/3">
          <Link href="/" className="flex items-center">
            <span className="font-bold text-xl">Logo</span>
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center justify-end md:w-1/3">
          {/* Desktop Sign In */}
          

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-transparent">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  <Button
                    asChild
                    variant="ghost"
                    className="justify-start"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href="/about">About</Link>
                  </Button>
                  <div className="pt-4 border-t">
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/signin">Sign in</Link>
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default MainNav;