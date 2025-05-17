/* configs/nav.ts */
import type { DefaultTheme } from "vitepress";

export const nav: DefaultTheme.Config["nav"] = [
  { text: "首页", link: "/" },
  {
    text: "后端",
    items: [
      { text: "Java", link: "/guide/server/javaThreadPool" },
      { text: "Docker", link: "/guide/server/docker" },
      // { text: "SpringCloud", link: "/guide/server/springCloud" },
      {
        // 分组标题1
        text: "其他",
        items: [
          { text: "消息推送", link: "/guide/server/xiaoxi" },
          { text: "XXL-JOB", link: "/guide/server/xxljob" },
        ],
      },
    ],
  },
  {
    text: "前端",
    items: [
      { text: "Vue3", link: "/guide/client/vue3" },
    ],
  },
  // {
  //   text: "前端",
  //   items: [
  //     {
  //       // 分组标题1
  //       text: "UI框架",
  //       items: [{ text: "前言", link: "/preface" }],
  //     },
  //     {
  //       // 分组标题2
  //       text: "小程序",
  //       items: [
  //         { text: "快速上手", link: "/getting-started" },
  //         { text: "配置", link: "/configuration" },
  //         { text: "页面", link: "/page" },
  //         { text: "Frontmatter", link: "/frontmatter" },
  //       ],
  //     },
  //   ],
  // },
  // { text: "面试", link: "/guide/server/mianshi" },
  {
    text: "面试指北",
    items: [
      { text: "Java", link: "/guide/server/mianshi" },
      { text: "MySql", link: "/guide/server/mysqlMianshi" },
      { text: "Spring相关", link: "/guide/server/spring" },
    ],
  },
  {
    text: "其他",
    items: [
      { text: "网址导航", link: "/guide/server/daoHang" },
      { text: "片段", link: "/guide/client/fragment" },
      // { text: "软件分享", link: "/preface" },
      // { text: "常用工具", link: "/configuration" },
      { text: "ContactMe", link: "/api-examples" },
    ],
  },
];
