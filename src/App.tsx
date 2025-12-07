import "./App.css";
import WordSpeaker from "./components/WordSpeaker";
import Menu from "./components/Menu";
// import "./utils/remCalculator";

function App() {
  return (
    <div className="app">
      <Menu />
      <WordSpeaker />
    </div>
  );
}

export default App;
