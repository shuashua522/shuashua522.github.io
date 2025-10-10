import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/": [
    "",
	{
      text: "博客文章",
      icon: "laptop-code",
      prefix: "shua_blog/",
      link: "shua_blog/",
      children: "structure",
    },
    {
      text: "如何使用",
      icon: "laptop-code",
      prefix: "demo/",
      link: "demo/",
      children: "structure",
    },
    {
      text: "文章-vuepress自动生成",
      icon: "book",
      prefix: "posts/",
      children: "structure",
    },
    "intro",
    {
      text: "幻灯片",
      icon: "person-chalkboard",
      link: "https://ecosystem.vuejs.press/zh/plugins/markdown/revealjs/demo.html",
    },
  ],
});
