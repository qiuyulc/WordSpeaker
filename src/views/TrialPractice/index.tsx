import styles from "./index.module.less";
import { Card } from "react-vant";
import { Arrow } from "@react-vant/icons";
import { useNavigate } from "react-router";
const TrialPractice = () => {
  const navigate = useNavigate();
  const handleClick = (options: Record<string, string>) => {
    navigate("/trial_list", { state: options });
  };
  return (
    <div className={styles.trial_practice}>
      <Card
        className={styles.card}
        round
        onClick={() =>
          handleClick({
            type: "random",
          })
        }
      >
        <Card.Header>随机模式</Card.Header>
        <Card.Body>
          <span>随机100个单词练习</span>
          <Arrow />
        </Card.Body>
      </Card>
      {/* <Card className={styles.card} round>
        <Card.Header>顺序模式</Card.Header>
        <Card.Body>
          <span>从A-Z进行顺序练习</span>
          <Arrow />
        </Card.Body>
      </Card> */}
    </div>
  );
};

export default TrialPractice;
