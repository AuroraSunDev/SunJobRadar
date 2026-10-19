# 本机 Agent 数据契约 · v1

所有命令都在**生成后的工作台目录**运行，使用 Node.js 24.15+，无需 npm install、模型密钥或浏览器 Cookie。CLI 输出 JSON，失败退出码非零。写入 JSON 通过标准输入传入；避免将完整个人材料放在命令参数、公共日志和 Git 文件中。

| 命令 | 输入 / 效果 |
| --- | --- |
| `node cli.mjs read` | 当前画像、版本、岗位、收藏、检索记录与调度核对状态 |
| `node cli.mjs init < 文件` | 仅首次创建已确认画像 |
| `node cli.mjs profile < 文件` | 修改画像，必须带 `expectedVersion`；版本递增，旧分析显示过期 |
| `node cli.mjs import < 文件` | 一个检索批次，事务性导入与去重；同一 ID 同内容重试可读回原结果 |
| `node cli.mjs favorite < 文件` | `{ "id": "read 返回的岗位ID", "saved": true }` |
| `node cli.mjs schedule < 文件` | 核对外部调度配置，不会创建或执行任务 |
| `node cli.mjs serve` | 本机浏览器入口，默认 127.0.0.1:4173；可通过 PORT 选择其他端口 |

## 画像

见 [虚构画像示例](../examples/profile.example.json)。`confirmed` 只有在用户检查后才改为 true；roles 至少一个，其他偏好可以为空。`graduation` 为 YYYY-MM 或空串。facts 每条包含稳定的 id、text、source、boundary；source 用材料名称与章节，不存私人绝对路径。事实文本应明确是简历陈述还是独立核验结果。

`schedule` 是用户需明确确认的偏好：everyDays 为 1–365 的整数，time 为 24 小时时间，timezone 为有效 IANA 时区。没有确认时间偏好时请先补充，不静默替用户选择。它与实际任务配置分开。

## 检索批次

见 [虚构导入示例](../examples/run.example.json)，不能当成真实岗位。所有时间须为带时区的 ISO 日期。每次使用唯一 id、startedAt、completedAt、status、sources、jobs。status 为 success / partial / error；error 不能携带成功岗位，部分失败使用 partial。

每个 source：url（公网 HTTPS）、status（full / partial / discovery / blocked / error）、note。每个岗位须有相同规范化 URL、相同读取状态的来源条目。可另记检索入口或失败来源。

每个 job：url、title、company、city、roles、observedAt、sourceStatus、jd、requirements、recommendation、summary、profileVersion。仅发现链接时 jd 必须为空、requirements 必须为空，不得从搜索摘要推断毕业资格。完整/部分正文必须保存真实文字。读取时间不晚于批次完成时间。profileVersion 必须等于当前画像版本。

每个 requirement：text、state、must、factIds、evidence、reason。state 为 matched / partial / gap / unknown / not_applicable。evidence 如非空须为本次 jd 的原文片段；matched / partial 必须有有效事实 ID 和引文。已确认的个人要求也需要写入逐项分析；未知用户条件不能假装已满足。

recommendation 为 recommended / cautious / stretch / skip。推荐需完整正文、至少一个要求及所有 must 条件已匹配或不适用。此结构检查不能判断一个 JD 是否真的完整、推理是否正确或是否漏了硬门槛；Agent 应明确说出证据局限。

网址去除追踪查询参数，保留岗位识别参数与 hash 路由。第一发现时间取最早，最近发现取最晚；较旧记录、仅发现链接或较弱正文不会覆盖已保存的较新强证据。相同 ID 不同负载被拒绝。导入时保留引用事实的快照，修改画像不会替换旧分析的历史依据。导入日志不包含完整 JD 副本，岗位正文保留在岗位表。

## 实际调度记录

默认 `{ "status": "unconfigured" }`。创建或修改外部任务后，必须先用对应平台工具核对，再保存：

```json
{"status":"enabled","provider":"实际调度平台","id":"平台真实返回的任务ID","verifiedAt":"2026-10-19T02:00:00Z","description":"实际频率、时间、时区和本机运行条件；尚未观察首次执行"}
```

暂停后核对再记 paused。不要编造任务 ID，不要仅因保存时间偏好就记 enabled。运行记录才是检索实际执行的证据。

## 数据与浏览器访问

数据默认保存在实例 `.sunjobradar/radar.sqlite`，访问码在同目录 `access-key`；目录 0700、文件 0600。可用 SUNJOBRADAR_HOME 指定其他本机目录，务必将其排除于版本控制。CLI 运行账号拥有本机文件访问权限；访问码保护浏览器入口，不提供系统账号之间的隔离。

本机页面输入访问码后获得 HttpOnly/SameSite 会话；服务重启需要重新连接。拒绝非回环 Host 与跨源写入，不开放 CORS，不提供远程访问。数据仍可能在用户选择的 Agent/模型中被处理，具体依该产品设置；本项目不内置上传、遥测或模型请求。
