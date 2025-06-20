# Vue3管理系统搭建

## 项目初始化

```shell{1,52,23,25}
D:\workspace\vscode\vue_admin_template>pnpm create vite
.../19788950c58-c70                      |   +1 +
.../19788950c58-c70                      | Progress: resolved 1, reused 0, downloaded 1, added 1, done
|
o  Project name:
|  project
|
o  Select a framework:
|  Vue
|
o  Select a variant:
|  TypeScript
|
o  Scaffolding project in D:\workspace\vscode\vue_admin_template\project...
|
—  Done. Now run:

  cd project
  pnpm install
  pnpm run dev


D:\workspace\vscode\vue_admin_template>cd project

D:\workspace\vscode\vue_admin_template\project>pnpm i

   ╭───────────────────────────────────────────────────────────────────╮
   │                                                                   │
   │                Update available! 9.15.4 → 10.12.1.                │
   │   Changelog: https://github.com/pnpm/pnpm/releases/tag/v10.12.1   │
   │                 Run "pnpm add -g pnpm" to update.                 │
   │                                                                   │
   ╰───────────────────────────────────────────────────────────────────╯

Packages: +50
++++++++++++++++++++++++++++++++++++++++++++++++++
Progress: resolved 94, reused 11, downloaded 39, added 50, done
node_modules/.pnpm/esbuild@0.25.5/node_modules/esbuild: Running postinstall script, done in 620ms

dependencies:
+ vue 3.5.17

devDependencies:
+ @vitejs/plugin-vue 5.2.4
+ @vue/tsconfig 0.7.0
+ typescript 5.8.3
+ vite 6.3.5
+ vue-tsc 2.2.10

Done in 3.6s

D:\workspace\vscode\vue_admin_template\project>pnpm run dev

> project@0.0.0 dev D:\workspace\vscode\vue_admin_template\project
> vite

Port 5173 is in use, trying another one...

  VITE v6.3.5  ready in 503 ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

`main.ts`中无需引入`style.css`，把`style.css`删掉即可

`components`中清空，`assert`清空


在package.json中配置如下，启动项目时，可自动打开浏览器
```json{2}
  "scripts": {
    "dev": "vite --open",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview"
  },
```

## eslint
eslint中文官网:http://eslint.cn/

ESLint最初是由[Nicholas C. Zakas](http://nczonline.net/) 于2013年6月创建的开源项目。它的目标是提供一个插件化的**javascript代码检测工具**

首先安装eslint

```bash
pnpm i eslint -D
```


生成配置文件:`eslint.config.js`
```bash
npx eslint --init
```
**选项：**
```bash
PS D:\workspace\vscode\vue_admin_template> npx eslint --init
You can also run this command directly using 'npm init @eslint/config@latest'.
Need to install the following packages:
@eslint/create-config@1.9.0
Ok to proceed? (y) y


> vue_admin_template@0.0.0 npx
> create-config

@eslint/create-config: v1.9.0

√ What do you want to lint? · javascript
√ How would you like to use ESLint? · problems
√ What type of modules does your project use? · esm
√ Which framework does your project use? · vue
√ Does your project use TypeScript? · no / yes
√ Where does your code run? · browser
The config that you've selected requires the following dependencies:

eslint, @eslint/js, globals, typescript-eslint, eslint-plugin-vue
√ Would you like to install them now? · No / Yes
√ Which package manager do you want to use? · pnpm
☕️Installing...
```

**vue3环境代码校验插件**
安装指令:
```bash
pnpm install -D eslint-plugin-import eslint-plugin-vue eslint-plugin-node eslint-plugin-prettier eslint-config-prettier eslint-plugin-node @babel/eslint-parser
```


**`eslint.config.js`配置文件**
```js
//eslint.config.js

// 导入 ESLint 相关插件和解析器

import pluginJs from '@eslint/js' // ESLint JavaScript 规则插件

import tseslint from '@typescript-eslint/eslint-plugin' // TypeScript ESLint 插件

import tsParser from '@typescript-eslint/parser' // TypeScript 解析器

import pluginVue from 'eslint-plugin-vue' // Vue.js ESLint 插件

