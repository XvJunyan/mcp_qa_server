const { qaDatabase } = require('../data/qa-database');
const { matchQuestion } = require('../utils/matcher');

// 定义客服问答工具
const customerSupportQATool = {
  name: 'CustomerSupportQA',
  description: '用于回答关于SyncNub应用的常见问题的服务',
  
  functions: [
    {
      name: 'answerQuestion',
      description: '根据用户问题提供匹配的答案',
      parameters: {
        type: 'object',
        properties: {
          question: {
            type: 'string',
            description: '用户的问题'
          },
          language: {
            type: 'string',
            description: '回答的语言 (zh 或 ja)',
            enum: ['zh', 'ja'],
            default: 'zh'
          }
        },
        required: ['question']
      },
      handler: async ({ question, language = 'zh' }) => {
        if (!question) {
          throw new Error('问题不能为空');
        }

        const { match, score } = matchQuestion(question, language, qaDatabase);
        
        if (match && score > 0) {
          const answer = language === 'zh' ? match.answerZh : 
                        (language === 'ja' ? match.answerJa : match.answerZh);
          
          return {
            question,
            answer,
            confidence: score,
            id: match.id
          };
        } else {
          // 返回默认回复
          const defaultResponse = language === 'zh' 
            ? '抱歉，我无法回答您的问题。请尝试使用不同的表述，或通过官方渠道联系我们。'
            : '申し訳ありませんが、お問い合わせの内容に対する回答が見つかりませんでした。別の言い方で質問してみるか、公式チャンネルからお問い合わせください。';
          
          return {
            question,
            answer: defaultResponse,
            confidence: 0,
            id: null
          };
        }
      }
    },
    
    {
      name: 'listFAQs',
      description: '列出所有常见问题',
      parameters: {
        type: 'object',
        properties: {
          language: {
            type: 'string',
            description: '语言选择 (zh 或 ja)',
            enum: ['zh', 'ja'],
            default: 'zh'
          }
        }
      },
      handler: async ({ language = 'zh' }) => {
        return qaDatabase.map(qa => {
          return {
            id: qa.id,
            question: language === 'zh' ? qa.questionKeywordsZh : qa.questionKeywordsJa,
            prompt: language === 'zh' ? qa.promptZh : 
                  (language === 'ja' ? qa.promptTranslated : qa.promptZh)
          };
        });
      }
    },
    
    {
      name: 'searchFAQs',
      description: '搜索常见问题',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: '搜索关键词'
          },
          language: {
            type: 'string',
            description: '搜索语言 (zh 或 ja)',
            enum: ['zh', 'ja'],
            default: 'zh'
          }
        },
        required: ['query']
      },
      handler: async ({ query, language = 'zh' }) => {
        if (!query) {
          throw new Error('搜索关键词不能为空');
        }

        const results = qaDatabase.filter(qa => {
          const keywords = language === 'zh' ? qa.questionKeywordsZh : qa.questionKeywordsJa;
          const prompt = language === 'zh' ? qa.promptZh : 
                        (language === 'ja' ? qa.promptTranslated : qa.promptZh);
          
          return (keywords && keywords.includes(query)) || 
                (prompt && prompt.includes(query));
        });

        return results.map(qa => {
          return {
            id: qa.id,
            question: language === 'zh' ? qa.questionKeywordsZh : qa.questionKeywordsJa,
            prompt: language === 'zh' ? qa.promptZh : 
                  (language === 'ja' ? qa.promptTranslated : qa.promptZh),
            answer: language === 'zh' ? qa.answerZh : qa.answerJa
          };
        });
      }
    }
  ]
};

module.exports = {
  customerSupportQATool
};