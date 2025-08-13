'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Newspaper, Loader2, RefreshCw } from 'lucide-react';
import { generateQuizQuestions, GenerateQuizQuestionsOutput } from '@/ai/flows/generate-quiz-questions';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';

type Question = GenerateQuizQuestionsOutput['questions'][0];

const MOCK_NOTES = `
Cardiology: Atrial fibrillation (AFib) is the most common cardiac arrhythmia. Key features on ECG include an irregularly irregular rhythm, no discernible P waves, and a variable ventricular rate. Risk factors include hypertension, coronary artery disease, and heart failure. Complications include stroke and tachycardia-induced cardiomyopathy. Management involves rate control, rhythm control, and anticoagulation.

Pharmacology: Beta-blockers (e.g., metoprolol, atenolol) work by blocking beta-adrenergic receptors, reducing heart rate, blood pressure, and cardiac contractility. They are used for hypertension, angina, and post-myocardial infarction. Side effects include bradycardia, fatigue, and bronchospasm in susceptible individuals.

Pulmonology: Asthma is a chronic inflammatory disorder of the airways characterized by reversible airflow obstruction and bronchospasm. Triggers include allergens, exercise, and respiratory infections. Treatment involves inhaled corticosteroids (ICS) for long-term control and short-acting beta-agonists (SABA) for acute symptom relief.
`;

export default function DailyQuiz() {
  const [quizData, setQuizData] = useState<GenerateQuizQuestionsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const fetchQuiz = async () => {
    setIsLoading(true);
    setError(null);
    setQuizData(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScore(0);
    try {
      const response = await generateQuizQuestions({ notes: MOCK_NOTES, numQuestions: 5 });
      setQuizData(response);
    } catch (err) {
      setError('Failed to generate quiz questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, []);

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: value,
    }));
  };

  const handleNext = () => {
    if (quizData && currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = () => {
    if (!quizData) return;
    let newScore = 0;
    quizData.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        newScore++;
      }
    });
    setScore(newScore);
    setIsSubmitted(true);
  };

  const currentQuestion: Question | undefined = quizData?.questions[currentQuestionIndex];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button onClick={fetchQuiz} className="mt-4">
            <RefreshCw className="mr-2" />
            Try Again
          </Button>
        </Alert>
      </div>
    );
  }
  
  if (isSubmitted && quizData) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-center">Quiz Complete!</CardTitle>
          <CardDescription className="text-center">You scored {score} out of {quizData.questions.length}.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quizData.questions.map((q, index) => (
              <div key={index} className={`p-4 rounded-lg ${selectedAnswers[index] === q.correctAnswer ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                <p className="font-bold">{index + 1}. {q.question}</p>
                <p className="text-sm mt-2">Your answer: {selectedAnswers[index] || 'Not answered'}</p>
                <p className="text-sm">Correct answer: {q.correctAnswer}</p>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={fetchQuiz} className="w-full">
            <RefreshCw className="mr-2" />
            Take Another Quiz
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (!quizData || !currentQuestion) {
    return null;
  }

  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Newspaper className="w-6 h-6 text-primary" />
          <CardTitle className="font-headline">Daily Quiz</CardTitle>
        </div>
        <CardDescription>Test your knowledge with today's questions.</CardDescription>
        <Progress value={progress} className="mt-2" />
        <p className="text-sm text-muted-foreground text-center mt-2">Question {currentQuestionIndex + 1} of {quizData.questions.length}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold text-lg">{currentQuestion.question}</h3>
        </div>
        <RadioGroup
          value={selectedAnswers[currentQuestionIndex]}
          onValueChange={handleAnswerSelect}
          className="space-y-2"
        >
          {currentQuestion.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`q${currentQuestionIndex}-option-${index}`} />
              <Label htmlFor={`q${currentQuestionIndex}-option-${index}`} className="flex-1 cursor-pointer">{option}</Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter>
        {currentQuestionIndex < quizData.questions.length - 1 ? (
          <Button onClick={handleNext} disabled={!selectedAnswers[currentQuestionIndex]}>
            Next Question
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={Object.keys(selectedAnswers).length !== quizData.questions.length}>
            Submit Quiz
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
