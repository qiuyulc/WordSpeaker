import "./App.css";
import { WordContext, type WordsType } from "@/context/WordContext";
import RouterView from "./router";
// import "./utils/remCalculator";
import { Notify } from "react-vant";
import { useEffect, useState } from "react";
function App() {
  const [words, setWords] = useState<WordsType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/word.json")
      .then((response) => response.json())
      .then((data) => {
        setWords(data);
        setLoading(false);
      })
      .catch(() => {
        Notify.show({ message: "数据加载失败！", duration: 1000 });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>; // 或显示加载动画
  }

  return (
    <div className="app">
      <WordContext.Provider value={words as WordsType[]}>
        <RouterView />
      </WordContext.Provider>
    </div>
  );
}

export default App;
