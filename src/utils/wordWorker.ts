// utils/wordWorker.js
export const wordWorker = `
self.onmessage = function(e) {
  const { data, type } = e.data;
  
  if (type === 'generateWordOptions') {
    const getRandomItems = (array, count) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled.slice(0, count);
    };

    
    const allWords = data.flatMap(w => w.words);
    const options = [];
    
    for (let i = 0; i < allWords.length; i++) {
      const wrongWordCandidates = allWords.filter(
        w => w.word !== allWords[i].word
      );
      const selectedWrongWords = getRandomItems(wrongWordCandidates, 3);
      const allOptions = getRandomItems(
        [allWords[i], ...selectedWrongWords],
        4
      );
      
      options.push({
        ...allWords[i],
        options: allOptions,
        selectWord: "",
      });
    }
    
    const shuffledOptions = getRandomItems(options, options.length).map((u,i)=>{
      return{
      ...u,
      key:u.word+'_'+i
      }
    });
    
    const keyWords = shuffledOptions.filter(word => word.key_word === true);
    
    // 返回完整的数组和筛选后的数组
    postMessage({
      type: 'wordOptionsGenerated',
      data: {
        allWords: shuffledOptions,  // 所有单词的选项（已洗牌）
        keyWords: keyWords           // 从所有单词中筛选出的重点单词
      }
    });
  }
};
`;
