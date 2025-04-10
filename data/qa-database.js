// qa-database.js
const fs = require('fs');
const path = require('path');
const { getParamValue } = require("@chatmcp/sdk/utils/index.js");

// 默认数据库
const defaultQaDatabase = [
  {
    id: 15,
    promptZh: "ログアウトしたのに新規プロフ・登出后无法返回新建个人资料和新注册页面。",
    promptTranslated: "退出后无法新建个人资料和新注册页面",
    questionKeywordsZh: "无法注册新用户",
    questionKeywordsJa: "新規登録が出来ない",
    answerZh: "您可以通过打开 Synclub 应用程序并提供所需信息来再次注册。但是，如果您取消会员资格或取消应用程序，某些数据可能会丢失。此外，如果您多次人同一设备取消订阅并重新注册，您可能无法进行新的注册。在这种情况下，请使用不同的电子邮件地址。感谢您的理解与合作。",
    answerJa: "Synclubアプリを開き、必要な情報を提供することで再登録することができます。ただし、同じデバイスで複数回退会と再登録を繰り返すと、お客様のご利用状況によっては新規登録ができないことがあります。キャラクターを作成する際は別のメールアドレスをお試しください。ご理解とご協力をお願いいたします。"
  },
  {
    id: 16,
    promptZh: "他のアカウントで退会と再登録：如果我不断地用其他账户注销和重新注册，就会出现账户创建次数已达上限，请登录现有账户的消息，我该怎么变。",
    promptTranslated: "如果我不断地用其他账户注销和重新注册，就会出现账户创建次数已达上限，请登录现有账户的消息，我该怎么变。",
    questionKeywordsZh: "账户注册上限",
    questionKeywordsJa: "アカウント上限",
    answerZh: "一些用户正在重新创建账户以重置其角色，但使用相同信息创建账户的次数是有限制的。 如果您收到无法创建的消息，请尝试使用其他电子邮件地址（如果有）。我们目前正在考虑在未来的更新中实现对重置功能，因此我们正式不建议删除并重新创建的账户。在使用 Synclub 之前通知了解这一点。",
    answerJa: "一部のユーザーは、キャラクターをリセットするために再登録を行っています。しかし、同じ情報での新規アカウント作成には制限があります。アカウント作成ができない場合は、別のメールアドレスをお試しください。今後のアップデートでリセット機能の実装を検討していますので、アカウントの削除と再登録はお控えください。ご理解とご協力をお願いいたします。"
  },
  {
    id: 18,
    promptZh: "我不会生图，可以教教我吗",
    promptTranslated: "我不会生图，可以教教我吗",
    questionKeywordsZh: "我不会生图",
    questionKeywordsJa: "画像生成上手くいかない",
    answerZh: "我们在聊天屏幕上的'AI角色创建指南'栏栏上介绍了一些图像生成的技巧，所以请在尝试之前检查一下。正如您所描述的，生成图像的最好只有一个人。对于由此给您带来的任何不便，我们深表歉意。并感谢您的理解与合作。图像生成模型有局限性，但我们正在积极努力优化它们。在这种情况下，如果您详细描述图像的内容，模型将尽力创建它。",
    answerJa: "チャット画面上部の「AI画像生成ガイド」タブに、いくつかのコツを紹介していますので、一度ご確認ください。ご指摘の通り、生成される画像は基本的に1人の人物のみが最適です。ご不便をおかけして申し訳ありません。ご理解とご協力に感謝いたします。画像生成モデルには制限がありますが、私たちは継続的に改善に取り組んでいます。画像に含めたい内容を詳しく指定することで、より良い結果が得られる場合があります。"
  }
];

// 尝试加载自定义数据库
function loadQaDatabase() {
  try {
    const dataDir = getParamValue("data_dir") || process.env.DATA_DIR || '';
    console.error(`[QA Database] 尝试从目录加载数据: ${dataDir}`);
    
    if (dataDir && fs.existsSync(dataDir)) {
      try {
        const customDataPath = path.join(dataDir, 'qa-database.json');
        if (fs.existsSync(customDataPath)) {
          console.error(`[QA Database] 找到自定义数据文件: ${customDataPath}`);
          const fileContent = fs.readFileSync(customDataPath, 'utf8');
          const customData = JSON.parse(fileContent);
          console.error(`[QA Database] 已加载自定义数据: ${customData.length}条记录`);
          return customData;
        }
      } catch (error) {
        console.error(`[QA Database] 加载自定义数据失败: ${error.message}`);
      }
    }
    
    // 如果自定义数据加载失败，尝试加载本地JSON文件
    try {
      // 尝试从当前目录的data文件夹加载
      const localDataPath = path.join(__dirname, 'qa-database.json');
      console.error(`[QA Database] 尝试加载本地JSON文件: ${localDataPath}`);
      
      if (fs.existsSync(localDataPath)) {
        const fileContent = fs.readFileSync(localDataPath, 'utf8');
        const localData = JSON.parse(fileContent);
        console.error(`[QA Database] 已加载本地JSON数据: ${localData.length}条记录`);
        return localData;
      }
    } catch (error) {
      console.error(`[QA Database] 加载本地JSON数据失败: ${error.message}`);
    }
    
    // 如果都失败，则使用默认数据
    console.error(`[QA Database] 使用默认数据: ${defaultQaDatabase.length}条记录`);
    return defaultQaDatabase;
  } catch (error) {
    console.error(`[QA Database] 加载过程中出错: ${error.message}`);
    // 确保即使出错也返回一个数组
    return defaultQaDatabase;
  }
}

// 加载问答数据库
const qaDatabase = loadQaDatabase();

// 导出时确保qaDatabase不为undefined
module.exports = {
  qaDatabase: qaDatabase || defaultQaDatabase
};