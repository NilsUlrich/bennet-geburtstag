import { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import ChallengeScreen from './components/ChallengeScreen';
import Question from './components/Question';
import ResultScreen from './components/ResultScreen';
import GiftReveal from './components/GiftReveal';
import MemoryGame from './components/MemoryGame';
import { friends, questions } from './data/quizData';
import './App.css';

function App() {
  // States: 'welcome', 'quiz', 'result', 'end-challenge', 'memory', 'gift'
  const [gameState, setGameState] = useState('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [lastAnswer, setLastAnswer] = useState(null);

  const handleStart = () => {
    setGameState('quiz');
    setCurrentQuestion(0);
    setScore(0);
  };

  const handleAnswer = (friendId) => {
    const isCorrect = friendId === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    const correctFriend = friends.find(
      (f) => f.id === questions[currentQuestion].correctAnswer
    );

    setLastAnswer({
      isCorrect,
      selectedId: friendId,
      correctAnswer: correctFriend?.name || 'Unbekannt',
      friend: correctFriend,
    });

    setGameState('result');
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setLastAnswer(null);
      setGameState('quiz');
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
          friends={friends}
          onAnswer={handleAnswer}
        />
      )}

      {gameState === 'result' && lastAnswer && (
        <ResultScreen
          isCorrect={lastAnswer.isCorrect}
          correctAnswer={lastAnswer.correctAnswer}
          friend={lastAnswer.friend}
          trollImage={lastAnswer.friend?.image}
          onNext={handleNextQuestion}
          questionNumber={currentQuestion}
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
