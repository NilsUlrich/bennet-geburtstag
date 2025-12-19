import './Question.css';

function Question({ question, questionNumber, totalQuestions, friends, onAnswer, selectedAnswer, showResult }) {
  return (
    <div className="question-screen">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
        />
      </div>

      <div className="question-counter">
        Frage {questionNumber} von {totalQuestions}
      </div>

      <h2 className="question-text">{question.question}</h2>

      <div className="answers-grid">
        {friends.map((friend) => {
          const isSelected = selectedAnswer === friend.id;
          const isCorrect = friend.id === question.correctAnswer;

          let buttonClass = 'answer-button';
          if (showResult && isSelected) {
            buttonClass += isCorrect ? ' correct' : ' incorrect';
          }
          if (showResult && isCorrect && !isSelected) {
            buttonClass += ' correct';
          }

          return (
            <button
              key={friend.id}
              className={buttonClass}
              onClick={() => !showResult && onAnswer(friend.id)}
              disabled={showResult}
            >
              <div className="answer-image-container">
                <img
                  src={friend.image}
                  alt={friend.name}
                  className="answer-image"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name)}&background=667eea&color=fff&size=150`;
                  }}
                />
              </div>
              <span className="answer-name">{friend.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Question;