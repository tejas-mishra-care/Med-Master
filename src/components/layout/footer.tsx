import { Stethoscope, Twitter, Linkedin, Github } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Stethoscope className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold font-headline">MedMaster AI</span>
            </Link>
            <p className="text-muted-foreground text-sm">Study smarter, not harder.</p>
            <div className="flex gap-4 mt-4">
              <Link href="#" aria-label="Twitter">
                <Twitter className="w-5 h-5 text-muted-foreground hover:text-primary" />
              </Link>
              <Link href="#" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5 text-muted-foreground hover:text-primary" />
              </Link>
              <Link href="#" aria-label="GitHub">
                <Github className="w-5 h-5 text-muted-foreground hover:text-primary" />
              </Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold font-headline mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#features" className="text-muted-foreground hover:text-primary">Features</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Pricing</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Security</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold font-headline mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Careers</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold font-headline mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MedMaster AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
