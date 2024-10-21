```json
{
  "name": "monorepo",
  "description": "Rollup in Rust",
  // 表示这是一个私有仓库
  "private": true,
  "packageManager": "pnpm@9.9.0",
  "engines": {
    "node": ">=18.20.3"
  },
  "scripts": {
    // 执行代码检查任务，使用 oxlint 工具并传入特定参数
    "lint-code": "oxlint -c.oxlintrc.json --ignore-path=.oxlintignore --import-plugin --jsdoc-plugin --deny-warnings",
    // 打印提示信息，表示待办事项，因为 ls-lint 目前速度太慢
    "lint-filename": "echo 'TODO: ls-lint is too slow now'",
    // 备用的文件名检查任务，使用 ls-lint 工具
    "lint-filename:bak": "ls-lint",
    // 执行拼写检查任务，使用 cspell 工具并传入特定参数
    "lint-spell": "cspell \"**\" --no-progress  --gitignore",
    // 检查文件是否符合 prettier 格式要求
    "lint-prettier": "prettier. '**/*.{js,ts,json,md,yml,yaml,vue}' -c",
    // 使用 prettier 格式化指定文件类型
    "lint-prettier:fix": "prettier. '**/*.{js,ts,json,md,yml,yaml,vue}' -w",
    // 检查 TOML 文件格式
    "lint-toml": "taplo format --check",
    // 格式化 TOML 文件
    "lint-toml:fix": "taplo format",
    // 并行执行多个 lint 任务
    "lint-repo": "npm-run-all -l --parallel lint-prettier lint-toml lint-spell",
    // 打印提示信息，表示使用特定的构建命令
    "build": "echo \"Use just build\"",
    // 打印提示信息，表示使用特定的原生版本构建命令
    "build:release": "echo \"Use just build native release\"",
    // 打印提示信息，表示使用特定的测试命令
    "test": "echo \"Use just test-node\"",
    // 构建并发布绑定，使用 pnpm 过滤 rolldown 并运行特定命令
    "ci:build-release-binding": "pnpm --filter rolldown run build-binding:release",
    // 执行类型检查任务，使用 pnpm 递归运行类型检查命令
    "type-check": "pnpm --recursive run type-check",
    // 运行文档开发任务，使用 pnpm 过滤 rolldown-docs 并运行开发命令
    "docs": "pnpm --filter rolldown-docs run dev",
    // 构建文档，使用 pnpm 过滤 rolldown-docs 并运行构建命令
    "docs:build": "pnpm --filter rolldown-docs run build",
    // 预览文档，使用 pnpm 过滤 rolldown-docs 并运行预览命令
    "docs:preview": "pnpm --filter rolldown-docs run preview",
    // 生成符合 angular 规范的变更日志
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s",
    // 安装 husky
    "prepare": "husky install"
  },
  "license": "MIT",
  "devDependencies": {
    "@ls-lint/ls-lint": "^2.2.3",
    // 可能是与处理 TOML、JSON 和 YAML 文件相关的工具
    "@taplo/cli": "^0.7.0",
    "@types/node": "22.5.2",
    // 可能用于解析 CommonJS 模块语法
    "cjs-module-lexer": "^1.3.1",
    // 用于生成符合约定式提交规范的变更日志的工具
    "conventional-changelog-cli": "^5.0.0",
    // 拼写检查工具
    "cspell": "^8.8.4",
    // 用于在 Git 钩子中执行命令的工具
    "husky": "^9.0.0",
    // 允许在暂存文件上运行特定命令的工具
    "lint-staged": "^15.2.5",
    "npm-rolldown": "npm:rolldown@0.12.2",
    // 用于同时运行多个 npm 脚本的工具
    "npm-run-all": "^4.1.5",
    // 不清楚具体用途，可能是特定领域或项目特定的代码检查工具
    "oxlint": "0.9.2",
    // 代码格式化工具
    "prettier": "^3.3.1",
    // 可能是自定义的包或工具，具体用途取决于项目上下文
    "rolldown": "workspace:*",
    // TypeScript 语言
    "typescript": "^5.6.3"
  },
  "prettier": {
    // 设置 prettier 的打印宽度为 80
    "printWidth": 80,
    // 不使用分号结尾
    "semi": false,
    // 使用单引号
    "singleQuote": true,
    // 在多行对象、数组等末尾添加逗号
    "trailingComma": "all",
    // 箭头函数始终使用括号包裹参数
    "arrowParens": "always"
  },
  "lint-staged": {
    // 对所有.toml 文件使用 taplo 进行格式化
    "*.toml": "taplo format",
    // 对特定文件类型先使用 prettier 格式化再运行 lint-code 任务并传入特定参数进行修复
    "*.{js,ts,json,md,yml,yaml,vue}": [
      "prettier --write",
      "pnpm lint-code -- --fix"
    ]
  }
}
```