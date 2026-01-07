import styles from "./index.module.less";
import { NavBar, Notify, Tabs, Card, Button, Radio } from "react-vant";
import { useMemo, useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Replay, Success, Cross, Volume } from "@react-vant/icons";
import { WordContext, type WordType } from "@/context/WordContext";
import { getRandomItems } from "@/utils/quizUtils";
import useSpeech from "../../hooks/useSpeech";
interface OptionType extends WordType {
  options: WordType[];
  selectWord: string;
}

export const OrderItem = (props: {
  title: string;
  playText: (val: string) => void;
  isPlaying: boolean;
  currentWord: string;
}) => {
  const { title, playText, isPlaying, currentWord } = props;
  const word = useContext(WordContext);
  const [wordIndex, setWordIndex] = useState(0);
  const [words, setWords] = useState<OptionType[]>([]);

  useEffect(() => {
    const data = word.find((u) => u.title === title);
    const dataWords = data?.words || [];

    const options: OptionType[] = [];
    for (let i = 0; i < dataWords.length; i++) {
      const wrongWordCandidates = dataWords.filter(
        (w) => w.word !== dataWords[i].word
      );

      const selectedWrongWords = getRandomItems(wrongWordCandidates, 3);

      const allOptions = getRandomItems(
        [dataWords[i], ...selectedWrongWords],
        4
      );

      options.push({
        ...dataWords[i],
        options: allOptions,
        selectWord: "",
      });
    }

    setWords(options);
  }, [title]);

  const handlePlay = (event: React.MouseEvent<HTMLSpanElement>, u: string) => {
    event.stopPropagation();
    playText(u);
  };

  const wordData = useMemo(() => {
    return words[wordIndex];
  }, [wordIndex, words]);
  const getMeaning = (
    definitions_by_pos: Record<string, string | undefined>
  ) => {
    const keys = Object.keys(definitions_by_pos);
    if (keys.length > 0) {
      return keys.map((u) => {
        return (
          <div key={u}>
            <span style={{ marginRight: 5 }}>{u}</span>
            <span>{definitions_by_pos[u]}</span>
          </div>
        );
      });
    }
    return "";
  };

  const radioValueChange = (val: string) => {
    for (let i = 0; i < words.length; i++) {
      if (words[i].word === wordData.word) {
        words[i].selectWord = val;
        break;
      }
    }

    setWords([...words]);
  };

  const lastClick = () => {
    if (wordIndex === 0) {
      setWordIndex(0);
    } else {
      setWordIndex(wordIndex - 1);
    }
  };
  const nextClick = () => {
    if (wordIndex === words.length - 1) {
      setWordIndex(words.length - 1);
    } else {
      setWordIndex(wordIndex + 1);
    }
  };
  return (
    <Card className={styles.card}>
      <Card.Header className={styles.header}>
        <div className={styles.header_cont}>
          <span className={styles.word}>
            {wordData?.key_word ? (
              <span className={styles.card_title_icon}>*</span>
            ) : (
              ""
            )}
            {wordData?.word}
          </span>
          <span className={styles.phonetic}>{wordData?.phonetic}</span>
          <span
            className={`${styles.card_icon} ${
              isPlaying && currentWord === wordData.word
                ? styles.card_icon_playing
                : ""
            } `}
            onClick={(event: React.MouseEvent<HTMLSpanElement>) =>
              handlePlay(event, wordData.word)
            }
          >
            <Volume />
          </span>
        </div>
      </Card.Header>
      <Card.Body className={styles.body}>
        <Radio.Group
          className={styles.card_radio}
          value={wordData?.selectWord}
          onChange={radioValueChange}
        >
          {wordData?.options.map((item) => {
            return (
              <Radio
                style={{
                  "--rv-radio-checked-icon-color":
                    wordData.word === wordData.selectWord
                      ? "var(--rv-blue)"
                      : "var(--rv-danger-color)",
                }}
                iconRender={() => {
                  return wordData.word === wordData.selectWord ? (
                    <Success />
                  ) : (
                    <Cross />
                  );
                }}
                key={item.word}
                name={item.word}
              >
                <div className={styles.card_radio_item}>
                  {getMeaning(item.definitions_by_pos)}
                </div>
              </Radio>
            );
          })}
        </Radio.Group>
      </Card.Body>
      <Card.Footer className={styles.footer}>
        <Button type="primary" onClick={lastClick} round size="small">
          上一个
        </Button>
        <Button type="primary" onClick={nextClick} round size="small">
          下一个
        </Button>
      </Card.Footer>
    </Card>
  );
};

export const OrderTabs = () => {
  const uppercaseLetters = Array.from(Array(26), (_, i) =>
    String.fromCharCode(i + 65)
  );

  const [state, controls] = useSpeech("", {
    rate: 0.6, // 稍微慢一点，方便学习
    lang: "en-US",
    voiceName: "Samantha",
  });
  const playText = (text: string) => {
    if (text) {
      controls.speak(text);
    }
  };
  return (
    <div className={styles.tabs}>
      <Tabs sticky className={styles.tabs}>
        {uppercaseLetters.map((u) => {
          return (
            <Tabs.TabPane key={u} title={u}>
              <OrderItem
                isPlaying={state.isPlaying}
                playText={playText}
                currentWord={state.currentWord}
                title={u}
              />
            </Tabs.TabPane>
          );
        })}
      </Tabs>
    </div>
  );
};

const OrderList = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const handleRest = () => {
    Notify.show({ type: "success", message: "成功刷新题库" });
  };
  const getStatus = useMemo(() => {
    return {
      title: "闯关模式",
      rightText: <Replay style={{ fontSize: 20 }} />,
      onClickRight: handleRest,
    };
  }, [state]);
  return (
    <div className={styles.order}>
      <NavBar
        style={{ flexShrink: 0 }}
        title={getStatus?.title}
        leftText="返回"
        // rightText={getStatus?.rightText}
        onClickLeft={() => {
          navigate("/trial");
        }}
        // onClickRight={getStatus?.onClickRight}
      />

      <div className={styles.content}>
        <OrderTabs></OrderTabs>
      </div>
    </div>
  );
};

export default OrderList;
