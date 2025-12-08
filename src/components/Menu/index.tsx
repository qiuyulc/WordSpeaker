import { FloatingBall, Flex } from "react-vant";
import "react-vant/lib/floating-ball/style/index.css";
import { SettingO, Plus } from "@react-vant/icons";
import "./index.less";
const Menu = (props: { onChange: (val: string) => void }) => {
  const { onChange } = props;
  const item = [{ icon: SettingO, text: "edit" }];
  return (
    <div className="demo-floating-box">
      <FloatingBall
        className="demo-floating-box-menu"
        offset={{
          right: 30,
          bottom: 20,
        }}
        menu={{
          items: item.map((u, index) => {
            return (
              <Flex
                align="center"
                justify="center"
                onClick={() => {
                  onChange(u.text);
                }}
                key={index}
                className="menu-item"
              >
                <u.icon />
              </Flex>
            );
          }),
        }}
      >
        {({ active }) => (
          <Flex
            align="center"
            justify="center"
            className={`main-button ${active ? "main-button--active" : ""}
          `}
          >
            <Plus />
          </Flex>
        )}
      </FloatingBall>
    </div>
  );
};

export default Menu;
