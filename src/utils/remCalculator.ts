class RemCalculator {
  private options: {
    designWidth: number;
    baseSize: number;
    maxWidth: number;
    minWidth: number;
  };
  resizeHandler: () => void;
  timer: ReturnType<typeof setTimeout>;
  constructor(options = {}) {
    this.resizeHandler = () => {};
    this.timer = 0;
    this.options = {
      designWidth: 750,
      baseSize: 100,
      maxWidth: 540,
      minWidth: 320,
      ...options,
    };
    this.init();
  }

  init() {
    this.setRem();
    this.bindEvents();
  }

  setRem() {
    const { designWidth, baseSize, maxWidth, minWidth } = this.options;
    let width = document.documentElement.clientWidth;

    width = Math.max(width, minWidth);
    if (maxWidth) {
      width = Math.min(width, maxWidth);
    }

    const rem = baseSize * (width / designWidth);
    document.documentElement.style.fontSize = `${rem}px`;
  }

  bindEvents() {
    this.resizeHandler = () => {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.setRem(), 300);
    };
    window.addEventListener("resize", this.resizeHandler);
  }

  destroy() {
    // 清理事件监听，防止内存泄漏
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
    }
  }

  toRem(px: number) {
    const { designWidth, baseSize } = this.options;
    return (
      (px / baseSize) * (designWidth / document.documentElement.clientWidth)
    );
  }
}

// 创建并导出一个默认配置的实例（单例模式）
const defaultRemCalc = new RemCalculator();
export default defaultRemCalc;
