import { type WordType } from "@/context/WordContext";

export interface QuizOption {
  word: string;
  definition: string;
  phonetic: string;
  isKeyWord: boolean;
}

export interface QuizQuestion {
  correctWord: string;
  correctDefinition: string;
  correctPhonetic: string;
  isKeyWord: boolean;
  options: QuizOption[];
}

function formatDefinition(
  definitionsByPos: Record<string, string | undefined>
): string {
  //   console.log(definitionsByPos, "12");
  return Object.entries(definitionsByPos)
    .map(([pos, definition]) => `${pos} ${definition}`)
    .join("；");
}

//随机生成选择指定数量元素
export function getRandomItems<T>(array: T[], count: number): T[] {
  if (count >= array.length) {
    // 如果需要的数量大于等于数组长度，返回打乱顺序的整个数组
    return [...array].sort(() => Math.random() - 0.5);
  }

  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
export function createWordQuizOptimized(
  WordTypes: WordType[],
  questionCount: number = 100,
  batchSize: number = 10
): QuizQuestion[] {
  // 随机选择单词
  const selectedWords = getRandomItems(WordTypes, questionCount);
  const questions: QuizQuestion[] = [];

  // 创建所有单词的定义映射，用于快速查找错误选项

  const definitionMap = new Map(
    WordTypes.map((word) => {
      if (!word.definitions_by_pos) {
        console.log(word);
      }
      return [
        word.word,
        {
          definition: formatDefinition(word.definitions_by_pos),
          phonetic: word.phonetic,
          isKeyWord: word.key_word,
        },
      ];
    })
  );

  // 所有可用的单词列表（用于选择错误选项）
  const allWords = WordTypes.map((word) => word.word);

  for (let i = 0; i < selectedWords.length; i += batchSize) {
    const batch = selectedWords.slice(i, i + batchSize);

    for (const word of batch) {
      const correctDefinition = formatDefinition(word.definitions_by_pos);

      // 创建正确答案选项
      const correctOption: QuizOption = {
        word: word.word,
        definition: correctDefinition,
        phonetic: word.phonetic,
        isKeyWord: word.key_word,
      };

      // 选择3个不同的错误单词
      const wrongWordCandidates = allWords.filter((w) => w !== word.word);
      const selectedWrongWords = getRandomItems(wrongWordCandidates, 3);

      // 创建错误选项
      const wrongOptions = selectedWrongWords.map((wrongWord) => {
        const wrongDef = definitionMap.get(wrongWord)!;
        return {
          word: wrongWord,
          definition: wrongDef.definition,
          phonetic: wrongDef.phonetic,
          isKeyWord: wrongDef.isKeyWord,
        };
      });

      // 组合并打乱选项
      const allOptions = getRandomItems([correctOption, ...wrongOptions], 4);

      questions.push({
        correctWord: word.word,
        correctDefinition,
        correctPhonetic: word.phonetic,
        isKeyWord: word.key_word,
        options: allOptions,
      });
    }
  }

  return questions;
}
