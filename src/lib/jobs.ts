export type MatchCategory = "优先查看" | "可以考虑" | "信息不足";

export type Job = {
  id: string;
  company: string;
  title: string;
  city: string;
  type: string;
  category: MatchCategory;
  reason: string;
  firstSeen: string;
  lastChecked: string;
  source: string;
  responsibilities: string[];
  requirements: string[];
  matches: string[];
  toConfirm: string;
};

// Illustrative content for the visual demo. No job here has been verified.
export const jobs: Job[] = [
  {
    id: "meituan-ai-pm",
    company: "美团",
    title: "AI 产品经理",
    city: "杭州",
    type: "2027 届校招",
    category: "优先查看",
    reason: "与你关注的产品方向、AI 应用有较高相关度",
    firstSeen: "10月14日 10:00",
    lastChecked: "10月14日 10:00",
    source: "企业招聘官网",
    responsibilities: [
      "理解用户需求，参与 AI 产品的规划与设计。",
      "与研发、设计团队协作，推进产品方案落地。",
      "根据用户反馈持续改进产品体验。",
    ],
    requirements: [
      "面向 2027 届毕业生。",
      "对 AI 应用和产品设计有兴趣。",
      "具备沟通协作与问题分析能力。",
    ],
    matches: ["目标岗位与 AI 产品方向相关", "工作地点在你的目标城市内"],
    toConfirm: "官网未提供明确发布时间，查看原始岗位以确认最新要求。",
  },
  {
    id: "huawei-ai-engineer",
    company: "华为",
    title: "AI 应用开发工程师",
    city: "北京",
    type: "2027 届校招",
    category: "可以考虑",
    reason: "与你关注的 AI 应用开发方向较为匹配",
    firstSeen: "10月13日 16:20",
    lastChecked: "10月14日 10:00",
    source: "企业招聘官网",
    responsibilities: [
      "参与 AI 应用功能的设计与开发。",
      "与团队协作完成需求分析和功能验证。",
      "持续改进应用性能与使用体验。",
    ],
    requirements: [
      "面向 2027 届毕业生。",
      "具备软件开发基础。",
      "了解常见 AI 应用场景。",
    ],
    matches: ["岗位方向符合你的目标", "工作地点在你的目标城市内"],
    toConfirm: "部分技术要求需前往官网核对。",
  },
  {
    id: "bytedance-llm-engineer",
    company: "字节跳动",
    title: "大模型算法工程师",
    city: "北京",
    type: "2027 届校招",
    category: "信息不足",
    reason: "与你关注的大模型、AI 算法方向较为匹配",
    firstSeen: "10月12日 14:08",
    lastChecked: "10月14日 10:00",
    source: "企业招聘官网",
    responsibilities: [
      "参与大模型相关方向的研究与应用。",
      "与工程团队协作验证算法效果。",
      "整理实验结果并持续优化方案。",
    ],
    requirements: [
      "具备计算机或相关专业基础。",
      "了解机器学习与深度学习。",
      "具有良好的分析与协作能力。",
    ],
    matches: ["岗位方向与你的 AI 兴趣相关"],
    toConfirm: "招聘批次及毕业年份需要在官网进一步确认。",
  },
  {
    id: "tencent-backend-engineer",
    company: "腾讯",
    title: "后端开发工程师",
    city: "深圳",
    type: "2027 届校招",
    category: "可以考虑",
    reason: "与你关注的开发方向较为匹配",
    firstSeen: "10月11日 09:32",
    lastChecked: "10月14日 10:00",
    source: "企业招聘官网",
    responsibilities: [
      "参与服务端功能开发与维护。",
      "与团队协作完成需求交付。",
      "持续优化服务质量与性能。",
    ],
    requirements: [
      "面向 2027 届毕业生。",
      "具备编程和数据结构基础。",
      "具有良好的团队协作能力。",
    ],
    matches: ["岗位方向与你的开发兴趣相关"],
    toConfirm: "工作地点不在当前目标城市，请自行判断是否考虑。",
  },
];

export const featuredJobs = jobs.slice(0, 3);
