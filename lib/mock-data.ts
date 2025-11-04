export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  coverImage: string;
  content: string;
  downloadUrl: string;
  downloadCount: number;
  price: number;
  isVipOnly: boolean;
  vipDailyLimit?: number;
  tags: string[];
  createdAt: string;
  author: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  parentId: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  isVip: boolean;
  vipLevel: number;
  vipExpiryDate?: string;
  dailyDownloadCount: number;
  totalDownloadCount: number;
  balance: number;
}

export interface VipPlan {
  id: string;
  name: string;
  price: number;
  duration: number; // days
  dailyDownloadLimit: number;
  features: string[];
  recommended?: boolean;
}

export const categories: Category[] = [
  {
    id: '1',
    name: '编程开发',
    icon: '💻',
    subcategories: [
      { id: '1-1', name: '前端开发', parentId: '1' },
      { id: '1-2', name: '后端开发', parentId: '1' },
      { id: '1-3', name: '移动开发', parentId: '1' },
      { id: '1-4', name: '数据库', parentId: '1' },
    ]
  },
  {
    id: '2',
    name: '设计创意',
    icon: '🎨',
    subcategories: [
      { id: '2-1', name: 'UI设计', parentId: '2' },
      { id: '2-2', name: '平面设计', parentId: '2' },
      { id: '2-3', name: '3D建模', parentId: '2' },
      { id: '2-4', name: '视频制作', parentId: '2' },
    ]
  },
  {
    id: '3',
    name: '办公效率',
    icon: '📊',
    subcategories: [
      { id: '3-1', name: '办公软件', parentId: '3' },
      { id: '3-2', name: '项目管理', parentId: '3' },
      { id: '3-3', name: '文档模板', parentId: '3' },
      { id: '3-4', name: '效率工具', parentId: '3' },
    ]
  },
  {
    id: '4',
    name: '学习资料',
    icon: '📚',
    subcategories: [
      { id: '4-1', name: '电子书籍', parentId: '4' },
      { id: '4-2', name: '课程视频', parentId: '4' },
      { id: '4-3', name: '考试资料', parentId: '4' },
      { id: '4-4', name: '语言学习', parentId: '4' },
    ]
  }
];

