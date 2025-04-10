#!/usr/bin/env node

const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { RestServerTransport } = require("@chatmcp/sdk/server/rest.js");
const { getParamValue, getAuthValue } = require("@chatmcp/sdk/utils/index.js");
const fs = require('fs');
const path = require('path');
const { z } = require('zod');
const { customerSupportQATool } = require('./tools/customerSupportQA');

// 从参数或环境变量获取配置
const mode = getParamValue("mode") || "stdio";
const port = getParamValue("port") || 9594;
const endpoint = getParamValue("endpoint") || "/rest";
const dataDir = getParamValue("data_dir") || process.env.DATA_DIR || '';

// 如果指定了数据目录，尝试从该目录加载自定义数据
if (dataDir && fs.existsSync(dataDir)) {
  try {
    const customDataPath = path.join(dataDir, 'qa-database.json');
    if (fs.existsSync(customDataPath)) {
      console.error(`[Customer Support QA MCP] 尝试加载自定义数据: ${customDataPath}`);
      // 注意：我们不在这里加载数据，而是让qa-database.js模块处理
    }
  } catch (error) {
    console.error(`[Customer Support QA MCP] 检查自定义数据失败: ${error.message}`);
  }
}

// 创建MCP服务器
const server = new McpServer({
  name: "CustomerSupportQA",
  version: "1.0.0"
});

// 添加回答问题工具 - 使用Zod验证器
server.tool(
  "answerQuestion",
  {
    question: z.string().describe("用户的问题"),
    language: z.string().default('zh').describe("回答的语言 (zh 或 ja)")
  },
  async (request) => {
    try {
      const { question, language = 'zh' } = request;
      
      // 调用原有的处理函数
      const result = await customerSupportQATool.functions[0].handler({ question, language });
      
      return {
        content: [
          { 
            type: "text", 
            text: result.answer
          }
        ],
        metadata: {
          confidence: result.confidence,
          id: result.id
        }
      };
    } catch (error) {
      console.error(`[Customer Support QA MCP] 错误: ${error.message}`);
      return {
        content: [
          { type: "text", text: `处理问题时出错: ${error.message}` }
        ],
        isError: true
      };
    }
  }
);

// 添加列出FAQ工具 - 使用Zod验证器
server.tool(
  "listFAQs",
  {
    language: z.string().default('zh').describe("语言选择 (zh 或 ja)")
  },
  async (request) => {
    try {
      const { language = 'zh' } = request;
      
      // 调用原有的处理函数
      const result = await customerSupportQATool.functions[1].handler({ language });
      
      return {
        content: [
          { type: "text", text: JSON.stringify(result, null, 2) }
        ]
      };
    } catch (error) {
      console.error(`[Customer Support QA MCP] 列出FAQ时出错: ${error.message}`);
      return {
        content: [
          { type: "text", text: `列出FAQ时出错: ${error.message}` }
        ],
        isError: true
      };
    }
  }
);

// 添加搜索FAQ工具 - 使用Zod验证器
server.tool(
  "searchFAQs",
  {
    query: z.string().describe("搜索关键词"),
    language: z.string().default('zh').describe("搜索语言 (zh 或 ja)")
  },
  async (request) => {
    try {
      const { query, language = 'zh' } = request;
      
      // 调用原有的处理函数
      const result = await customerSupportQATool.functions[2].handler({ query, language });
      
      return {
        content: [
          { type: "text", text: JSON.stringify(result, null, 2) }
        ]
      };
    } catch (error) {
      console.error(`[Customer Support QA MCP] 搜索FAQ时出错: ${error.message}`);
      return {
        content: [
          { type: "text", text: `搜索FAQ时出错: ${error.message}` }
        ],
        isError: true
      };
    }
  }
);

// 启动服务器
async function runServer() {
  try {
    // 根据模式启动不同的传输
    if (mode === "rest") {
      const transport = new RestServerTransport({
        port,
        endpoint,
      });
      await server.connect(transport);
      await transport.startServer();
      console.error(`[Customer Support QA MCP] REST服务器已启动，端口: ${port}, 端点: ${endpoint}`);
      return;
    }

    // 默认使用stdio传输
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('[Customer Support QA MCP] 服务器已通过stdio传输启动');
  } catch (err) {
    console.error(`[Customer Support QA MCP] 服务器启动失败: ${err.message}`);
    process.exit(1);
  }
}

// 运行服务器
runServer();