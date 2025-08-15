import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Cta() {
  return (
    <section className="py-12 sm:py-24 bg-secondary">
  <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">
          Ready to Revolutionize Your Medical Studies?
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
          Join thousands of students and professionals who are learning smarter, not harder, with MedMaster AI.
        </p>
        <Button asChild size="lg">
          <Link href="#">Start Your Free Trial</Link>
        </Button>
      </div>
    </section>
  );
}
