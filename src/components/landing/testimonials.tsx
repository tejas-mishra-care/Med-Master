import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const testimonials = [
  {
    name: 'Dr. Evelyn Reed',
    title: 'Cardiology Resident',
    avatar: 'ER',
    image: 'https://placehold.co/100x100.png',
    dataAiHint: 'woman portrait',
    text: 'MedMaster AI has been a game-changer for my board prep. The AI explanations are incredibly clear and the daily quizzes keep me sharp. I wish I had this in med school!',
  },
  {
    name: 'Samuel Jones',
    title: 'M2 Student',
    avatar: 'SJ',
    image: 'https://placehold.co/100x100.png',
    dataAiHint: 'man portrait',
    text: 'The 3D anatomy models are insane! Being able to visualize complex structures has made anatomy so much more intuitive. Plus, the spaced repetition system actually works.',
  },
  {
    name: 'Aisha Khan',
    title: 'Professor of Medicine',
    avatar: 'AK',
    image: 'https://placehold.co/100x100.png',
    dataAiHint: 'woman portrait professional',
    text: 'I recommend MedMaster AI to all my students. It reinforces classroom learning and provides a personalized study experience that traditional textbooks can\'t match.',
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-12 sm:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">Trusted by the Medical Community</h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            See what students, residents, and professors are saying about MedMaster AI.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 shadow-md flex flex-col">
              <CardContent className="p-0 flex-grow">
                <p className="text-muted-foreground italic">"{testimonial.text}"</p>
              </CardContent>
              <div className="flex items-center mt-6 pt-6 border-t">
                <Avatar>
                  <AvatarImage src={testimonial.image} alt={testimonial.name} data-ai-hint={testimonial.dataAiHint} />
                  <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <p className="font-semibold font-headline">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
