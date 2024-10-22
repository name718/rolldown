```json
{
  "name": "scripts",
  "private": true,
  "type": "module",
  "scripts": {
    // 执行 TypeScript 类型检查并生成构建配置
    "type-check": "tsc -b",
    // 执行 esbuild 的快照差异比较任务，通过使用 @oxc-node/core 注册并运行指定的 TypeScript 文件
    "esbuild-snap-diff": "node --import @oxc-node/core/register./snap-diff/index.ts"
  },
  "dependencies": {
    // Parcel 的文件监听器模块
    "@parcel/watcher": "^2.4.1",
    // pnpm 用于查找工作区包的模块
    "@pnpm/find-workspace-packages": "^6.0.9",
    // 可能是内部工作区特定的测试模块
    "@rolldown/testing": "workspace:*",
    // debug 模块的类型定义
    "@types/debug": "^4.1.12",
    // fs-extra 模块的类型定义
    "@types/fs-extra": "^11.0.4",
    // semver 模块的类型定义
    "@types/semver": "^7.5.8",
    // 用于在控制台输出彩色文本的模块
    "chalk": "^5.3.0",
    // 用于字符串格式转换的模块
    "change-case": "^5.4.4",
    // 调试工具模块
    "debug": "^4.3.5",
    // 多行字符串缩进格式化模块
    "dedent": "^1.5.3",
    // 执行外部命令的模块
    "execa": "^9.2.0",
    // 快速文件路径匹配模块
    "fast-glob": "^3.3.2",
    // 处理 HTTP 请求重定向的模块
    "follow-redirects": "^1.15.6",
    // 增强版的文件操作模块
    "fs-extra": "^11.2.0",
    // 语义化版本处理模块
    "semver": "^7.6.2",
    // 方便执行 shell 命令的模块
    "zx": "^8.1.2",
    // remark 的解析模块，可能用于处理 markdown 文件
    "remark-parse": "^11.0.0",
    // 树状语法分析器模块
    "tree-sitter": "^0.21.1",
    // 统一化处理模块，可能用于处理不同类型的内容
    "unified": "^11.0.5"
  },
  "devDependencies": {
    // 可能是特定的核心模块，用于开发环境
    "@oxc-node/core": "^0.0.15",
    // diff 模块的类型定义
    "@types/diff": "^5.2.2",
    // lodash-es 模块的类型定义
    "@types/lodash-es": "^4.17.12",
    // JavaScript 解析器模块
    "acorn": "^8.12.1",
    // JavaScript 代码字符串化模块
    "astring": "^1.9.0",
    // 差异比较模块
    "diff": "^7.0.0",
    // 用于处理抽象语法树的工具集模块
    "estree-toolkit": "^1.7.8",
    // web 环境下的树状语法分析器模块
    "web-tree-sitter": "^0.23.0"
  }
}
```