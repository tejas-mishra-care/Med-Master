// app/quiz/weekly/page.tsx

// app/quiz/weekly/page.tsx
import { useState, useEffect } from 'react';
// import Head from 'next/head'; // Using next/head might be deprecated in App Router, consider using metadata

interface Question {
  id: string;
  text: string;
  options: { [key: string]: string };
}

// Component for the weekly quiz page
const WeeklyQuizPage = () => {
  // State to store the quiz questions
  const [questions, setQuestions] = useState<Question[]>([]);
  // State to manage loading state
  const [loading, setLoading] = useState(true);
  // State for the quiz timer (initialized to 40 minutes)
  const [timeRemaining, setTimeRemaining] = useState(40 * 60); // 40 minutes in seconds
  // State to track if the quiz is currently active
  const [quizActive, setQuizActive] = useState(false);

  // Effect to fetch weekly quiz questions on component mount
  useEffect(() => {
    // Fetch weekly quiz questions (stub)
    const fetchWeeklyQuiz = async () => {
      setLoading(true);
      // In a real implementation, this would call your API
      // const response = await fetch('/api/quiz/weekly');
      // const data = await response.json();
      // setQuestions(data.questions);

      // TODO: Replace with actual API call to fetch weekly quiz questions
      // Placeholder data
      setQuestions([
        { id: 'q1', text: 'What is the powerhouse of the cell?', options: { A: 'Nucleus', B: 'Mitochondria', C: 'Ribosome', D: 'Endoplasmic Reticulum' } },
        { id: 'q2', text: 'Which bone is the longest in the human body?', options: { A: 'Tibia', B: 'Fibula', C: 'Femur', D: 'Humerus' } },
        // Add more placeholder questions up to 20
      ]);
      setLoading(false);
      setQuizActive(true); // Start timer once questions are loaded
    };

    fetchWeeklyQuiz();
  }, []);

  // Effect to manage the quiz timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (quizActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0 && quizActive) {
      handleSubmitQuiz(); // Auto-submit on time up
      alert('Time is up! Your quiz has been submitted.');
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeRemaining, quizActive]);

  // Helper function to format time in minutes and seconds
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Handler for stopping the quiz
  const handleStopQuiz = () => {
    if (confirm('Are you sure you want to stop the quiz? Your progress will be lost.')) {
      setQuizActive(false);
      setTimeRemaining(40 * 60); // Reset timer
      setQuestions([]); // Clear questions
      // Redirect or show a message
    }
  };

  // Handler for submitting the quiz
  const handleSubmitQuiz = () => {
    setQuizActive(false);
    // In a real implementation, collect answers and POST to /api/quiz/submit
    // TODO: Implement actual quiz submission logic
    alert('Quiz submitted (placeholder)');
    // Process submission, show results, etc.
  };

  if (loading) {
    return <div>Loading weekly quiz...</div>;
  }

  // Render message if quiz is not active
  if (!quizActive) {
    return <div>Weekly quiz finished or stopped.</div>;
  }

  // Main quiz UI
  return (
    <div className="container mx-auto p-4">
      {/* TODO: Use App Router metadata instead of Head */}
      <Head>
        <title>Weekly Quiz - MedMaster</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Weekly Quiz</h1>
      <div className="flex justify-between items-center mb-4">
        {/* Timer display with ARIA label for accessibility */}
        <div className="text-lg" role="timer" aria-label={`Time remaining: ${formatTime(timeRemaining)} minutes and seconds`}>
          {/* Displays the formatted time remaining */}
          Time Remaining: {formatTime(timeRemaining)}
        </div>
        <div>
          <button
            onClick={handleStopQuiz}
            className="bg-red-500 text-white px-4 py-2 rounded mr-2"
            aria-label="Stop quiz"
          >
            {/* Button to stop the quiz */}
            Stop Quiz
          </button>
          <button
            onClick={handleSubmitQuiz}
            className="bg-green-500 text-white px-4 py-2 rounded"
            aria-label="Submit quiz"
          >
            {/* Button to submit the quiz */}
            Submit Quiz
          </button>
        </div>
      </div>

      {/* Map through questions and render them */}
      {questions.map((question, index) => (
        // Each question card
        <div key={question.id} className="bg-white shadow-md rounded-lg p-6 mb-4">
          <h2 className="text-lg font-semibold mb-3">{index + 1}. {question.text}</h2>
          {Object.entries(question.options).map(([key, value]) => (
            <div key={key} className="mb-2">
              <input
                type="radio"
                id={`q${question.id}-option-${key}`}
                name={`question-${question.id}`}
                value={key}
                className="mr-2"
                // TODO: Implement state management for selected options
                // In a real app, manage selected state
              />
              <label htmlFor={`q${question.id}-option-${key}`}>{key}. {value}</label>
            </div>
          ))}
        </div>
      ))}

      <div className="flex justify-end mt-4">
        <button
          // Second submit button at the bottom
          onClick={handleSubmitQuiz}
          className="bg-green-500 text-white px-4 py-2 rounded"
          aria-label="Submit quiz"
        >
          Submit Quiz
        </button>
      </div>
    </div>
  );
};
// Export the component
export default WeeklyQuizPage;