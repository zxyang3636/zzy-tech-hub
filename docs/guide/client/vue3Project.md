# Vue3管理系统搭建

## 创建项目

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