import vueEslintParser from 'vue-eslint-parser' // Vue 解析器
import globals from 'globals'

// 导出 ESLint 配置数组

export default [
  {
    // 适用于的文件类型

    files: ['**/*.{js,mjs,cjs,ts,vue}'],

    // 忽略的文件和文件夹

    ignores: ['node_modules', 'dist', '*.config.js'],

    languageOptions: {
      globals: globals.browser, // 使用浏览器全局变量

      ecmaVersion: 'latest', // 使用最新的 ECMAScript 版本

      sourceType: 'module', // 使用模块类型

      parser: tsParser, // 使用 TypeScript 解析器
    },

    // 配置使用的插件

    plugins: {
      vue: pluginVue, // 引入 Vue 插件

      '@typescript-eslint': tseslint, // 引入 TypeScript ESLint 插件
    },

    // 定义 ESLint 规则

    rules: {
      ...pluginJs.configs.recommended.rules, // JavaScript 推荐规则

      ...tseslint.configs.recommended.rules, // TypeScript 推荐规则

      ...pluginVue.configs['flat/essential'].rules, // Vue 推荐规则

      // JavaScript 规则

      'no-var': 'error', // 禁止使用 var

      'no-multiple-empty-lines': ['warn', { max: 1 }], // 允许最多一行空行

      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off', // 在生产环境中禁止使用 console

      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off', // 在生产环境中禁止使用 debugger

      'no-unexpected-multiline': 'error', // 禁止意外的多行

      'no-useless-escape': 'off', // 关闭不必要的转义

      // TypeScript 规则

      '@typescript-eslint/no-unused-vars': 'error', // 禁止未使用的变量

      '@typescript-eslint/prefer-ts-expect-error': 'error', // 优先使用 ts-expect-error

      '@typescript-eslint/no-explicit-any': 'off', // 允许使用 any 类型

      '@typescript-eslint/no-non-null-assertion': 'off', // 允许使用非空断言

      '@typescript-eslint/no-namespace': 'off', // 允许使用命名空间

      '@typescript-eslint/semi': 'off', // 关闭分号规则

      // Vue 规则

      'vue/multi-word-component-names': 'off', // 关闭组件名称必须是多词的规则

      // "vue/script-setup-uses-vars": "error", // 检查 script setup 中的变量

      'vue/no-mutating-props': 'off', // 允许在 props 中进行变更

      'vue/attribute-hyphenation': 'off', // 允许不使用连字符的属性命名
    },
  },

  {
    // 适用于 Vue 文件

    files: ['**/*.vue'],

    languageOptions: {
      parser: vueEslintParser, // 使用 Vue 解析器

      parserOptions: {
        parser: tsParser, // 使用 TypeScript 解析器

        ecmaVersion: 'latest', // 使用最新的 ECMAScript 版本

        sourceType: 'module', // 使用模块类型
      },
    },
  },
]

```

package.json新增两个运行脚本
```json
"scripts": {
    "lint": "eslint src",
    "fix": "eslint --config ./eslint.config.js src --fix",
}
```


## 配置**prettier**

有了eslint，为什么还要有prettier？eslint针对的是javascript，他是一个检测工具，包含js语法以及少部分格式问题，在eslint看来，语法对了就能保证代码正常运行，格式问题属于其次；

而prettier属于格式化工具，它看不惯格式不统一，所以它就把eslint没干好的事接着干，另外，prettier支持

包含js在内的多种语言。

总结起来，**eslint和prettier这俩兄弟一个保证js代码质量，一个保证代码美观。**

安装依赖包
```bash
pnpm install prettier --save-dev
# 或者
yarn add prettier --dev
```

`.prettierrc.json`
```json
{
  "singleQuote": true,
  "semi": false,
  "bracketSpacing": true,
  "htmlWhitespaceSensitivity": "ignore",
  "endOfLine": "auto",
  "trailingComma": "all",
  "tabWidth": 2
}

