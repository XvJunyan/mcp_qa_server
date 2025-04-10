// 计算问题与数据库中条目的匹配度
function matchQuestion(question, language, qaItems) {
    let bestMatch = null;
    let highestScore = 0;
  
    // 检查qaItems是否为undefined或null
    if (!qaItems || !Array.isArray(qaItems)) {
      console.error("[Matcher] qaItems未定义或不是数组");
      return { match: null, score: 0 };
    }
  
    // 将问题转换为小写并分词
    const questionLower = question.toLowerCase();
    const questionWords = questionLower.split(/\s+|，|。|！|？|、|,|\.|!|\?/);
    const questionChars = [...questionLower];
  
    qaItems.forEach(qa => {
      const keywords = language === 'zh' ? qa.questionKeywordsZh : qa.questionKeywordsJa;
      const prompt = language === 'zh' ? qa.promptZh : 
                    (language === 'ja' ? qa.promptTranslated : qa.promptZh);
      
      // 将关键词和提示文本转换为小写
      const keywordsLower = keywords ? keywords.toLowerCase() : '';
      const promptLower = prompt ? prompt.toLowerCase() : '';
      
      // 分配匹配分数
      let score = 0;
      
      // 1. 精确匹配 - 直接包含关键词或提示文本
      if (keywordsLower && questionLower.includes(keywordsLower)) {
        score += 5; // 提高关键词匹配的权重
      }
      
      if (promptLower && questionLower.includes(promptLower)) {
        score += 3;
      }
      
      // 2. 关键词分词匹配
      if (keywordsLower) {
        const keywordWords = keywordsLower.split(/\s+|，|。|！|？|、|,|\.|!|\?/);
        
        keywordWords.forEach(keyword => {
          if (keyword.length > 1 && questionLower.includes(keyword)) {
            score += 2; // 关键词中的词匹配
          }
        });
      }
      
      // 3. 提示文本分词匹配
      if (promptLower) {
        const promptWords = promptLower.split(/\s+|，|。|！|？|、|,|\.|!|\?/);
        
        // 计算问题词与提示词的重叠度
        let matchedPromptWords = 0;
        promptWords.forEach(word => {
          if (word.length > 1 && questionLower.includes(word)) {
            matchedPromptWords++;
          }
        });
        
        if (promptWords.length > 0) {
          // 计算重叠率并加到分数中
          const overlapRate = matchedPromptWords / promptWords.length;
          score += overlapRate * 2; // 根据重叠率加分
        }
      }
      
      // 4. 单词匹配（双向匹配）
      if (promptLower) {
        const promptWords = promptLower.split(/\s+|，|。|！|？|、|,|\.|!|\?/);
        
        // 问题词在提示文本中出现
        questionWords.forEach(word => {
          if (word.length > 1 && promptWords.includes(word)) {
            score += 0.5;
          }
        });
        
        // 提示文本词在问题中出现
        promptWords.forEach(word => {
          if (word.length > 1 && questionWords.includes(word)) {
            score += 0.5;
          }
        });
      }
      
      // 5. 字符级别的最长公共子序列（LCS）相似度
      if (promptLower) {
        // 计算问题与提示文本的字符重叠
        const promptChars = [...promptLower];
        const lcsScore = calculateLCS(questionChars, promptChars) / 
                        Math.max(questionChars.length, promptChars.length);
        
        score += lcsScore * 2; // 添加LCS分数
      }
      
      // 根据文本长度归一化分数
      if (promptLower && promptLower.length > 0) {
        // 长文本的权重略微降低，避免长文本过度匹配
        const lengthFactor = 1 / Math.sqrt(promptLower.length / 20);
        score *= lengthFactor;
      }
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = qa;
      }
    });
  
    return { match: bestMatch, score: highestScore };
  }
  
  // 计算最长公共子序列（LCS）
  function calculateLCS(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    
    return dp[m][n];
  }
  
  module.exports = {
    matchQuestion
  };