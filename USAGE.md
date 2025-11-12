# 使用文档（lmyhappy66.github.io）

本仓库是一个无需构建的纯静态学术主页模板。页面加载时会自动读取 `contents/` 下的 Markdown 和 YAML 文件，渲染到 `index.html`/`research.html` 中。

## 目录结构
```
.
├── index.html                # 首页（HOME/RESEARCH/PUBLICATIONS/AWARDS 等）
├── research.html             # 研究详情页（支持 topic 参数）
├── contents/                 # 文本内容源（Markdown/YAML）
│   ├── config.yml            # 站点文案配置（标题、版权、首页顶图文字等）
│   ├── home.md               # 首页 Home 模块 Markdown
│   ├── publications.md       # 首页 Publications 模块 Markdown
│   ├── awards.md             # 首页 Awards 模块 Markdown
│   ├── research.md           # 无参数访问 research.html 时使用的默认详情内容
│   ├── research_cards.yml    # RESEARCH 卡片配置（slug、title、image、excerpt）
│   └── research/             # 各主题详情 Markdown（与 slug 对应）
│       ├── marine-robotics.md
│       ├── motion-control.md
│       └── system-modeling.md
└── static/
    ├── assets/img/           # 图片资源（背景、头像、卡片图）
    ├── css/                  # 样式（Bootstrap 主题 + 自定义）
    └── js/                   # 页面脚本（加载器、Markdown/YAML、MathJax）
```

## 本地预览（不必上传到 GitHub）
页面通过 `fetch` 读取本地文件，必须使用本地静态服务器。推荐三种方式：

- VS Code Live Server 扩展（最省事）
  - 在 VS Code 安装“Live Server”。
  - 在仓库根目录右下角“Go Live”，或 `index.html` 右键 “Open with Live Server”。

- Python（Windows PowerShell）
```powershell
python -m http.server 8000
# 浏览器访问 http://localhost:8000
```

- Node.js（Windows PowerShell）
```powershell
npx http-server -p 8000
# 浏览器访问 http://localhost:8000
```

提示：修改文件后，浏览器 Ctrl+F5 强制刷新，避免缓存导致看不到最新效果。

## 首页内容编辑
- 文案配置：`contents/config.yml`
  - 常用键（会自动填充到相同 id 的元素）
    - `title` -> `<title id="title">`
    - `page-top-title` -> 导航品牌名
    - `top-section-bg-text` -> 首页顶部大字
    - `home-subtitle` -> Home 模块副标题
    - `copyright-text` -> 页脚版权
- Markdown 内容：
  - `contents/home.md` -> `#home` 模块
  - `contents/publications.md` -> `#publications` 模块
  - `contents/awards.md` -> `#awards` 模块

说明：脚本文件 `static/js/scripts.js` 中 `section_names = ['home','research','publications','awards']` 会尝试加载对应 `*.md` 并注入到 id 为 `name-md` 的容器。若页面中某个容器被注释或删除，不会报错。

## RESEARCH（卡片 + 详情页）
RESEARCH 被拆为两层：
- 第一层（首页卡片）：`index.html` 中的 `#research-cards` 区域，卡片从 `contents/research_cards.yml` 动态生成。
- 第二层（详情页）：`research.html`，根据 URL 参数 `?topic=<slug>` 加载 `contents/research/<slug>.md`，顶部展示该主题配图与标题。

### 1. 配置卡片（research_cards.yml）
示例：
```yaml
cards:
  - slug: marine-robotics
    title: Marine Robotics
    image: static/assets/img/background.jpeg
    excerpt: "Unmanned surface vehicles: motion control, system modeling, robust planning in dynamic marine environments."
  - slug: motion-control
    title: Motion Control
    image: static/assets/img/background.jpeg
    excerpt: "Nonlinear controllers and MPC for marine platforms under uncertainty and disturbances."
```
字段说明：
- `slug`：唯一标识，也作为详情 Markdown 文件名（`contents/research/<slug>.md`）及跳转参数（`research.html?topic=<slug>`）。
- `title`：卡片与详情页标题。
- `image`：卡片图与详情页顶部 hero 背景图（建议放在 `static/assets/img/`）。
- `excerpt`：卡片简介。注意：若包含冒号等特殊字符，请用引号包裹，避免 YAML 解析错误。

### 2. 添加详情 Markdown（按 slug 对应）
- 位置：`contents/research/<slug>.md`
- 访问：`research.html?topic=<slug>`
- 若无 `topic` 参数，`research.html` 将加载 `contents/research.md`。

### 3. 首页卡片点击跳转
- 首页卡片“Read More >>”自动指向 `research.html?topic=<slug>`。
- 详情页顶部 hero 会读取该卡片的 `title` 与 `image`，并设置页面 `document.title`。

## 图片与样式
- 替换头像/背景图：放到 `static/assets/img/`，并在 `index.html`/`research.html` 或 YAML 中引用。
- 自定义样式：优先修改 `static/css/main.css`，避免直接改第三方样式。

## GitHub Pages 部署
1. 仓库名建议为 `<username>.github.io`。
2. 打开仓库 Settings -> Pages。
3. Build and deployment -> Source: Deploy from a branch，选择分支与目录（通常 `main / root`）。
4. 等待几分钟，访问 `https://<username>.github.io`。

## 常见问题排查（FAQ）
- “本地双击 HTML 无法加载 Markdown/YAML”：
  - 需要使用本地静态服务器，见“本地预览”。
- RESEARCH 卡片不显示：
  - 打开浏览器控制台，若提示 `YAML parse error`，多半是 YAML 字符串含有冒号、# 等特殊字符未加引号（参考上面的示例）。
  - 直接访问 `http://localhost:8000/contents/research_cards.yml`，确认文件能被访问；若 404，请在仓库根目录启动服务器。
  - 强制刷新 Ctrl+F5，避免缓存。
- Edge/部分浏览器提示 Tracking Prevention：
  - 该提示与 CDN 资源（如 MathJax、Bootstrap Icons）有关，一般不影响本地 YAML/Markdown 的加载；必要时可在设置里暂时放宽跟踪防护或换用其他浏览器。
- 数学公式不渲染：
  - 网络不佳可能导致 MathJax 加载慢；稍候或切换网络。脚本已做防护，不会因为 MathJax 未就绪而阻断其他渲染。

## 进阶：自定义模块/导航
- 想新增一个模块（例如 `Projects`）：
  1) 在 `contents/` 新增 `projects.md`。
  2) 在 `index.html` 添加相应 section：
     - 区块 id：`projects`
     - 内容容器 id：`projects-md`
  3) 在 `static/js/scripts.js` 的 `section_names` 数组加入 `projects`。
- 想修改导航：直接编辑 `index.html` 顶部导航栏 `<nav>` 内的链接与标题即可。

## 许可证
- 本仓库基于 MIT 许可：详见 `LICENSE`。

如需我为你添加一键本地预览脚本（package.json / VS Code 任务），或为研究详情页增加副标题/遮罩样式/面包屑导航，请告诉我你的偏好，我可以直接补充配置与代码。