```

`.prettierignore`

```
/dist/*
/html/*
.local
/node_modules/**
**/*.svg
**/*.sh
/public/*
```

`pacakage.json`
```json{7}[package.json]
  "scripts": {
    "dev": "vite --open",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint src",
    "fix": "eslint --config ./eslint.config.js src --fix",
    "format": "prettier --write ."
  },
```

`setting.json`
```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.format.enable": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## 配置stylelint
[stylelint](https://stylelint.io/)为css的lint工具。可格式化css代码，检查css语法错误与不合理的写法，指定css书写顺序等。

**官网:https://stylelint.bootcss.com/**

我们的项目中使用scss作为预处理器，安装以下依赖：
```bash
pnpm add sass sass-loader stylelint postcss postcss-scss postcss-html stylelint-config-prettier stylelint-config-recess-order stylelint-config-recommended-scss stylelint-config-standard stylelint-config-standard-vue stylelint-scss stylelint-order stylelint-config-standard-scss -D
```

`.stylelintrc.cjs`**配置文件**

```js
// @see https://stylelint.bootcss.com/

module.exports = {
  extends: [
    'stylelint-config-standard', // 配置stylelint拓展插件
    'stylelint-config-html/vue', // 配置 vue 中 template 样式格式化
    'stylelint-config-standard-scss', // 配置stylelint scss插件
    'stylelint-config-recommended-vue/scss', // 配置 vue 中 scss 样式格式化
    'stylelint-config-recess-order', // 配置stylelint css属性书写顺序插件,
    'stylelint-config-prettier', // 配置stylelint和prettier兼容
  ],
  overrides: [
    {
      files: ['**/*.(scss|css|vue|html)'],
      customSyntax: 'postcss-scss',
    },
    {
      files: ['**/*.(html|vue)'],
      customSyntax: 'postcss-html',
    },
  ],
  ignoreFiles: [
    '**/*.js',
    '**/*.jsx',
    '**/*.tsx',
    '**/*.ts',
    '**/*.json',
    '**/*.md',
    '**/*.yaml',
  ],
  /**
   * null  => 关闭该规则
   * always => 必须
   */
  rules: {
    'value-keyword-case': null, // 在 css 中使用 v-bind，不报错
    'no-descending-specificity': null, // 禁止在具有较高优先级的选择器后出现被其覆盖的较低优先级的选择器
    'function-url-quotes': 'always', // 要求或禁止 URL 的引号 "always(必须加上引号)"|"never(没有引号)"
    'no-empty-source': null, // 关闭禁止空源码
    'selector-class-pattern': null, // 关闭强制选择器类名的格式
    'property-no-unknown': null, // 禁止未知的属性(true 为不允许)
    'block-opening-brace-space-before': 'always', //大括号之前必须有一个空格或不能有空白符
    'value-no-vendor-prefix': null, // 关闭 属性值前缀 --webkit-box
    'property-no-vendor-prefix': null, // 关闭 属性前缀 -webkit-mask
    'selector-pseudo-class-no-unknown': [
      // 不允许未知的选择器
      true,
      {
        ignorePseudoClasses: ['global', 'v-deep', 'deep'], // 忽略属性，修改element默认样式的时候能使用到
      },
    ],
  },
}
```


`.stylelintignore`忽略文件
```
/node_modules/*
/dist/*
/html/*
/public/*
```

运行脚本
```json
"scripts": {
	"lint:style": "stylelint src/**/*.{css,scss,vue} --cache --fix"
}
```

最后配置统一的prettier来格式化我们的js和css，html代码
```json
  "scripts": {
    "dev": "vite --open",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint src",
    "fix": "eslint --config ./eslint.config.js src --fix",
    "format": "prettier --write \"./**/*.{html,vue,ts,js,json,md}\"",
    "lint:eslint": "eslint src/**/*.{ts,vue} --cache --fix",
    "lint:style": "stylelint src/**/*.{css,scss,vue} --cache --fix"
  },
```

:::tip
如果报了这个错：`“Issues with peer dependencies found ”错误`
执行该命令
```bash
pnpm config set auto-install-peers true
```
auto-install-peers 设置为 true ，在运行pnpm后，缺失的peer dependenices 会自动安装。

当然，也可以删除node_modules，再重新安装

---

如果报错`module' is not defined.eslintno-undef`

