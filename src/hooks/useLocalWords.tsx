import { useEffect, useState, useContext, useMemo } from "react";
import { WordContext, type WordType } from "../context/WordContext";
import { wordWorker } from "@/utils/wordWorker";
import IndexedDB from "@/utils/indexedDB";
interface OptionType extends WordType {
  options: WordType[];
  selectWord: string;
  key: string;
}
const indexedDB = new IndexedDB({
  dbName: "myweek",
  stores: [
    { storeName: "allWords", keyPath: "key" },
    { storeName: "keyWords", keyPath: "key" },
  ],
});

export const useLocalWords = (props: { checked: boolean }) => {
  const { checked } = props;

  const word = useContext(WordContext);
  const [allWords, setAllWords] = useState<OptionType[]>([]);
  const [keyWords, setKeyWords] = useState<OptionType[]>([]);
  const [allWordsIndex, setAllWordsIndex] = useState<number>(
    Number(localStorage.getItem("allWordsIndex")) || 0
  );
  const [keyWordsIndex, setKeyWordsIndex] = useState<number>(
    Number(localStorage.getItem("keyWordsIndex")) || 0
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeWords = async () => {
      try {
        setIsLoading(true);

        // 检查是否已有存储的数据
        const allWordsJson: OptionType[] = await indexedDB.getAll("allWords");
        const keyWordsJson: OptionType[] = await indexedDB.getAll("keyWords");

        if (
          allWordsJson &&
          allWordsJson.length > 0 &&
          keyWordsJson &&
          keyWordsJson.length > 0
        ) {
          const sortAll = allWordsJson.sort((a, b) => {
            const aIndex = a.key.split("_")[1];
            const bIndex = b.key.split("_")[1];
            return Number(aIndex) - Number(bIndex);
          });

          const sortKey = keyWordsJson.sort((a, b) => {
            const aIndex = a.key.split("_")[1];
            const bIndex = b.key.split("_")[1];
            return Number(aIndex) - Number(bIndex);
          });
          // 已有存储的数据，直接使用
          setAllWords(sortAll);
          setKeyWords(sortKey);
          setAllWordsIndex(Number(allWordsIndex!));
          setKeyWordsIndex(Number(keyWordsIndex!));
          setIsLoading(false);
        } else {
          handleResetData();
        }
      } catch (err) {
        console.error("Error initializing words:", err);
        setIsLoading(false);
      }
    };

    initializeWords();
  }, [word]);

  const handleResetData = async () => {
    setIsLoading(true);

    await indexedDB.removeAll("allWords");
    await indexedDB.removeAll("keyWords");
    // 创建 Web Worker 生成单词选项
    const workerBlob = new Blob([wordWorker], {
      type: "application/javascript",
    });
    const workerUrl = URL.createObjectURL(workerBlob);
    const worker = new Worker(workerUrl);

    worker.onmessage = (e) => {
      if (e.data.type === "wordOptionsGenerated") {
        const { allWords: generatedAllWords, keyWords: generatedKeyWords } =
          e.data.data;

        // 保存到状态
        setAllWords(generatedAllWords);
        setKeyWords(generatedKeyWords);
        setAllWordsIndex(0);
        setKeyWordsIndex(0);

        indexedDB.addItem(generatedAllWords, "allWords");
        indexedDB.addItem(generatedKeyWords, "keyWords");

        localStorage.setItem("allWordsIndex", "0");
        localStorage.setItem("keyWordsIndex", "0");

        // 清理资源
        URL.revokeObjectURL(workerUrl);
        worker.terminate();
        setIsLoading(false);
      }
    };

    // 发送数据给 Worker
    worker.postMessage({
      type: "generateWordOptions",
      data: word,
    });
  };
  const handleEditIndexedDB = (data: OptionType) => {
    if (checked) {
      indexedDB.editItem([data], "keyWords");
    } else {
      indexedDB.editItem([data], "allWords");
    }
  };

  const handleSetData = (data: OptionType[]) => {
    if (checked) {
      setKeyWords([...data]);
    } else {
      setAllWords([...data]);
    }
  };

  useEffect(() => {
    console.log(keyWordsIndex, "keyWordsIndex");
    localStorage.setItem("keyWordsIndex", String(keyWordsIndex));
  }, [keyWordsIndex]);

  useEffect(() => {
    localStorage.setItem("allWordsIndex", String(allWordsIndex));
  }, [allWordsIndex]);

  const handleLastClick = () => {
    if (checked) {
      localStorage.setItem("keyWordsIndex", JSON.stringify(keyWordsIndex - 1));
      setKeyWordsIndex((prevIndex) => prevIndex - 1);
    } else {
      localStorage.setItem("allWordsIndex", JSON.stringify(keyWordsIndex - 1));
      setAllWordsIndex((prevIndex) => prevIndex - 1);
    }
  };

  const setIndex = (index: number) => {
    if (checked) {
      setKeyWordsIndex(index);
    } else {
      setAllWordsIndex(index);
    }
  };

  const handleNextClick = () => {
    if (checked) {
      localStorage.setItem("keyWordsIndex", JSON.stringify(keyWordsIndex + 1));
      setKeyWordsIndex((prevIndex) => prevIndex + 1);
    } else {
      localStorage.setItem("allWordsIndex", JSON.stringify(keyWordsIndex + 1));
      setAllWordsIndex((prevIndex) => prevIndex + 1);
    }
  };

  // 获取当前使用的单词列表（根据需要选择）
  const getCurrentWords = useMemo(() => {
    return {
      data: checked ? keyWords : allWords,
      dataIndex: checked ? keyWordsIndex : allWordsIndex,
    };
  }, [checked, allWords, allWordsIndex, keyWords, keyWordsIndex]);

  return {
    allWords, // 所有单词
    keyWords, // 从所有单词中筛选出的重点单词
    getCurrentWords, // 获取当前单词列表的函数
    allWordsIndex,
    keyWordsIndex,
    isLoading,
    handleLastClick,
    handleNextClick,
    handleSetData,
    handleEditIndexedDB,
    handleResetData,
    setIndex,
  };
};
