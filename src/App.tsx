import "./App.css";
import { WordContext, type WordsType } from "@/context/WordContext";
import RouterView from "./router";
// import "./utils/remCalculator";
import word from "@/assets/word.json";

function App() {
  return (
    <div className="app">
      <WordContext value={word as WordsType[]}>
        <RouterView />
      </WordContext>
    </div>
  );
}

export default App;
