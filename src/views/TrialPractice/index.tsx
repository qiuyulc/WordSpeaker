import styles from "./index.module.less";
import { Card } from "react-vant";
import { Arrow } from "@react-vant/icons";
import { useNavigate } from "react-router";
const TrialPractice = () => {
  const navigate = useNavigate();
  const handleClick = (path: string, options: Record<string, string>) => {
    navigate(path, { state: options });
  };

  const data = [
    {
      title: "小练一下",
      key: "random",
      description: "随机100个单词练习",
      onClick: () => {
        handleClick("/trial_list", {
          type: "random",
        });
      },
    },
    {
      title: "闯关模式",
      key: "order",
      description: "从A-Z字母顺序练习",
      onClick: () => {
        // Notify.show({ type: "primary", message: "敬请期待" });
        handleClick("/order_list", {
          type: "order",
        });
      },
    },
    {
      title: "随机模式",
      key: "random-list",
      description: "随机单词记忆",
      onClick: () => {
        handleClick("/random_list", {});
      },
    },
  ];

  return (
    <div className={styles.trial_practice}>
      {data.map((item) => {
        return (
          <Card
            className={styles.card}
            round
            onClick={item.onClick}
            key={item.key}
          >
            <Card.Header>{item.title}</Card.Header>
            <Card.Body>
              <span>{item.description}</span>
              <Arrow />
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
};

export default TrialPractice;
