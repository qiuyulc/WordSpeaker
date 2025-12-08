import styles from "./index.module.less";
import { useState, useRef, useMemo } from "react";
import { Volume, VolumeO } from "@react-vant/icons";
import {
  Tabs,
  List,
  Card,
  Popup,
  Slider,
  DropdownMenu,
  NoticeBar,
  Sticky,
} from "react-vant";
import word from "../../assets/word.json";
import useSpeech from "../../hooks/useSpeech";
import Menu from "../../components/Menu";

export interface WordType {
  word: string;
  phonetic: string;
  key_word: true;
  hot?: boolean;
  definitions_by_pos: Record<string, string>;
}

const getData = (
  key: string,
  page: number,
  pageSize: number
): Promise<{ data: WordType[]; total: number; status: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const wordData = word.find((u) => u.title === key);
      const total = wordData?.words.length || 0;
      const words = wordData?.words.slice(
        (page - 1) * pageSize,
        page * pageSize
      ) as WordType[];
      resolve({ data: words || [], total, status: 200 });
    }, 2000);
  });
};

const ListCom = (props: {
  title: string;
  playText: (val: string) => void;
  isPlaying: boolean;
  currentWord: string;
}) => {
  const { title, playText, isPlaying, currentWord } = props;
  const [page, setPage] = useState(1);
  const [words, setWords] = useState<WordType[]>([]);
  const [total, setTotal] = useState(0);
  const [finished, setFinished] = useState(false);
  const pageSize = 60;
  const refLoading = useRef(false);

  const onLoad = async () => {
    if (!refLoading.current) {
      refLoading.current = true;
      getData(title, page, pageSize).then((res) => {
        if (res.status === 200) {
          setWords((prev) => {
            const data = [...prev, ...res.data];
            if (data.length >= res.total) {
              setFinished(true);
            }
            return data;
          });
          setTotal(res.total);
          setPage((prev) => prev + 1);
        } else {
          setWords([]);
          setTotal(0);
        }
        refLoading.current = false;
      });
    }
  };

  const getMeaning = (definitions_by_pos: Record<string, string>) => {
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

  const cardClick = (u: string) => {
    const item = words.find((v) => v.word === u);
    if (item) {
      item.hot = !item.hot;
    }

    setWords([...words]);
  };

  const getHotWordCount = useMemo(() => {
    return words.filter((u) => u.hot).length;
  }, [words]);

  const handlePlay = (event: React.MouseEvent<HTMLSpanElement>, u: string) => {
    event.stopPropagation();
    playText(u);
  };

  return (
    <div className={styles.list_box}>
      <p>
        {total}/{getHotWordCount}
      </p>
      <List
        offset={50}
        className={styles.list}
        finished={finished}
        onLoad={onLoad}
        finishedText="没有更多了"
      >
        {words.map((u) => {
          return (
            <Card
              onClick={() => cardClick(u.word)}
              round
              className={`${styles.card} ${u.hot ? styles.card_hot : ""}`}
              key={u.word}
            >
              <Card.Header className={styles.card_header}>
                <div className={styles.card_header_box}>
                  <span className={`${styles.card_word}`}>
                    {u.key_word ? (
                      <span className={styles.card_title_icon}>*</span>
                    ) : (
                      ""
                    )}
                    <i>{u.word}</i>
                  </span>
                  <span
                    className={`${styles.card_icon} ${
                      isPlaying && currentWord === u.word
                        ? styles.card_icon_playing
                        : ""
                    } `}
                    onClick={(event: React.MouseEvent<HTMLSpanElement>) =>
                      handlePlay(event, u.word)
                    }
                  >
                    <Volume />
                  </span>
                </div>
              </Card.Header>
              <Card.Body>
                <div className={styles.symbol}>{u.phonetic}</div>
                <div className={styles.word}>
                  {getMeaning(u.definitions_by_pos)}
                </div>
              </Card.Body>
            </Card>
          );
        })}
      </List>
    </div>
  );
};

const WordSpeaker = () => {
  const uppercaseLetters = Array.from(Array(26), (_, i) =>
    String.fromCharCode(i + 65)
  );

  const [popup, setPopup] = useState({
    visible: false,
  });

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

  const handleOnClose = () => {
    setPopup({
      visible: false,
    });
  };

  const menuChange = (val: string) => {
    if (val === "edit") {
      setPopup({
        visible: true,
      });
    }
  };

  const getvoiceOrvoices = useMemo(() => {
    const { currentOptions, voices } = state;
    const data = voices
      .filter((u) => u.lang === "en-US")
      .map((u) => {
        return {
          text: u.name,
          value: u.name,
        };
      });

    return {
      voice: {
        value: currentOptions.voice?.voiceURI || 0,
      },
      voices: data,
    };
  }, [state]);

  return (
    <>
      <div className={styles.wordSpeaker}>
        {getvoiceOrvoices.voices.length === 0 ? (
          <Sticky>
            <NoticeBar
              leftIcon={<VolumeO />}
              text="很抱歉，没有可用语音。朗读功能暂时不可用。"
            />
          </Sticky>
        ) : (
          ""
        )}
        <h3 className={styles.title}>WordSpeaker</h3>
        <div className={styles.content}>
          <Tabs sticky className={styles.tabs}>
            {uppercaseLetters.map((u) => {
              return (
                <Tabs.TabPane key={u} title={u}>
                  <ListCom
                    isPlaying={state.isPlaying}
                    playText={playText}
                    title={u}
                    currentWord={state.currentWord}
                  />
                </Tabs.TabPane>
              );
            })}
          </Tabs>
        </div>
      </div>

      <Popup
        visible={popup.visible}
        position="bottom"
        className={styles.popup}
        style={{ height: "50%" }}
        onClose={handleOnClose}
      >
        <div style={{ padding: "30px 50px" }}>
          <div className={styles.option_item}>
            <h3>音量</h3>
            <Slider
              min={0}
              max={1}
              step={0.1}
              button={
                <div
                  className="rv-slider__button"
                  style={{ padding: "6px", textAlign: "center" }}
                >
                  {state.currentOptions.volume}
                </div>
              }
              value={state.currentOptions.volume}
              onChange={(val: number) => {
                controls.setOptions({
                  volume: val,
                });
              }}
              onChangeAfter={() => {}}
            />
          </div>
          <div className={styles.option_item}>
            <h3>语速</h3>
            <Slider
              min={0}
              max={1}
              step={0.1}
              button={
                <div
                  className="rv-slider__button"
                  style={{ padding: "6px", textAlign: "center" }}
                >
                  {state.currentOptions.rate}
                </div>
              }
              value={state.currentOptions.rate}
              onChange={(val: number) => {
                controls.setOptions({
                  rate: val,
                });
              }}
              onChangeAfter={() => {}}
            />
          </div>
          <div className={styles.option_item}>
            <h3>发音人</h3>
            <DropdownMenu
              direction="up"
              value={getvoiceOrvoices.voice}
              onChange={(v) => {
                const data = state.voices.find((item) => item.name === v.value);
                if (data) {
                  controls.setOptions({
                    voice: data,
                  });
                }
              }}
            >
              <DropdownMenu.Item
                name="value"
                options={getvoiceOrvoices.voices}
              />
            </DropdownMenu>
          </div>
        </div>
      </Popup>
      <Menu onChange={menuChange} />
    </>
  );
};

export default WordSpeaker;
