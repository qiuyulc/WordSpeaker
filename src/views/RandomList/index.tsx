import styles from "./index.module.less";
import { useLocalWords } from "@/hooks/useLocalWords";
import {
  NavBar,
  Switch,
  Card,
  Radio,
  Button,
  Notify,
  Loading,
  Stepper,
  Popup,
  Cell,
} from "react-vant";
import { useLocation, useNavigate } from "react-router";
import { useMemo, useState, useEffect, useCallback } from "react";
import { Volume, Success, Cross, Replay } from "@react-vant/icons";
import useSpeech from "../../hooks/useSpeech";
const RandomList = () => {
  const [checked, setChecked] = useState(false);

  const {
    isLoading,
    getCurrentWords,
    handleLastClick,
    handleNextClick,
    handleSetData,
    handleEditIndexedDB,
    handleResetData,
    setIndex,
  } = useLocalWords({ checked });

  const [visible, setVisible] = useState(false);
  const { state: locationState } = useLocation();
  const navigate = useNavigate();
  const handleReset = () => {
    handleResetData();
    setChecked(false);
  };
  const getStatus = useMemo(() => {
    return {
      title: "随机模式",
      rightText: <Replay style={{ fontSize: 20 }} />,
      onClickRight: handleReset,
    };
  }, [locationState]);

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

  const onChange = (checked: boolean) => {
    setChecked(checked);
  };

  const wordData = useMemo(() => {
    const { data, dataIndex } = getCurrentWords;
    return data[dataIndex];
  }, [getCurrentWords]);

  const [autoChecked, setAutoChecked] = useState(false);
  const onAutoChange = (val: boolean) => {
    setAutoChecked(val);
  };

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

  const handlePlay = (event: React.MouseEvent<HTMLSpanElement>, u: string) => {
    event.stopPropagation();
    playText(u);
  };

  useEffect(() => {
    if (wordData && autoChecked) {
      playText(wordData.word);
    }
  }, [wordData, autoChecked]);

  const lastClick = useCallback(() => {
    const { dataIndex } = getCurrentWords;
    if (dataIndex === 0) {
      Notify.show({ type: "success", message: "现在是第一个单词" });
    } else {
      handleLastClick();
    }
  }, [getCurrentWords]);

  const nextClick = useCallback(() => {
    const { data, dataIndex } = getCurrentWords;
    if (dataIndex === data.length - 1) {
      Notify.show({ type: "success", message: "现在是最后一个单词" });
    } else {
      handleNextClick();
    }
  }, [getCurrentWords]);

  const radioValueChange = (val: string) => {
    const { data } = getCurrentWords;

    for (let i = 0; i < data.length; i++) {
      if (data[i].word === wordData.word) {
        data[i].selectWord = val;
        handleEditIndexedDB(data[i]);
        break;
      }
    }
    handleSetData(data);
  };
  if (isLoading)
    return (
      <div className={styles.loading}>
        <Loading color="#3f45ff" />
      </div>
    );
  return (
    <div className={styles.random_list}>
      <NavBar
        style={{ flexShrink: 0 }}
        title={getStatus?.title}
        leftText="返回"
        onClickLeft={() => {
          navigate("/trial");
        }}
        rightText={getStatus?.rightText}
        onClickRight={getStatus?.onClickRight}
      />

      <div className={styles.content}>
        <div className={styles.tools}>
          <div className={styles.count}>
            {getCurrentWords.dataIndex + 1 + "/" + getCurrentWords.data.length}
          </div>
          <div className={styles.auto}>
            <span className={styles.auto_title}>自动播放:</span>
            <Switch
              checked={autoChecked}
              onChange={onAutoChange}
              size="18px"
            ></Switch>
          </div>
          <div className={styles.need}>
            <span className={styles.need_title}>重点:</span>
            <Switch checked={checked} onChange={onChange} size="18px"></Switch>
          </div>
        </div>

        <div className={styles.card}>
          <Card>
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
                    state.isPlaying && state.currentWord === wordData.word
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
              {/* <Button
                type="primary"
                onClick={() => setVisible(true)}
                round
                size="small"
              >
                跳转
              </Button> */}
              <Button type="primary" onClick={nextClick} round size="small">
                下一个
              </Button>
            </Card.Footer>
          </Card>

          {/* <Popup
            position="bottom"
            visible={visible}
            style={{ height: "30%" }}
            onClose={() => setVisible(false)}
          >
            <div className={styles.popup}>
              <Cell title="跳转至" center>
                <Stepper
                  min={0}
                  value={getCurrentWords.dataIndex}
                  onChange={(v) => {
                    setIndex(v as number);
                  }}
                />
              </Cell>
            </div>
          </Popup> */}
        </div>
      </div>
    </div>
  );
};
export default RandomList;