export const resources: Resource[] = [
  {
    id: '1',
    title: 'React 18 完整开发指南',
    description: '从基础到高级的React 18完整教程，包含Hooks、Suspense、Concurrent Mode等新特性',
    category: '编程开发',
    subcategory: '前端开发',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
    content: '这是一份详细的React 18开发指南，涵盖了所有新特性和最佳实践...',
    downloadUrl: '/downloads/react18-guide.pdf',
    downloadCount: 1250,
    price: 29.99,
    isVipOnly: false,
    vipDailyLimit: 3,
    tags: ['React', 'JavaScript', 'Frontend', 'Tutorial'],
    createdAt: '2024-01-15',
    author: '张三'
  },
  {
    id: '2',
    title: 'UI设计系统完整模板',
    description: '包含按钮、表单、卡片、导航等完整UI组件库的设计系统模板',
    category: '设计创意',
    subcategory: 'UI设计',
    coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    content: '专业的UI设计系统，包含完整的设计规范和组件库...',
    downloadUrl: '/downloads/ui-design-system.fig',
    downloadCount: 890,
    price: 49.99,
    isVipOnly: true,
    vipDailyLimit: 2,
    tags: ['UI Design', 'Figma', 'Design System', 'Components'],
    createdAt: '2024-01-20',
    author: '李四'
  },
  {
    id: '3',
    title: 'Python数据分析实战',
    description: '使用Python进行数据分析的完整教程，包含pandas、numpy、matplotlib等库的使用',
    category: '编程开发',
    subcategory: '后端开发',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop',
    content: '从基础到高级的Python数据分析教程，包含实际项目案例...',
    downloadUrl: '/downloads/python-data-analysis.zip',
    downloadCount: 2100,
    price: 39.99,
    isVipOnly: false,
    vipDailyLimit: 5,
    tags: ['Python', 'Data Analysis', 'Pandas', 'Machine Learning'],
    createdAt: '2024-01-10',
    author: '王五'
  },
  {
    id: '4',
    title: '高级Excel办公技巧大全',
    description: '提升办公效率的Excel高级技巧，包含函数、宏、数据透视表等',
    category: '办公效率',
    subcategory: '办公软件',
    coverImage: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop',
    content: '全面的Excel高级技巧教程，帮助你成为办公达人...',
    downloadUrl: '/downloads/excel-tips.pdf',
    downloadCount: 3200,
    price: 19.99,
    isVipOnly: false,
    vipDailyLimit: 10,
    tags: ['Excel', 'Office', 'Productivity', 'Tutorial'],
    createdAt: '2024-01-25',
    author: '赵六'
  },
  {
    id: '5',
    title: '3D建模入门到精通',
    description: 'Blender 3D建模完整教程，从基础建模到高级渲染技巧',
    category: '设计创意',
    subcategory: '3D建模',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop',
    content: '系统的Blender 3D建模教程，包含大量实战项目...',
    downloadUrl: '/downloads/blender-modeling-course.zip',
    downloadCount: 650,
    price: 69.99,
    isVipOnly: true,
    vipDailyLimit: 1,
    tags: ['3D Modeling', 'Blender', 'Design', 'Tutorial'],
    createdAt: '2024-01-18',
    author: '孙七'
  },
  {
    id: '6',
    title: 'JavaScript高级编程',
    description: '深入理解JavaScript核心概念，包含闭包、原型链、异步编程等高级主题',
    category: '编程开发',
    subcategory: '前端开发',
    coverImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop',
    content: 'JavaScript高级编程指南，适合有一定基础的开发者...',
    downloadUrl: '/downloads/js-advanced.pdf',
    downloadCount: 1800,
    price: 34.99,
    isVipOnly: false,
    vipDailyLimit: 4,
    tags: ['JavaScript', 'Programming', 'Advanced', 'Tutorial'],
    createdAt: '2024-01-12',
    author: '周八'
  }
  ,
  {
    id: '7',
    title: 'Node.js 微服务实战',
    description: '使用Node.js与Docker构建可扩展的微服务架构',
    category: '编程开发',
    subcategory: '后端开发',
    coverImage: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?w=400&h=300&fit=crop',
    content: '从零构建微服务，涵盖服务通信、容器化与部署...',
    downloadUrl: '/downloads/node-microservices.zip',
    downloadCount: 980,
    price: 49.00,
    isVipOnly: false,
    tags: ['Node.js', 'Microservices', 'Docker'],
    createdAt: '2024-02-01',
    author: '工程师A'
  },
  {
    id: '8',
    title: 'Vue 3 响应式原理深度解析',
    description: '深入理解Vue 3响应式系统与组合式API',
    category: '编程开发',
    subcategory: '前端开发',
    coverImage: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=400&h=300&fit=crop',
    content: '通过源码与示例掌握Vue 3的核心机制...',
    downloadUrl: '/downloads/vue3-reactivity.pdf',
    downloadCount: 620,
    price: 29.00,
    isVipOnly: false,
    tags: ['Vue', 'Frontend'],
    createdAt: '2024-02-03',
    author: '工程师B'
  },
  {
    id: '9',
    title: '高效项目管理模板集',
    description: '涵盖甘特图、看板、OKR等多种实用模板',
    category: '办公效率',
    subcategory: '项目管理',
    coverImage: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=400&h=300&fit=crop',
    content: '一套即用型项目管理模板，提升协作效率...',
    downloadUrl: '/downloads/pm-templates.zip',
    downloadCount: 1450,
    price: 19.00,
    isVipOnly: false,
    tags: ['Project', 'Templates'],
    createdAt: '2024-02-05',
    author: '产品经理C'
  },
  {
    id: '10',
    title: 'Figma 组件库与原型设计',
    description: '从零搭建可复用的Figma组件库并完成原型设计',
    category: '设计创意',
    subcategory: 'UI设计',
    coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop',
    content: '提高设计效率的系统化方法与实践...',
    downloadUrl: '/downloads/figma-components.fig',
    downloadCount: 810,
    price: 39.00,
    isVipOnly: true,
    tags: ['Figma', 'Design'],
    createdAt: '2024-02-06',
    author: '设计师D'
  },
  {
    id: '11',
    title: 'Python 爬虫与数据抓取',
    description: 'requests、BeautifulSoup与异步爬虫实战',
    category: '编程开发',
    subcategory: '后端开发',
    coverImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=300&fit=crop',
    content: '构建高效且稳定的数据抓取系统...',
    downloadUrl: '/downloads/python-crawler.zip',
    downloadCount: 1320,
    price: 25.00,
    isVipOnly: false,
    tags: ['Python', 'Crawler'],
    createdAt: '2024-02-08',
    author: '工程师E'
  },
  {
    id: '12',
    title: 'AI 提示工程手册',
    description: '系统化掌握提示工程在各领域的最佳实践',
    category: '学习资料',
    subcategory: '电子书籍',
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop',
    content: '提升与AI协作效率的实战指南...',
    downloadUrl: '/downloads/prompt-engineering.pdf',
    downloadCount: 210,
    price: 9.90,
    isVipOnly: false,
    tags: ['AI', 'Productivity'],
    createdAt: '2024-02-10',
    author: '研究者F'
  },
  {
    id: '13',
    title: 'Docker 与 K8s 入门到实践',
    description: '容器化与编排的完整学习路径与案例',
    category: '编程开发',
    subcategory: '后端开发',
    coverImage: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop',
    content: '从Docker到Kubernetes的进阶之路...',
    downloadUrl: '/downloads/docker-k8s-course.zip',
    downloadCount: 990,
    price: 59.00,
    isVipOnly: true,
    tags: ['Docker', 'Kubernetes'],
    createdAt: '2024-02-12',
    author: '架构师G'
  },
  {
    id: '14',
    title: '移动端Flutter开发实战',
    description: '使用Flutter构建跨平台高性能应用',
    category: '编程开发',
    subcategory: '移动开发',
    coverImage: 'https://images.unsplash.com/photo-1519162584292-2aa66f2d5dc0?w=400&h=300&fit=crop',
    content: '从UI到状态管理的完整项目演练...',
    downloadUrl: '/downloads/flutter-course.zip',
    downloadCount: 430,
    price: 49.00,
    isVipOnly: false,
    tags: ['Flutter', 'Mobile'],
    createdAt: '2024-02-13',
    author: '开发者H'
  },
  {
    id: '15',
    title: 'Photoshop 高级修图技巧',
    description: '商业修图流程与色彩管理完整教程',
    category: '设计创意',
    subcategory: '平面设计',
    coverImage: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
    content: '专业修图技巧与工作流优化...',
    downloadUrl: '/downloads/photoshop-advanced.zip',
    downloadCount: 560,
    price: 39.00,
    isVipOnly: false,
    tags: ['Photoshop', 'Design'],
    createdAt: '2024-02-14',
    author: '设计师I'
  },
  {
    id: '16',
    title: 'Excel 财务模型模板集',
    description: '适用于预算、现金流、估值的专业模板',
    category: '办公效率',
    subcategory: '文档模板',
    coverImage: 'https://images.unsplash.com/photo-1554224154-22dec7ec8818?w=400&h=300&fit=crop',
    content: '财务场景下的高质量Excel模板集合...',
    downloadUrl: '/downloads/excel-finance-templates.zip',
    downloadCount: 720,
    price: 29.00,
    isVipOnly: true,
    tags: ['Excel', 'Finance'],
    createdAt: '2024-02-15',
    author: '分析师J'
  },
  {
    id: '17',
    title: '机器学习项目实战合集',
    description: '含数据预处理、特征工程与模型部署的完整案例',
    category: '编程开发',
    subcategory: '后端开发',
    coverImage: 'https://images.unsplash.com/photo-1518770660430-2e34f6a04e6a?w=400&h=300&fit=crop',
    content: '从零到上线的机器学习工程实践...',
    downloadUrl: '/downloads/ml-projects.zip',
    downloadCount: 410,
    price: 69.00,
    isVipOnly: false,
    tags: ['Machine Learning', 'Python'],
    createdAt: '2024-02-16',
    author: '数据科学家K'
  },
  {
    id: '18',
    title: 'PowerPoint 商务演示模板',
    description: '现代风格的商务演示模板与图表合集',
    category: '办公效率',
    subcategory: '文档模板',
    coverImage: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop',
    content: '提升演示品质的PPT模板集...',
    downloadUrl: '/downloads/ppt-business-templates.zip',
    downloadCount: 1280,
    price: 19.00,
    isVipOnly: false,
    tags: ['PPT', 'Templates'],
    createdAt: '2024-02-18',
    author: '职场人L'
  },
  {
    id: '19',
    title: 'After Effects 动效设计基础',
    description: '入门到进阶的AE动效课程与素材',
    category: '设计创意',
    subcategory: '视频制作',
    coverImage: 'https://images.unsplash.com/photo-1512427691650-1c6c83f40d35?w=400&h=300&fit=crop',
    content: '动效设计的核心理念与实操...',
    downloadUrl: '/downloads/ae-motion-course.zip',
    downloadCount: 360,
    price: 59.00,
    isVipOnly: true,
    tags: ['AE', 'Motion'],
    createdAt: '2024-02-19',
    author: '动效师M'
  },
  {
    id: '20',
    title: 'Notion 高效知识管理',
    description: '打造个人与团队知识库的Notion实践手册',
    category: '办公效率',
    subcategory: '效率工具',
    coverImage: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&h=300&fit=crop',
    content: '以场景驱动的Notion使用指南...',
    downloadUrl: '/downloads/notion-guide.pdf',
    downloadCount: 540,
    price: 15.00,
    isVipOnly: false,
    tags: ['Notion', 'Productivity'],
    createdAt: '2024-02-20',
    author: '效率控N'
  }
];

