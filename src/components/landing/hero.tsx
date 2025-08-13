import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="py-12 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold font-headline mb-4 leading-tight">
              Master Medicine with the Power of AI
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-8">
              Your personal AI medical tutor. Ace your exams with intelligent quizzes, spaced repetition, and interactive 3D models. Study smarter, not harder.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg">
                <Link href="#">Get Started for Free <ArrowRight className="ml-2" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#features">Explore Features</Link>
              </Button>
            </div>
          </div>
          <div>
            <Image
              src="https://placehold.co/1200x800.png"
              alt="MedMaster AI Dashboard Preview"
              width={1200}
              height={800}
              className="rounded-xl shadow-2xl"
              data-ai-hint="medical student studying"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
