import { defineConfig } from "vitepress";
import { nav } from "./configs";
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
} from "vitepress-plugin-group-icons";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin); //代码组图标
    },
    lineNumbers: true, // 代码快行数显示
    image: {
      // 开启图片懒加载
      lazyLoading: true,
    },
  },
  vite: {
    plugins: [
      groupIconVitePlugin(), //代码组图标
    ],
  },

  base: "/",
  ignoreDeadLinks: false,
  lang: "zh-CN", //语言，可选 en-US
  title: "zzy-blog",
  description: "zzy的记录文档、coding",
  //fav图标
  head: [["link", { rel: "icon", href: "/logo.png" }]],
  //多语言
  locales: {
    root: {
      label: "简体中文",
      lang: "Zh_CN",
    },
    en: {
      label: "English",
      lang: "en",
      link: "/en/",
    },
  },
  themeConfig: {
    outline: {
      level: [1, 6], // 显示2-4级标题
      // level: 'deep', // 显示2-6级标题
      label: "当前页大纲", // 文字显示
    },
    //上次更新时间
    lastUpdated: {
      text: "最后更新于",
      formatOptions: {
        dateStyle: "short", // 可选值full、long、medium、short
        timeStyle: "medium", // 可选值full、long、medium、short
      },
    },
    logo: "/logo.png", // 左上角logo
    //本地搜索
    search: {
      provider: "local",
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: "搜索文档",
                buttonAriaLabel: "搜索文档",
              },
              modal: {
                noResultsText: "无法找到相关结果",
                resetButtonTitle: "清除查询条件",
                footer: {
                  selectText: "选择",
                  navigateText: "切换",
                },
              },
            },
          },
        },
      },
    },
    // https://vitepress.dev/reference/default-theme-config
    nav,

    sidebar: [
      {
        //分组标题
        text: "后端",
        collapsed: false,
        items: [
          { text: "Java", link: "/guide/server/javaThreadPool" },
          { text: "SpringCloud", link: "/guide/server/springCloud" },
          { text: "xxl-job", link: "/guide/server/xxljob" },
          { text: "消息推送", link: "/guide/server/xiaoxi" },
          // { text: "快速上手", link: "/getting-started" },
          // { text: "配置", link: "/configuration" },
          // { text: "页面", link: "/page" },
          // { text: "Frontmatter", link: "/frontmatter" },
        ],
      },
      {
        //分组标题
        text: "前端",
        collapsed: false,
        items: [
          { text: "Vue", link: "/guide/client/vue3" },
          // { text: "MySql", link: "/guide/server/mysqlMianshi" },
        ],
      },
      {
        //分组标题
        text: "面试指北",
        collapsed: false,
        items: [
          { text: "Java", link: "/guide/server/mianshi" },
          { text: "MySql", link: "/guide/server/mysqlMianshi" },
        ],
      },
      {
        //分组标题
        text: "其他",
        items: [
          { text: "网址导航", link: "/guide/server/daoHang" },
          { text: "Markdown示例页", link: "/markdown-examples" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/zxyang3636/zzy-tech-hub" },
      { icon: "gitee", link: "https://gitee.com/zz_yang/" },
    ],
    //页脚
    footer: {
      // message: "Released under the MIT License.",
      // message: `<a href="https://beian.miit.gov.cn/" target="_blank">黑ICP备2025035182号</a>`,
      copyright: `<a href="https://beian.miit.gov.cn/" target="_blank">黑ICP备2025035182号-1</a> Copyright © 2024-${new Date().getFullYear()} <a href="https://beian.mps.gov.cn/#/query/webSearch?code=23012702000012" target="_blank">黑公网安备23012702000012号</a>`,
      // 自动更新时间
      //copyright: `Copyright © 2019-${new Date().getFullYear()} present Evan You`,
    },
  },
});