export const vipPlans: VipPlan[] = [
  {
    id: 'vip1',
    name: '月度会员',
    price: 29.99,
    duration: 30,
    dailyDownloadLimit: 10,
    features: ['每日10次下载', 'VIP专属资源', '优先客服支持'],
    recommended: false
  },
  {
    id: 'vip2',
    name: '季度会员',
    price: 79.99,
    duration: 90,
    dailyDownloadLimit: 15,
    features: ['每日15次下载', 'VIP专属资源', '优先客服支持', '专属折扣'],
    recommended: true
  },
  {
    id: 'vip3',
    name: '年度会员',
    price: 299.99,
    duration: 365,
    dailyDownloadLimit: 25,
    features: ['每日25次下载', 'VIP专属资源', '优先客服支持', '专属折扣', '免费更新'],
    recommended: false
  }
];

export const currentUser: User = {
  id: '1',
  username: '游客用户',
  email: 'guest@example.com',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
  isVip: false,
  vipLevel: 0,
  dailyDownloadCount: 0,
  totalDownloadCount: 0,
  balance: 0
};

export const carouselImages = [
  {
    id: 1,
    title: '海量优质资源',
    subtitle: '超过10000+精选资源等你下载',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=400&fit=crop',
    buttonText: '立即探索'
  },
  {
    id: 2,
    title: 'VIP专享特权',
    subtitle: '享受更多下载次数和专属资源',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&h=400&fit=crop',
    buttonText: '升级VIP'
  },
  {
    id: 3,
    title: '每日更新',
    subtitle: '最新最热的资源第一时间获取',
    image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&h=400&fit=crop',
    buttonText: '查看最新'
  }
];

export const motivationalQuotes = [
  '学习是一生的投资，知识是最宝贵的财富',
  '每一次下载都是向成功迈进的一步',
  '知识改变命运，学习成就未来',
  '今天的努力，是明天成功的基石',
  '不断学习，持续成长，成就更好的自己'
];