**.eslint.config.js**👇
```
export default [
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // 可选：手动声明 globals
      },
      environment: {
        node: true, // 👈 开启 Node.js 环境
      },
    },
    // 其他配置...
  }
]
```
:::

## 配置husky

在上面我们已经集成好了我们代码校验工具，但是需要每次手动的去执行命令才会格式化我们的代码。如果有人没有格式化就提交了远程仓库中，那这个规范就没什么用。所以我们需要强制让开发人员按照代码规范来提交。

要做到这件事情，就需要利用husky在代码提交之前触发git hook(git在客户端的钩子)，然后执行`pnpm run format`来自动的格式化我们的代码。

安装`husky`
```bash
pnpm install -D husky
```
执行
```bash
npx husky-init
```

会在根目录下生成个一个.husky目录，在这个目录下面会有一个pre-commit文件，这个文件里面的命令在我们执行commit的时候就会执行

在`.husky/pre-commit`文件添加如下命令：
```
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
pnpm run format
```

当我们对代码进行commit操作的时候，就会执行命令，对代码进行格式化，然后再提交。


## 配置commitlint

对于我们的commit信息，也是有统一规范的，不能随便写,要让每个人都按照统一的标准来执行，我们可以利用**commitlint**来实现。

安装包
```bash
pnpm add @commitlint/config-conventional @commitlint/cli -D
```
添加配置文件，新建`commitlint.config.cjs`(注意是cjs)，然后添加下面的代码：
```js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  // 校验规则
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'chore',
        'revert',
        'build',
      ],
    ],
    'type-case': [0],
    'type-empty': [0],
    'scope-empty': [0],
    'scope-case': [0],
    'subject-full-stop': [0, 'never'],
    'subject-case': [0, 'never'],
    'header-max-length': [0, 'always', 72],
  },
}
```
在`package.json`中配置scripts命令
```json
{
"scripts": {
    "commitlint": "commitlint --config commitlint.config.cjs -e -V"
  },
}
```
配置结束，现在当我们填写`commit`信息的时候，前面就需要带着下面的`subject`

```
'feat',//新特性、新功能
'fix',//修改bug
'docs',//文档修改
'style',//代码格式修改, 注意不是 css 修改
'refactor',//代码重构
'perf',//优化相关，比如提升性能、体验
'test',//测试用例修改
'chore',//其他修改, 比如改变构建流程、或者增加依赖库、工具等
'revert',//回滚到上一个版本
'build',//编译相关的修改，例如发布版本、对项目构建或者依赖的改动
```

**配置husky**
```
npx husky add .husky/commit-msg 
```
在生成的commit-msg文件中添加下面的命令
```
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
pnpm commitlint
```
当我们 commit 提交信息时，就不能再随意写了，必须是 git commit -m 'fix: xxx' 符合类型的才可以，**需要注意的是类型的后面需要用英文的 :，并且冒号后面是需要空一格的，这个是不能省略的**；


## 强制使用pnpm包管理器工具

团队开发项目的时候，需要统一包管理器工具,因为不同包管理器工具下载同一个依赖,可能版本不一样,

导致项目出现bug问题,因此包管理器工具需要统一管理！！！

在根目录创建`scritps/preinstall.js`文件，添加下面的内容

```
if (!/pnpm/.test(process.env.npm_execpath || '')) {
  console.warn(
    `\u001b[33mThis repository must using pnpm as the package manager ` +
    ` for scripts to work properly.\u001b[39m\n`,
  )
  process.exit(1)
}
```
配置命令
```
"scripts": {
	"preinstall": "node ./scripts/preinstall.js"
}
```
**当我们使用npm或者yarn来安装包的时候，就会报错了。原理就是在install的时候会触发preinstall（npm提供的生命周期钩子）这个文件里面的代码。**


## 集成element-plus

安装以下：
```bash
pnpm i @element-plus/icons-vue
```

```bash
pnpm install element-plus
```

main.ts
```ts{3-6,9-11}[main.ts]
import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
//@ts-ignore忽略当前文件ts类型的检测否则有红色提示(打包会失败)
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

const app = createApp(App)
app.use(ElementPlus, {
  locale: zhCn,
})
app.mount('#app')

```