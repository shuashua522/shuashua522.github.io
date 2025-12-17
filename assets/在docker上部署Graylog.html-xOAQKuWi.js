import{_ as n}from"./plugin-vue_export-helper-DlAUqK2U.js";import{c as a,f as e,o as i}from"./app-Dx165Ixy.js";const l={};function p(r,s){return i(),a("div",null,[...s[0]||(s[0]=[e(`<h2 id="服务器环境" tabindex="-1"><a class="header-anchor" href="#服务器环境"><span>服务器环境</span></a></h2><p>Ubuntu-22.04</p><h2 id="安装docker" tabindex="-1"><a class="header-anchor" href="#安装docker"><span>安装docker</span></a></h2><blockquote><p><a href="https://docs.docker.com/desktop/setup/install/linux/ubuntu/" target="_blank" rel="noopener noreferrer">Ubuntu | Docker Docs --- Ubuntu | Docker Docs</a></p></blockquote><p>安装后 Docker 服务会自动启动。要验证 Docker 是否正在运行，请使用：</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-"><span class="line"><span>sudo systemctl status docker</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h3 id="配置docker镜像" tabindex="-1"><a class="header-anchor" href="#配置docker镜像"><span>配置docker镜像</span></a></h3><p><strong>配置镜像：</strong></p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-"><span class="line"><span># 1. 创建 Docker 配置目录（若已存在则跳过）</span></span>
<span class="line"><span>sudo mkdir -p /etc/docker</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 2. 编辑配置文件（daemon.json）</span></span>
<span class="line"><span>sudo nano /etc/docker/daemon.json</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 3. 粘贴以下内容(或者你的其他镜像地址)</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>  &quot;registry-mirrors&quot;: [  </span></span>
<span class="line"><span>  &quot;https://docker.xuanyuan.me&quot;,</span></span>
<span class="line"><span>  &quot;https://mirrors.tuna.tsinghua.edu.cn/docker-ce/&quot;]</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 4. 保存退出（Ctrl+O → 回车 → Ctrl+X）</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 5. 重启 Docker 服务，使配置生效</span></span>
<span class="line"><span>sudo systemctl daemon-reload</span></span>
<span class="line"><span>sudo systemctl restart docker</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>验证镜像是否生效：</strong></p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-"><span class="line"><span>docker info</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>输出中若能看到 Registry Mirrors: 你的镜像地址/，说明配置成功。</p><h2 id="在docker上部署graylog" tabindex="-1"><a class="header-anchor" href="#在docker上部署graylog"><span>在docker上部署Graylog</span></a></h2><p>要在 Docker 上部署 Graylog 并配合项目中的logback-gelf依赖实现日志收集，可按以下步骤操作（Graylog 需依赖 MongoDB 存储元数据、Elasticsearch 存储日志，推荐用 Docker Compose 编排）：</p><h3 id="步骤-1-准备-docker-compose-配置" tabindex="-1"><a class="header-anchor" href="#步骤-1-准备-docker-compose-配置"><span><strong>步骤 1：准备 Docker Compose 配置</strong></span></a></h3><p>创建docker-compose.yml文件，定义 Graylog、Elasticsearch、MongoDB 三个服务（注意版本兼容性，以下示例为稳定组合）：</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-"><span class="line"><span>version: &#39;3.8&#39;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>services:</span></span>
<span class="line"><span>  # MongoDB：存储Graylog元数据（用户、角色、配置等）</span></span>
<span class="line"><span>  mongodb:</span></span>
<span class="line"><span>    image: mongo:6.0  # 与Graylog 5.x兼容</span></span>
<span class="line"><span>    container_name: graylog-mongodb</span></span>
<span class="line"><span>    volumes:</span></span>
<span class="line"><span>      - mongodb_data:/data/db  # 持久化数据</span></span>
<span class="line"><span>    networks:</span></span>
<span class="line"><span>      - graylog-network</span></span>
<span class="line"><span>    restart: always</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  # Elasticsearch：存储实际日志数据</span></span>
<span class="line"><span>  elasticsearch:</span></span>
<span class="line"><span>    image: docker.elastic.co/elasticsearch/elasticsearch:7.17.12  # 与Graylog 5.x兼容</span></span>
<span class="line"><span>    container_name: graylog-elasticsearch</span></span>
<span class="line"><span>    environment:</span></span>
<span class="line"><span>      - discovery.type=single-node  # 单节点模式（生产环境需集群）</span></span>
<span class="line"><span>      - cluster.name=graylog  # 集群名需与Graylog配置一致</span></span>
<span class="line"><span>      - &quot;ES_JAVA_OPTS=-Xms512m -Xmx512m&quot;  # 调整JVM内存（根据服务器配置修改）</span></span>
<span class="line"><span>    volumes:</span></span>
<span class="line"><span>      - elasticsearch_data:/usr/share/elasticsearch/data  # 持久化日志</span></span>
<span class="line"><span>    networks:</span></span>
<span class="line"><span>      - graylog-network</span></span>
<span class="line"><span>    restart: always</span></span>
<span class="line"><span>    # Elasticsearch启动依赖系统参数，需提前配置（见步骤2）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  # Graylog：日志收集与分析平台</span></span>
<span class="line"><span>  graylog:</span></span>
<span class="line"><span>    image: graylog/graylog:5.1  # 稳定版本</span></span>
<span class="line"><span>    container_name: graylog-server</span></span>
<span class="line"><span>    environment:</span></span>
<span class="line"><span>      # 管理员密码（需是SHA-256哈希值，示例密码为&quot;admin&quot;）</span></span>
<span class="line"><span>      - GRAYLOG_ROOT_PASSWORD_SHA2=8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918</span></span>
<span class="line"><span>      - GRAYLOG_ROOT_EMAIL=admin@example.com  # 管理员邮箱（可选）</span></span>
<span class="line"><span>      # MongoDB连接地址（容器名+默认端口）</span></span>
<span class="line"><span>      - GRAYLOG_MONGODB_URI=mongodb://mongodb:27017/graylog</span></span>
<span class="line"><span>      # Elasticsearch连接地址（容器名+默认端口）</span></span>
<span class="line"><span>      - GRAYLOG_ELASTICSEARCH_HOSTS=http://elasticsearch:9200</span></span>
<span class="line"><span>      # Web界面绑定地址（允许外部访问）</span></span>
<span class="line"><span>      - GRAYLOG_HTTP_BIND_ADDRESS=0.0.0.0:9000</span></span>
<span class="line"><span>      # 时区（可选，与项目日志时区一致）</span></span>
<span class="line"><span>      - GRAYLOG_TIMEZONE=Asia/Shanghai</span></span>
<span class="line"><span>    volumes:</span></span>
<span class="line"><span>      - graylog_data:/usr/share/graylog/data  # 持久化Graylog数据</span></span>
<span class="line"><span>    ports:</span></span>
<span class="line"><span>      - &quot;9000:9000&quot;  # Web管理界面端口</span></span>
<span class="line"><span>      - &quot;12201:12201/udp&quot;  # GELF UDP端口（接收logback-gelf发送的日志）</span></span>
<span class="line"><span>      - &quot;12201:12201/tcp&quot;  # 可选，GELF TCP端口（根据项目配置选择）</span></span>
<span class="line"><span>    networks:</span></span>
<span class="line"><span>      - graylog-network</span></span>
<span class="line"><span>    restart: always</span></span>
<span class="line"><span>    depends_on:</span></span>
<span class="line"><span>      - mongodb</span></span>
<span class="line"><span>      - elasticsearch</span></span>
<span class="line"><span></span></span>
<span class="line"><span>networks:</span></span>
<span class="line"><span>  graylog-network:</span></span>
<span class="line"><span>    driver: bridge</span></span>
<span class="line"><span></span></span>
<span class="line"><span>volumes:</span></span>
<span class="line"><span>  mongodb_data:</span></span>
<span class="line"><span>  elasticsearch_data:</span></span>
<span class="line"><span>  graylog_data:</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="步骤-2-配置系统参数-linux-环境" tabindex="-1"><a class="header-anchor" href="#步骤-2-配置系统参数-linux-环境"><span><strong>步骤 2：配置系统参数（Linux 环境）</strong></span></a></h3><p>Elasticsearch 启动依赖vm.max_map_count参数（默认值可能不足），需提前设置：</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-"><span class="line"><span># 临时生效（重启服务器后失效）</span></span>
<span class="line"><span>sudo sysctl -w vm.max_map_count=262144</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 永久生效（推荐）</span></span>
<span class="line"><span>echo &quot;vm.max_map_count=262144&quot; | sudo tee -a /etc/sysctl.conf</span></span>
<span class="line"><span>sudo sysctl -p  # 刷新配置</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="步骤-3-启动-graylog-服务" tabindex="-1"><a class="header-anchor" href="#步骤-3-启动-graylog-服务"><span><strong>步骤 3：启动 Graylog 服务</strong></span></a></h3><p>在docker-compose.yml所在目录执行：</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-"><span class="line"><span># 启动服务（后台运行）</span></span>
<span class="line"><span>docker-compose up -d</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 查看启动状态（确认三个容器均为running）</span></span>
<span class="line"><span>docker-compose ps</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="步骤-4-配置-graylog-接收-gelf-日志" tabindex="-1"><a class="header-anchor" href="#步骤-4-配置-graylog-接收-gelf-日志"><span><strong>步骤 4：配置 Graylog 接收 GELF 日志</strong></span></a></h3><p>Graylog 需创建 “GELF 输入源” 接收logback-gelf发送的日志：</p><ol><li><p>访问 Graylog Web 界面：<a href="http://xn--IP-fr5c86lx7z:9000" target="_blank" rel="noopener noreferrer">http://服务器IP:9000</a>（首次登录用户名admin，密码admin，即步骤 1 中哈希对应的原始密码）。</p></li><li><p>左侧菜单进入 <strong>System → Inputs</strong>，在 “Select input” 下拉框选择 <strong>GELF UDP</strong>（或 TCP，与项目 logback 配置一致），点击 “Launch new input”。</p></li><li><p>配置输入源：</p></li></ol><ul><li><p><strong>Title</strong>：自定义名称（如my-gelf-input）。</p></li><li><p><strong>Bind address</strong>：<a href="http://0.0.0.0" target="_blank" rel="noopener noreferrer">0.0.0.0</a>（允许所有 IP 发送）。</p></li><li><p><strong>Port</strong>：12201（与 docker-compose 映射的端口一致）。</p></li><li><p>其他保持默认，点击 “Save”。</p></li></ul><h3 id="步骤-5-项目中配置-logback-gelf-发送日志" tabindex="-1"><a class="header-anchor" href="#步骤-5-项目中配置-logback-gelf-发送日志"><span><strong>步骤 5：项目中配置 logback-gelf 发送日志</strong></span></a></h3><p>项目已引入logback-gelf:3.0.0依赖，需在src/main/resources下创建logback.xml（或logback-spring.xml），配置 GELF 输出到 Graylog：</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-"><span class="line"><span>&lt;?xml version=&quot;1.0&quot; encoding=&quot;UTF-8&quot;?&gt;</span></span>
<span class="line"><span>&lt;configuration&gt;</span></span>
<span class="line"><span>    &lt;appender name=&quot;GELF&quot; class=&quot;de.siegmar.logback.gelf.GelfUdpAppender&quot;&gt;</span></span>
<span class="line"><span>        &lt;!-- Graylog服务器IP和端口（与docker-compose映射的12201一致） --&gt;</span></span>
<span class="line"><span>        &lt;host&gt;服务器IP&lt;/host&gt;</span></span>
<span class="line"><span>        &lt;port&gt;12201&lt;/port&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        &lt;!-- 必选字段：日志来源（如项目名） --&gt;</span></span>
<span class="line"><span>        &lt;source&gt;my-project&lt;/source&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        &lt;!-- 可选：额外字段（会在Graylog中显示） --&gt;</span></span>
<span class="line"><span>        &lt;additionalFields&gt;</span></span>
<span class="line"><span>            environment=dev,application=my-app</span></span>
<span class="line"><span>        &lt;/additionalFields&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        &lt;!-- 日志格式：包含时间、级别、消息等 --&gt;</span></span>
<span class="line"><span>        &lt;layout class=&quot;de.siegmar.logback.gelf.GelfLayout&quot;&gt;</span></span>
<span class="line"><span>            &lt;includeMdcKeyName&gt;requestId&lt;/includeMdcKeyName&gt;  &lt;!-- 可选：包含MDC中的字段 --&gt;</span></span>
<span class="line"><span>            &lt;includeLevelName&gt;true&lt;/includeLevelName&gt;</span></span>
<span class="line"><span>            &lt;includeThreadName&gt;true&lt;/includeThreadName&gt;</span></span>
<span class="line"><span>            &lt;includeLoggerName&gt;true&lt;/includeLoggerName&gt;</span></span>
<span class="line"><span>            &lt;includeFormattedMessage&gt;true&lt;/includeFormattedMessage&gt;</span></span>
<span class="line"><span>        &lt;/layout&gt;</span></span>
<span class="line"><span>    &lt;/appender&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    &lt;!-- 根日志级别：info及以上会被发送到Graylog --&gt;</span></span>
<span class="line"><span>    &lt;root level=&quot;info&quot;&gt;</span></span>
<span class="line"><span>        &lt;appender-ref ref=&quot;GELF&quot; /&gt;</span></span>
<span class="line"><span>    &lt;/root&gt;</span></span>
<span class="line"><span>&lt;/configuration&gt;</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li><p>若使用 TCP 而非 UDP，将GelfUdpAppender替换为GelfTcpAppender，并确保 Graylog 输入源对应 TCP。</p></li><li><p>host需填写部署 Graylog 的服务器 IP（本地测试可用<a href="http://localhost" target="_blank" rel="noopener noreferrer">localhost</a>）。</p></li></ul><h3 id="步骤-6-验证日志收集" tabindex="-1"><a class="header-anchor" href="#步骤-6-验证日志收集"><span><strong>步骤 6：验证日志收集</strong></span></a></h3><ol><li><p>启动项目，触发一些日志输出（<a href="http://xn--logger-hh4k.info" target="_blank" rel="noopener noreferrer">如logger.info</a>(&quot;test graylog&quot;)）。</p></li><li><p>回到 Graylog Web 界面，左侧菜单点击 <strong>Search</strong>，即可看到项目发送的日志（可能需要等待几秒刷新）。</p></li></ol><h3 id="常见问题排查" tabindex="-1"><a class="header-anchor" href="#常见问题排查"><span>常见问题排查</span></a></h3><ul><li><p><strong>Elasticsearch 启动失败</strong>：检查vm.max_map_count是否配置正确，或减少ES_JAVA_OPTS的内存（如-Xms256m -Xmx256m）。</p></li><li><p><strong>日志未接收</strong>：</p></li><li><p>检查 Graylog 的 GELF 输入源是否启动（System → Inputs中状态为Running）。</p></li><li><p>验证项目logback.xml的host和port是否正确，服务器防火墙是否开放 12201 端口。</p></li><li><p>查看 Graylog 容器日志：docker logs graylog-server，排查连接错误。</p></li></ul><p>通过以上步骤，即可在 Docker 中部署 Graylog 并结合logback-gelf实现日志收集。</p>`,36)])])}const t=n(l,[["render",p]]),o=JSON.parse('{"path":"/shua_blog/%E5%9C%A8docker%E4%B8%8A%E9%83%A8%E7%BD%B2Graylog.html","title":"在docker部署kafka","lang":"zh-CN","frontmatter":{"title":"在docker部署kafka","icon":"pen-to-square","date":"2025-10-26T00:00:00.000Z","category":["Java"],"tag":["docker","kafka"],"description":"服务器环境 Ubuntu-22.04 安装docker Ubuntu | Docker Docs --- Ubuntu | Docker Docs 安装后 Docker 服务会自动启动。要验证 Docker 是否正在运行，请使用： 配置docker镜像 配置镜像： 验证镜像是否生效： 输出中若能看到 Registry Mirrors: 你的镜像地址/，...","head":[["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"在docker部署kafka\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2025-10-26T00:00:00.000Z\\",\\"dateModified\\":\\"2025-12-01T07:54:51.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"shuashua\\",\\"url\\":\\"https://mister-hope.com\\"}]}"],["meta",{"property":"og:url","content":"https://mister-hope.github.io/shua_blog/%E5%9C%A8docker%E4%B8%8A%E9%83%A8%E7%BD%B2Graylog.html"}],["meta",{"property":"og:site_name","content":"shuashua的博客"}],["meta",{"property":"og:title","content":"在docker部署kafka"}],["meta",{"property":"og:description","content":"服务器环境 Ubuntu-22.04 安装docker Ubuntu | Docker Docs --- Ubuntu | Docker Docs 安装后 Docker 服务会自动启动。要验证 Docker 是否正在运行，请使用： 配置docker镜像 配置镜像： 验证镜像是否生效： 输出中若能看到 Registry Mirrors: 你的镜像地址/，..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2025-12-01T07:54:51.000Z"}],["meta",{"property":"article:tag","content":"kafka"}],["meta",{"property":"article:tag","content":"docker"}],["meta",{"property":"article:published_time","content":"2025-10-26T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2025-12-01T07:54:51.000Z"}]]},"git":{"createdTime":1764575691000,"updatedTime":1764575691000,"contributors":[{"name":"shuashua522","username":"shuashua522","email":"shuashua_world@163.com","commits":1,"url":"https://github.com/shuashua522"}]},"readingTime":{"minutes":4.28,"words":1284},"filePathRelative":"shua_blog/在docker上部署Graylog.md","excerpt":"<h2>服务器环境</h2>\\n<p>Ubuntu-22.04</p>\\n<h2>安装docker</h2>\\n<blockquote>\\n<p><a href=\\"https://docs.docker.com/desktop/setup/install/linux/ubuntu/\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\">Ubuntu | Docker Docs --- Ubuntu | Docker Docs</a></p>\\n</blockquote>\\n<p>安装后 Docker 服务会自动启动。要验证 Docker 是否正在运行，请使用：</p>\\n<div class=\\"language- line-numbers-mode\\" data-highlighter=\\"shiki\\" data-ext=\\"\\" style=\\"--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34\\"><pre class=\\"shiki shiki-themes one-light one-dark-pro vp-code\\"><code class=\\"language-\\"><span class=\\"line\\"><span>sudo systemctl status docker</span></span></code></pre>\\n<div class=\\"line-numbers\\" aria-hidden=\\"true\\" style=\\"counter-reset:line-number 0\\"><div class=\\"line-number\\"></div></div></div>","autoDesc":true}');export{t as comp,o as data};
