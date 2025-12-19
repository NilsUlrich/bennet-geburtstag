import './WelcomeScreen.css';

function WelcomeScreen({ onStart }) {
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <h1 className="welcome-title">Happy Birthday!</h1>
        <h2 className="welcome-name">Bennet</h2>
        <p className="welcome-text">
          Wir haben ein kleines Quiz für dich vorbereitet!
        </p>
        <p className="welcome-subtext">
          Wie gut kennst du deine Freunde?
        </p>
        <button className="start-button" onClick={onStart}>
          Quiz starten
        </button>
      </div>
    </div>
  );
}

export default WelcomeScreen;
