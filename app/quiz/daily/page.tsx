"use client";

import { useEffect, useState } from 'react';
import QuizCard from '@/components/QuizCard'; // Assuming QuizCard component exists
import { useRouter } from 'next/navigation';
import { useAuthClient } from '@/lib/auth';
import { useSyncStatus, enqueueOfflineAction } from '@/lib/offlineSync'; // Assuming offlineSync library
// Import Framer Motion for micro-interactions
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
  id: string;
  text: string;
  options: { [key: string]: string };
  // correct_option will NOT be present here
}

interface DailyQuiz {
  date: string;
  questions: Question[];
}

interface QuizResult {
  score: number;
  total: number;
  details: { [key: string]: boolean };
  timestamp: string;
}

const DailyQuizPage = () => {
  // Hook to manage routing
  const router = useRouter();
  // Hook to get authentication status and user
  const { user, loading: authLoading } = useAuthClient(); // Assuming auth hook
  const [quiz, setQuiz] = useState<DailyQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const syncStatus = useSyncStatus(); // Assuming sync status hook

  useEffect(() => {
    // Function to fetch the daily quiz
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        // Check IndexedDB for cached quiz and answers first
        // This supports offline mode by loading previously cached data.
        // The getCachedQuiz function needs to be implemented using IndexedDB.
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        const cachedQuiz = await getCachedQuiz(); // Assuming IndexedDB helper
        if (cachedQuiz) {
          setQuiz(cachedQuiz.quiz);
          setAnswers(cachedQuiz.answers || {});
        } else {
          const res = await fetch('/api/quiz/daily', { method: 'POST' }); // Assuming POST for daily quiz fetch
          if (!res.ok) {
            throw new Error(`Error fetching daily quiz: ${res.statusText}`);
          }
          const data: DailyQuiz = await res.json();
          // Set the fetched quiz data
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          setQuiz(data);
          await cacheQuiz(data); // Cache fetched quiz
        }
      } catch (error) {
        console.error('Failed to fetch daily quiz:', error);
        // Handle error, maybe show a message to the user
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchQuiz();
    }
  }, [authLoading]);

  useEffect(() => {
    // Cache user answers whenever they change and a quiz is loaded
    if (quiz) {
      // The cacheAnswers function needs to be implemented using IndexedDB.
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      cacheAnswers(answers); // Cache answers as they change
    }
  }, [answers, quiz]);

  // Handler for when a user selects an answer for a question
  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const submissionData = {
        userId: user?.id, // Or client-generated temp id if anonymous allowed
        answers,
      };

      // Function to perform the quiz submission API call
      const submitAction = async () => {
        const res = await fetch('/api/quiz/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionData),
        });

        if (!res.ok) {
          throw new Error(`Error submitting quiz: ${res.statusText}`);
        }
        const data: QuizResult = await res.json();
        setResult(data);
        setSubmitted(true);
        // Clear cached data after successful submission
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        clearCachedQuiz(); // Clear cached quiz and answers after submission
      };

      // Check if online to submit directly or queue for offline sync
      if (navigator.onLine) {
        await submitAction();
      } else {
        // If offline, enqueue the submission action
        await enqueueOfflineAction('submitQuiz', submissionData);
        alert('You are offline. Your quiz submission has been queued.');
        // Optionally, show a UI indicator for queued submission
      }

    } catch (error) {
      console.error('Failed to submit quiz:', error);
      // Handle error, maybe show a message to the user
    } finally {
      setLoading(false);
    }
  };

  // Check if all questions have been answered to enable the submit button
  const allAnswered = quiz && Object.keys(answers).length === quiz.questions.length;

  // Display a loading state while fetching data
  if (authLoading || loading) {
    return <div>Loading daily quiz...</div>; // Skeleton loader placeholder
  }

  // Display an error message if the quiz could not be loaded
  if (!quiz) {
    return <div>Error loading quiz or no quiz available today.</div>;
  }

  // Main component structure
  // Uses AnimatePresence and motion from Framer Motion for exit/enter animations
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Daily Quiz - {quiz.date}</h1>

      <AnimatePresence>
        {!submitted ? (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-6">
              {/* Map over questions and render QuizCard for each */}
              {quiz.questions.map((question, index) => (
                <QuizCard
                  key={question.id}
                  question={question}
                  selectedAnswer={answers[question.id] || ''}
                  onAnswerChange={(answer) => handleAnswerChange(question.id, answer)}
                  isSubmitted={submitted}
                />
              ))}
            </div>

            {/* Submit button, disabled until all questions are answered */}
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || loading}
              className={`mt-8 px-6 py-3 rounded-md text-white ${
                allAnswered && !loading ? 'bg-PRIMARY hover:bg-blue-800' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Submit Quiz
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Display quiz results after submission */}
            <h2 className="text-xl font-semibold mb-4">Quiz Results</h2>
            {result && (
              <>
                <p className="text-lg mb-4">Your Score: {result.score} / {result.total}</p>
                <div className="space-y-6">
                  {/* Render QuizCards again to show feedback (correct/incorrect) */}
                  {quiz.questions.map((question) => (
                    // Pass isCorrect based on the result details
                    <QuizCard
                      key={question.id}
                      question={question}
                      selectedAnswer={answers[question.id] || ''}
                      isSubmitted={submitted}
                      isCorrect={result.details[question.id]} // Pass correctness feedback
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Display sync status indicator if pending */}
      {syncStatus === 'pending' && (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-md text-sm">
          Syncing data...
        </div>
      )}
    </div>
  );
};

export default DailyQuizPage;

// Placeholder IndexedDB helpers - implement these
// These functions are crucial for the offline functionality.
// They should use a library like 'idb' to interact with the browser's IndexedDB.
async function getCachedQuiz(): Promise<{ quiz: DailyQuiz, answers: { [key: string]: string } } | null> {
  // Implement IndexedDB logic to retrieve cached quiz and answers
  // This function should retrieve the most recent daily quiz and the user's saved answers for it.
  console.log("Getting cached quiz (placeholder)");
  return null;
}

async function cacheQuiz(quiz: DailyQuiz): Promise<void> {
  // Implement IndexedDB logic to cache the quiz
  // Store the quiz structure so it can be loaded offline.
  console.log("Caching quiz (placeholder)", quiz);
}

async function cacheAnswers(answers: { [key: string]: string }): Promise<void> {
  // Implement IndexedDB logic to cache user answers
  // Save the user's selections periodically as they take the quiz.
  console.log("Caching answers (placeholder)", answers);
}

async function clearCachedQuiz(): Promise<void> {
  // Implement IndexedDB logic to clear cached quiz and answers
  console.log("Clearing cached quiz (placeholder)");
}