import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrainCircuit, FileQuestion, Repeat, Scan, FilePenLine, WifiOff } from 'lucide-react';

const features = [
  {
    icon: <BrainCircuit className="w-10 h-10 text-primary" />,
    title: 'AI Medical Assistant',
    description: 'Get evidence-based, AI-powered explanations for complex medical questions, complete with source citations.',
  },
  {
    icon: <FileQuestion className="w-10 h-10 text-primary" />,
    title: 'Daily Quizzes',
    description: 'Test your knowledge with a fresh set of medical questions every day, tailored to your learning needs.',
  },
  {
    icon: <Repeat className="w-10 h-10 text-primary" />,
    title: 'Spaced Repetition (SRS)',
    description: 'Optimize memorization with our intelligent spaced repetition system that schedules reviews for you.',
  },
  {
    icon: <Scan className="w-10 h-10 text-primary" />,
    title: '3D Anatomy Models',
    description: 'Explore the human body with interactive 3D anatomy models, featuring layer toggles and detailed labels.',
  },
  {
    icon: <FilePenLine className="w-10 h-10 text-primary" />,
    title: 'PDF Annotation',
    description: 'Upload your own study materials and make notes directly on your PDFs with our integrated annotation tools.',
  },
  {
    icon: <WifiOff className="w-10 h-10 text-primary" />,
    title: 'Offline Access',
    description: 'Study anytime, anywhere. Your notes and annotations are saved locally and synced when you\'re back online.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-12 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">A Smarter Way to Learn Medicine</h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Everything you need to excel in your medical education, all in one platform.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="flex flex-col items-center text-center p-6 shadow-md hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="p-0 mb-4">
                {feature.icon}
                <CardTitle className="mt-4 font-headline">{feature.title}</CardTitle>
              </CardHeader>
              <CardDescription>{feature.description}</CardDescription>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
