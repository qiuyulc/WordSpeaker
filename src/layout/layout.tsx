import { Outlet, useNavigate, useLocation } from "react-router";
import { Tabbar } from "react-vant";
import { useMemo } from "react";
import { WapHome, TodoList } from "@react-vant/icons";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const [name, setName] = useState("/home");
  const data = [
    {
      name: "/home",
      icon: <WapHome />,
      text: "首页",
    },
    {
      name: "/trial",
      icon: <TodoList />,
      text: "试练模式",
    },
  ];

  const name = useMemo(() => {
    return location.pathname;
  }, [location.pathname]);

  // useEffect(() => {
  //   if (location.pathname !== name) {
  //     setName(location.pathname);
  //   }
  // }, [location.pathname,name]);

  return (
    <>
      <div className="swiper">
        <Outlet />
      </div>
      <Tabbar
        className="tabbar"
        value={name}
        onChange={(v) => {
          navigate(v as string);
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
