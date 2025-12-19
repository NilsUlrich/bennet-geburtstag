import { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import ChallengeScreen from './components/ChallengeScreen';
import Question from './components/Question';
import GiftReveal from './components/GiftReveal';
import MemoryGame from './components/MemoryGame';
import { questions } from './data/quizData';
import './App.css';

function App() {
  // States: 'welcome', 'quiz', 'end-challenge', 'memory', 'gift'
  const [gameState, setGameState] = useState('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

  const handleStart = () => {
    setGameState('quiz');
    setCurrentQuestion(0);
    setScore(0);
  };

  const handleAnswer = (answerId) => {
    const currentQ = questions[currentQuestion];
    const isCorrect = answerId === currentQ.correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      // Go to end challenge (coding) before gift
      setGameState('end-challenge');
    }
  };

  const handleEndChallengeComplete = () => {
    // Nach Coding Challenge automatisch ins Memory
    setGameState('memory');
  };

  const handleMemoryComplete = () => {
    // Nach Memory zum Geschenk
    setGameState('gift');
  };

  return (
    <div className="app">
      {gameState === 'welcome' && <WelcomeScreen onStart={handleStart} />}

      {gameState === 'quiz' && (
        <Question
          question={questions[currentQuestion]}
          questionNumber={currentQuestion + 1}
          totalQuestions={questions.length}
          onAnswer={handleAnswer}
          onNext={handleNextQuestion}
        />
      )}

      {gameState === 'end-challenge' && (
        <ChallengeScreen
          onComplete={handleEndChallengeComplete}
          isEndChallenge={true}
        />
      )}

      {gameState === 'memory' && (
        <MemoryGame gridPairs={6} onComplete={handleMemoryComplete} />
      )}

      {gameState === 'gift' && (
        <GiftReveal score={score} totalQuestions={questions.length} />
      )}
    </div>
  );
}

export default App;
