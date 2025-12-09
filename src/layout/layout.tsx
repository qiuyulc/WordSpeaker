import { Outlet, useNavigate } from "react-router";
import { Tabbar } from "react-vant";
import { useState } from "react";
import { WapHome, TodoList } from "@react-vant/icons";

const Layout = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("home");
  const data = [
    {
      name: "home",
      icon: <WapHome />,
      text: "首页",
    },
    {
      name: "trial",
      icon: <TodoList />,
      text: "试练模式",
    },
  ];
  return (
    <>
      <div className="swiper">
        <Outlet />
      </div>
      <Tabbar
        className="tabbar"
        value={name}
        onChange={(v) => {
          navigate(`/${v}`);
          setName(v as string);
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
    </>
  );
};
export default Layout;
