# 官方来源核查（2026-10-17—18）

| 企业 | 已核实的入口 | 岗位详情链接格式 | 当前接入结论 |
| --- | --- | --- | --- |
| 美团 | [美团校招](https://zhaopin.meituan.com/web/campus)；[官方 FAQ](https://zhaopin.meituan.com/web/question/campus) 确认该入口 | `https://zhaopin.meituan.com/web/position/detail?jobUnionId=...`，见[官方岗位示例](https://zhaopin.meituan.com/web/position/detail?jobUnionId=4383089295) | 只支持用户手动保存详情链接；未接入自动采集 |
| 华为 | [华为校招](https://career.huawei.com/cn/campus-recruitment)；[官方 FAQ](https://career.huawei.com/reccampportal/next/mini/faq_h5.html) 指向招聘官网 | 已见 `career.huawei.com/reccampportal/portal5/campus-recruitment-detail.html?jobId=...` 格式；具体岗位可能改变路径 | 只支持用户手动保存已识别格式的详情链接；未接入自动采集 |
| 文远知行 | [公司官网招聘页](https://www.weride.ai/careers)链接至[官方 Lever 职位页](https://jobs.lever.co/weride)；[Lever Postings API 文档](https://github.com/lever/postings-api)提供公开职位列表接口 | `https://jobs.lever.co/weride/{posting_id}` | 已接入公开接口，仅同步 `Campus Recruiting` 且地点为 `China` 的岗位元数据 |

美团、华为当前未找到适合本项目的公开招聘数据接口或明确的批量采集许可。直接访问两站的 `/robots.txt` 会重定向到首页，不能据此判断允许自动采集。[华为法律声明](https://www.huawei.com/cn/legal)明确限制自动流程获取或监控网站内容；[美团用户服务协议](https://rules-center.meituan.com/m/detail/guize/4?activeRule=1)限制未经认可的程序抓取。因此这两站不做自动采集。此记录是工程接入判断，不是法律结论。

文远知行公司官网明确指向 Lever 托管的职位页，[Lever 文档](https://github.com/lever/postings-api)提供无需申请密钥的公开职位列表接口。2026-10-18 的实时检查返回 15 条公开岗位，其中 2 条标记为中国校招；本项目只保存职位编号、标题、来源链接、来源类别和发现时间，不复制完整 JD。重复检查得到 0 个新岗位。接口返回异常时保留上次成功结果并记录失败。

本阶段只存储用户手动填写的岗位名称、城市和官网详情链接。服务端校验 HTTPS、精确域名、详情路径和数字岗位 ID；去除非必要查询参数；不访问第三方页面，也不声称岗位内容经过系统核验。官网页面和岗位状态可能变化，投递前需在原站确认。
