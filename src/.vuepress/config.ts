import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  lang: "zh-CN",
  title: "shuashua的博客",
  description: "建造个人博客/知识库",

  theme,

  // 和 PWA 一起启用
  // shouldPrefetch: false,
});
