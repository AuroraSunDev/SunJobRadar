# 首批官方来源核查（2026-10-17）

| 企业 | 已核实的入口 | 岗位详情链接格式 | 当前接入结论 |
| --- | --- | --- | --- |
| 美团 | [美团校招](https://zhaopin.meituan.com/web/campus)；[官方 FAQ](https://zhaopin.meituan.com/web/question/campus) 确认该入口 | `https://zhaopin.meituan.com/web/position/detail?jobUnionId=...`，见[官方岗位示例](https://zhaopin.meituan.com/web/position/detail?jobUnionId=4383089295) | 只支持用户手动保存详情链接；未接入自动采集 |
| 华为 | [华为校招](https://career.huawei.com/cn/campus-recruitment)；[官方 FAQ](https://career.huawei.com/reccampportal/next/mini/faq_h5.html) 指向招聘官网 | 已见 `career.huawei.com/reccampportal/portal5/campus-recruitment-detail.html?jobId=...` 格式；具体岗位可能改变路径 | 只支持用户手动保存已识别格式的详情链接；未接入自动采集 |

当前未找到面向第三方的公开招聘数据接口或可明确依据的批量采集许可。直接访问两站的 `/robots.txt` 会重定向到首页，不能据此判断允许自动采集。华为官网的[法律声明](https://www.huawei.com/cn/legal)对内容复制和存储设有许可要求；在明确授权或另有适用条款前，不实现批量抓取或复制 JD。此记录是工程接入判断，不是法律结论。

本阶段只存储用户手动填写的岗位名称、城市和官网详情链接。服务端校验 HTTPS、精确域名、详情路径和数字岗位 ID；去除非必要查询参数；不访问第三方页面，也不声称岗位内容经过系统核验。官网页面和岗位状态可能变化，投递前需在原站确认。
