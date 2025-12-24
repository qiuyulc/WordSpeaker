import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { useContext, useState } from "react";
import styles from "./index.module.less";
import { createWordQuizOptimized, type QuizQuestion } from "@/utils/quizUtils";
import { WordContext, type WordType } from "@/context/WordContext";
import { Card, Button, Radio, Progress, NavBar, Notify } from "react-vant";
import { Cross, Success, Replay } from "@react-vant/icons";

const Random = (props: {
  wordIndex: number;
  getWord: QuizQuestion;
  radioValue: string;
  radioValueChange: (val: string) => void;
}) => {
  const { wordIndex, getWord, radioValue, radioValueChange } = props;
  return (
    <>
      <div className={styles.random_title}>
        <div className={styles.progress}>
          <span className={styles.text}>1</span>
          <Progress
            className={styles.progress_bar}
            // color="linear-gradient(to right, #be99ff, #7232dd)"
            percentage={wordIndex + 1}
            // pivotColor="#7232dd"
            pivotText={<div>{wordIndex + 1}</div>}
          />
          <span className={styles.text}>100</span>
        </div>
      </div>
      <div className={styles.random_content}>
        <Card className={styles.card}>
          <Card.Header>
            <span className={`${styles.card_word}`}>
              {getWord?.isKeyWord ? (
                <span className={styles.card_title_icon}>*</span>
              ) : (
                ""
              )}
              <i>{getWord?.correctWord}</i>
              <span className={styles.card_word_phonetic}>
                {getWord?.correctPhonetic}
              </span>
            </span>
          </Card.Header>
          <Card.Body>
            <div className={styles.card_content}>
              <Radio.Group
                className={styles.card_radio}
                value={radioValue}
                onChange={radioValueChange}
              >
                {getWord?.options.map((item) => {
                  return (
                    <Radio
                      style={{
                        "--rv-radio-checked-icon-color":
                          item.word === getWord.correctWord
                            ? "var(--rv-blue)"
                            : "var(--rv-danger-color)",
                      }}
                      iconRender={() => {
                        return item.word === getWord.correctWord ? (
                          <Success />
                        ) : (
                          <Cross />
                        );
                      }}
                      key={item.word}
                      name={item.word}
                    >
                      {item.definition}
                    </Radio>
                  );
                })}
              </Radio.Group>
              <div className={styles.answer}>
                {radioValue && radioValue !== getWord?.correctWord ? (
                  <>
                    <span>正确答案：</span>
                    <span>{getWord?.correctDefinition}</span>
                  </>
                ) : (
                  ""
                )}
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

const TrialList = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const word = useContext(WordContext);
  const [reset, setReset] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [radioValue, setRadioValue] = useState("");
  const getWords = useMemo(() => {
    const words: WordType[] = [];
    word.forEach((item) => {
      words.push(...item.words);
    });
    return words;
  }, [word]);

  const getWordsList = useMemo(() => {
    if (state.type === "random") {
      return createWordQuizOptimized(getWords, 100);
    }
    return [];
  }, [state, getWords, reset]);

  const getWord = useMemo(() => {
    if (getWordsList.length === 0) return null;
    return getWordsList[wordIndex];
  }, [getWordsList, wordIndex]);

  const radioValueChange = (name: string) => {
    setRadioValue(name);
  };

  const prevQuestion = () => {
    if (wordIndex !== 0) {
      setWordIndex(wordIndex - 1);
      setRadioValue("");
    }
  };

  const nextQuestion = () => {
    if (wordIndex !== getWordsList.length - 1) {
      setWordIndex(wordIndex + 1);
      setRadioValue("");
    } else {
      handleRest();
    }
  };

  const handleRest = () => {
    setReset((prev) => !prev);
    setWordIndex(0);
    setRadioValue("");
    Notify.show({ type: "success", message: "成功刷新题库" });
  };

  const getStatus = useMemo(() => {
    if (state.type === "random") {
      return {
        title: "随机模式",
        rightText: <Replay style={{ fontSize: 20 }} />,
        onClickRight: handleRest,
      };
    }
  }, [state]);
  return (
    <>
      <NavBar
        style={{ flexShrink: 0 }}
        title={getStatus?.title}
        leftText="返回"
        rightText={getStatus?.rightText}
        onClickLeft={() => {
          navigate("/trial");
        }}
        onClickRight={getStatus?.onClickRight}
      />
      <div className={styles.trial_list}>
        {state.type === "random" && getWord && (
          <Random
            wordIndex={wordIndex}
            getWord={getWord}
            radioValue={radioValue}
            radioValueChange={radioValueChange}
          />
        )}

        <div className={styles.button_group}>
          <Button type="primary" onClick={prevQuestion}>
            上一题
          </Button>
          <Button type="primary" onClick={nextQuestion}>
            下一题
          </Button>
        </div>
      </div>
    </>
  );
};

export default TrialList;
