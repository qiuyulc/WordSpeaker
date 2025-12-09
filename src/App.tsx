import "./App.css";
import WordSpeaker from "./components/WordSpeaker";
import { Tabbar, Swiper } from "react-vant";
import { useState, useRef } from "react";
import { WapHome, TodoList } from "@react-vant/icons";
import type { SwiperInstance } from "react-vant";
// import "./utils/remCalculator";

function App() {
  const [name, setName] = useState(0);
  const data = [
    {
      name: 0,
      icon: <WapHome />,
      text: "首页",
      children: <WordSpeaker />,
    },
    {
      name: 1,
      icon: <TodoList />,
      text: "试练模式",
      children: <div style={{ paddingTop: 30 }}>敬请期待...</div>,
    },
  ];

  const swiperRef = useRef<SwiperInstance>(null);

  return (
    <div className="app">
      <div className="swiper">
        <Swiper
          loop={false}
          ref={swiperRef}
          indicator={false}
          onChange={(val: number) => {
            setName(val);
          }}
          style={{ height: "100%" }}
        >
          {data.map((res) => {
            return <Swiper.Item key={res.name}>{res.children}</Swiper.Item>;
          })}
        </Swiper>
      </div>
      <Tabbar
        className="tabbar"
        value={name}
        onChange={(v) => {
          swiperRef.current?.swipeTo(v as number);
          setName(v as number);
        }}
      >
        {data.map((res) => {
          return (
            <Tabbar.Item name={res.name} icon={res.icon}>
              {res.text}
            </Tabbar.Item>
          );
        })}
      </Tabbar>
    </div>
  );
}

export default App;
