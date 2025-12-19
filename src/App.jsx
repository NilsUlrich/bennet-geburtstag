import { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import Question from './components/Question';
import GiftReveal from './components/GiftReveal';
import { friends, questions } from './data/quizData';
import './App.css';

function App() {
  const [gameState, setGameState] = useState('welcome'); // 'welcome', 'quiz', 'result'
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleStart = () => {
    setGameState('quiz');
    setCurrentQuestion(0);
    setScore(0);
  };

  const handleAnswer = (friendId) => {
    setSelectedAnswer(friendId);
    setShowResult(true);

    const isCorrect = friendId === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setGameState('result');
      }
    }, 1500);
  };

  return (
    <div className="app">
      {gameState === 'welcome' && <WelcomeScreen onStart={handleStart} />}

      {gameState === 'quiz' && (
        <Question
          question={questions[currentQuestion]}
          questionNumber={currentQuestion + 1}
          totalQuestions={questions.length}
          friends={friends}
          onAnswer={handleAnswer}
          selectedAnswer={selectedAnswer}
          showResult={showResult}
        />
      )}

      {gameState === 'result' && (
        <GiftReveal score={score} totalQuestions={questions.length} />
      )}
    </div>
  );
}

export default App;
