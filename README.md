# AIII

**投出你的 Best Paper**  
先交上去，剩下交给 reviewer。

AIII 是一个可部署到 GitHub Pages 的静态网页，用点选式流程模拟顶会投稿、开分、rebuttal 和最终开奖。它不上传论文、不接入 LLM、不保存用户数据，只生成一张荒诞但熟悉的审稿结果卡。

## 本地打开

直接用浏览器打开 `index.html` 即可。

## GitHub Pages

建议仓库名直接叫 `AIII`，发布后入口就是：

```text
https://<user>.github.io/AIII/
```

本仓库已经带了 GitHub Actions 部署文件：`.github/workflows/pages.yml`。

首次部署步骤：

1. 在 GitHub 新建公开仓库 `AIII`。
2. 把本地文件推到 `main` 分支。
3. 进入仓库 `Settings -> Pages`。
4. `Build and deployment` 的 `Source` 选择 `GitHub Actions`。
5. 打开 `Actions`，等待 `Deploy GitHub Pages` 跑完。

以后每次推送 `main`，页面会自动更新。

## 边界

AIII 是讽刺性模拟，不预测真实录用结果，不点名具体 reviewer、学校或泄露身份。流程依据见 `sources.html`。
