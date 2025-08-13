import { render, screen, fireEvent } from '@testing-library/react';
import QuizCard from '../components/QuizCard'; // Adjust the import path as needed
// Import Jest DOM for extended matchers
import '@testing-library/jest-dom';

const mockQuestion = {
  id: '1',
  text: 'What is the powerhouse of the cell?',
  options: { A: 'Nucleus', B: 'Mitochondria', C: 'Ribosome', D: 'Endoplasmic Reticulum' },
  subject: 'Biology',
  tags: ['Cell Biology'],
  notes: '',
  correct_option: 'B', // Include correct option for testing
  created_at: new Date().toISOString(),
};

describe('QuizCard', () => {
  // Mock functions for handlers
  const mockOnAnswerSelect = jest.fn();
  const mockOnSubmitAnswer = jest.fn();
  const mockIsSubmitted = false;
  const mockSelectedAnswer = null;
  const mockIsLoading = false;
  const mockShowFeedback = false;

  // Test case to ensure the question text and options are rendered correctly
  test('renders question and options', () => {
    render(
      <QuizCard
        question={mockQuestion}
        onAnswerSelect={mockOnAnswerSelect}
        onSubmitAnswer={mockOnSubmitAnswer}
        isSubmitted={mockIsSubmitted}
        selectedAnswer={mockSelectedAnswer}
        isLoading={mockIsLoading}
        showFeedback={mockShowFeedback}
        isDailyQuiz={true}
        isWeeklyQuiz={false}
      />
    );

    expect(screen.getByText('What is the powerhouse of the cell?')).toBeInTheDocument();
    expect(screen.getByLabelText('A) Nucleus')).toBeInTheDocument();
    expect(screen.getByLabelText('B) Mitochondria')).toBeInTheDocument();
    expect(screen.getByLabelText('C) Ribosome')).toBeInTheDocument();
    expect(screen.getByLabelText('D) Endoplasmic Reticulum')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Submit/i })).not.toBeInTheDocument();
  });

  // Test case to verify that the onAnswerSelect function is called when an option is clicked
  test('calls onAnswerSelect when an option is selected', () => {
    render(
      <QuizCard
        question={mockQuestion}
        onAnswerSelect={mockOnAnswerSelect}
        onSubmitAnswer={mockOnSubmitAnswer}
        isSubmitted={mockIsSubmitted}
        selectedAnswer={mockSelectedAnswer}
        isLoading={mockIsLoading}
        showFeedback={mockShowFeedback}
        isDailyQuiz={true}
        isWeeklyQuiz={false}
      />
    );

    fireEvent.click(screen.getByLabelText('B) Mitochondria'));
    expect(mockOnAnswerSelect).toHaveBeenCalledWith(mockQuestion.id, 'B');
  });

  // Test case to check if radio buttons are disabled after the quiz is submitted
  test('disables radio buttons when submitted', () => {
    render(
      <QuizCard
        question={mockQuestion}
        onAnswerSelect={mockOnAnswerSelect}
        onSubmitAnswer={mockOnSubmitAnswer}
        isSubmitted={true}
        selectedAnswer={'B'}
        isLoading={mockIsLoading}
        showFeedback={true}
        isDailyQuiz={true}
        isWeeklyQuiz={false}
      />
    );

    fireEvent.click(screen.getByLabelText('A) Nucleus'));
    expect(mockOnAnswerSelect).not.toHaveBeenCalled();
    expect(screen.getByLabelText('A) Nucleus')).toBeDisabled();
    expect(screen.getByLabelText('B) Mitochondria')).toBeDisabled();
  });

  // Test case to ensure the submit button is not initially visible for daily quizzes
  test('does not show submit button for daily quiz initially', () => {
    render(
      <QuizCard
        question={mockQuestion}
        onAnswerSelect={mockOnAnswerSelect}
        onSubmitAnswer={mockOnSubmitAnswer}
        isSubmitted={mockIsSubmitted}
        selectedAnswer={mockSelectedAnswer}
        isLoading={mockIsLoading}
        showFeedback={mockShowFeedback}
        isDailyQuiz={true}
        isWeeklyQuiz={false}
      />
    );
    expect(screen.queryByRole('button', { name: /Submit/i })).not.toBeInTheDocument();
  });

  // Add tests for showing feedback based on `showFeedback` prop
  // Test case to verify correct feedback is displayed for a correct answer after submission
  test('shows correct feedback when submitted and feedback is shown', () => {
    render(
      <QuizCard
        question={mockQuestion}
        onAnswerSelect={mockOnAnswerSelect}
        onSubmitAnswer={mockOnSubmitAnswer}
        isSubmitted={true}
        selectedAnswer={'B'} // Correct answer
        isLoading={mockIsLoading}
        showFeedback={true}
        isDailyQuiz={true}
        isWeeklyQuiz={false}
      />
    );
    expect(screen.getByLabelText('B) Mitochondria')).toHaveClass('bg-green-200'); // Assuming green for correct
    expect(screen.getByText('Correct!')).toBeInTheDocument();
  });

  // Test case to verify incorrect feedback and the correct answer are displayed for an incorrect answer after submission
  test('shows incorrect feedback when submitted and feedback is shown', () => {
    render(
      <QuizCard
        question={mockQuestion}
        onAnswerSelect={mockOnAnswerSelect}
        onSubmitAnswer={mockOnSubmitAnswer}
        isSubmitted={true}
        selectedAnswer={'A'} // Incorrect answer
        isLoading={mockIsLoading}
        showFeedback={true}
        isDailyQuiz={true}
        isWeeklyQuiz={false}
      />
    );
    expect(screen.getByLabelText('A) Nucleus')).toHaveClass('bg-red-200'); // Assuming red for incorrect
    expect(screen.getByLabelText('B) Mitochondria')).toHaveClass('bg-green-200'); // Assuming green for correct answer
    expect(screen.getByText('Incorrect. The correct answer is B.')).toBeInTheDocument();
  });
});