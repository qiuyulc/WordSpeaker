import styles from "./index.module.less";
import { Card, Notify } from "react-vant";
import { Arrow } from "@react-vant/icons";
import { useNavigate } from "react-router";
const TrialPractice = () => {
  const navigate = useNavigate();
  const handleClick = (options: Record<string, string>) => {
    navigate("/trial_list", { state: options });
  };

  const data = [
    {
      title: "随机模式",
      key: "random",
      description: "随机100个单词练习",
      onClick: () => {
        handleClick({
          type: "random",
        });
      },
    },
    {
      title: "闯关模式",
      key: "order",
      description: "从A-Z字母顺序练习",
      onClick: () => {
        Notify.show({ type: "primary", message: "敬请期待" });
        // handleClick({
        //   type: "order",
        // });
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
            key="random"
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
