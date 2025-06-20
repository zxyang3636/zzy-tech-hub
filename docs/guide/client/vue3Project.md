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

### vue3环境代码校验插件
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