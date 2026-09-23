import type { HeritageEntry } from '../types/heritage';

/**
 * V3.0 Phase 1 种子库
 *
 * 这里先放“创作大类”，用于验证产品流程。
 * 它们不是“全国所有非遗项目”的最终数据库。
 *
 * 后续数据同步目标：
 * 官方十大门类 -> 官方项目 -> 地域子项 -> 详情页 -> AI 创作档案
 */
export const HERITAGE_CATALOG: HeritageEntry[] = [
  {
    slug: 'yiwulvshan-manchu-paper-cutting', name: '医巫闾山满族剪纸',
    officialName: '剪纸（医巫闾山满族剪纸）', officialCategory: '传统美术',
    region: '辽宁省锦州市', level: 'national', designation: '国家级非物质文化遗产代表性项目',
    projectCode: 'Ⅶ-16', announcedAt: '2006年（第一批）',
    sourceUrl: 'https://www.ihchina.cn/project_details/13927.html',
    sourceLabel: '中国非物质文化遗产网·中国非物质文化遗产数字博物馆', lastVerifiedAt: '2026-09-23',
    summary: '医巫闾山满族剪纸流传于辽西医巫闾山地区，具有鲜明的东北满族人文特征和民间艺术特色，造型简洁、纹样古朴，保存了丰富的满族风俗及地方民俗文化信息。创作延展：以纸张、光影与空间转化探索数字影像表达。',
    keywords: ['辽宁', '锦州', '医巫闾山', '满族', '剪纸'], typicalMaterials: ['红纸', '剪刀'], typicalActions: ['剪', '展开', '观看', '记录'],
    ai: {
      visualStrength: 96, motionStrength: 84, storyStrength: 92, generationStability: 91, culturalRisk: 32,
      visualMechanisms: ['剪纸纹样由二维逐渐进入真实空间', '红纸展开形成医巫闾山意象', '剪纸人物由静态逐渐产生轻微动作', '纸张纹样与现实人物进行匹配转场', '镂空区域成为进入另一空间的窗口'],
      suitableStories: ['年轻人第一次认识家乡非遗', '一张剪纸连接传统与当代生活', '从观看者逐渐成为记录者', '传统图形进入数字影像世界'],
      suitableStyles: ['写实电影', '剪纸与现实融合', '东方诗意', '纪录片混合视觉'],
      goodShots: ['剪刀与红纸微距', '镂空纹样透光', '剪纸在窗前轻微摆动', '二维剪纸与真实山林匹配转场', '人物与剪纸影子叠化'],
      hardShots: ['长时间精确剪纸手部动作', '非常复杂的连续纹样生成', '大量精细镂空结构连续变形'],
      cautions: ['不随意混用其他地区剪纸代表性纹样', '不凭空解释具体纹样的宗教或民俗含义', '不把满族文化简单猎奇化、神秘化', '无法确认的文化事实必须使用保守表达'],
    },
  },
  {
    slug: 'paper-cutting',
    name: '剪纸',
    officialCategory: '传统美术',
    level: 'creative-group',
    summary: '以纸张、镂空、正负形和强轮廓为核心视觉语言，特别适合做平面到空间、静态到活化的 AI 视觉转化。',
    keywords: ['纸张', '镂空', '纹样', '正负形', '民俗图案'],
    typicalMaterials: ['纸张', '剪刀', '刻刀'],
    typicalActions: ['折', '剪', '刻', '展开', '张贴'],
    ai: {
      visualStrength: 96,
      motionStrength: 84,
      storyStrength: 92,
      generationStability: 91,
      culturalRisk: 32,
      visualMechanisms: ['二维剪纸活化', '平面转三维空间', '纹样扩散成场景', '人物从剪纸进入现实'],
      suitableStories: ['成长与记忆', '家庭传承', '进入剪纸世界', '传统纹样与现代生活'],
      suitableStyles: ['国风动画', '写实电影+剪纸混合', '东方幻想'],
      goodShots: ['剪纸展开', '纸屑飞散', '纹样逐渐生长', '人物剪影运动', '窗花与现实空间叠化'],
      hardShots: ['长时间精确剪纸手部动作', '极复杂连续纹样保持完全一致'],
      cautions: ['具体地域项目应使用对应纹样资料，不要把不同地区代表性图案随意混用'],
    },
  },
  {
    slug: 'shadow-puppetry',
    name: '皮影',
    officialCategory: '传统戏剧',
    level: 'creative-group',
    summary: '依靠光、影、幕布与角色表演建立叙事，本身就接近电影语言，非常适合 AI 短片和视觉转场。',
    keywords: ['幕布', '灯光', '剪影', '操偶', '戏剧'],
    typicalMaterials: ['皮影偶', '幕布', '灯具', '操纵杆'],
    typicalActions: ['操偶', '转身', '打斗', '登场', '退场'],
    ai: {
      visualStrength: 95,
      motionStrength: 93,
      storyStrength: 95,
      generationStability: 86,
      culturalRisk: 40,
      visualMechanisms: ['影子进入现实', '幕布变成真实世界', '角色从皮影变真人', '光影匹配转场'],
      suitableStories: ['戏里戏外', '人物寻找自我', '祖孙传承', '传统角色进入现代社会'],
      suitableStyles: ['东方幻想', '写实电影', '剪影动画'],
      goodShots: ['灯亮幕起', '影偶轮廓运动', '幕布转真实空间', '强背光人物'],
      hardShots: ['复杂多人操偶手部细节', '高频打斗中的角色结构稳定'],
      cautions: ['不同地区皮影造型、唱腔与表演方式有差异，具体项目需要查资料'],
    },
  },
  {
    slug: 'jade-carving',
    name: '玉雕',
    officialCategory: '传统美术',
    level: 'creative-group',
    summary: '玉石材质、半透明光感、雕刻纹理和“原石到成器”的变化过程，适合做东方电影美学和材质叙事。',
    keywords: ['玉石', '雕刻', '抛光', '半透明', '纹理'],
    typicalMaterials: ['玉料', '雕刻工具', '水', '磨料'],
    typicalActions: ['选料', '设计', '琢磨', '雕刻', '抛光'],
    ai: {
      visualStrength: 94,
      motionStrength: 72,
      storyStrength: 88,
      generationStability: 88,
      culturalRisk: 34,
      visualMechanisms: ['原石内部出现世界', '雕刻纹理生长', '玉石透光显现记忆', '原石到成器的时间变化'],
      suitableStories: ['师徒关系', '成长与耐心', '器物记忆', '寻找隐藏在材料里的形'],
      suitableStyles: ['写实电影', '东方幻想', '诗意纪录片'],
      goodShots: ['玉石微距', '逆光透玉', '粉尘与水珠', '抛光前后变化'],
      hardShots: ['长时间连续精确雕刻', '工具与手部接触的机械准确性'],
      cautions: ['具体玉种、产地与工艺流程不要凭空编造'],
    },
  },
  {
    slug: 'woodblock-new-year-painting',
    name: '木版年画',
    officialCategory: '传统美术',
    level: 'creative-group',
    summary: '线稿、套色、版印与年俗人物具有极强视觉辨识度，适合做“画中人物活起来”和传统年俗叙事。',
    keywords: ['木版', '套色', '门神', '年俗', '印刷'],
    typicalMaterials: ['木版', '颜料', '纸张', '刷子'],
    typicalActions: ['刻版', '上墨', '覆纸', '拓印', '套色'],
    ai: {
      visualStrength: 95,
      motionStrength: 78,
      storyStrength: 91,
      generationStability: 90,
      culturalRisk: 38,
      visualMechanisms: ['印版线稿变彩色', '年画人物走出画面', '重复套色形成时间节奏'],
      suitableStories: ['年俗记忆', '回家', '画中人物守护现实', '传统图像遇到现代家庭'],
      suitableStyles: ['国风动画', '写实+版画混合', '东方幻想'],
      goodShots: ['滚墨', '揭纸', '颜色逐层出现', '年画人物活化'],
      hardShots: ['复杂套色完全准确对版'],
      cautions: ['具体流派的造型、色彩与题材体系需要按项目资料区分'],
    },
  },
  {
    slug: 'embroidery',
    name: '刺绣',
    officialCategory: '传统美术',
    level: 'creative-group',
    summary: '针线、纹样、丝线反光与细密材质适合微距影像，也适合把线条转化成空间和角色运动。',
    keywords: ['丝线', '针法', '纹样', '织物', '光泽'],
    typicalMaterials: ['绣线', '绣布', '绣架', '绣针'],
    typicalActions: ['穿针', '引线', '刺绣', '收线', '翻面'],
    ai: {
      visualStrength: 91,
      motionStrength: 70,
      storyStrength: 90,
      generationStability: 84,
      culturalRisk: 42,
      visualMechanisms: ['丝线变道路', '纹样从布面长出', '绣面变真实山水'],
      suitableStories: ['母女/祖孙记忆', '时间与耐心', '一针一线连接过去和现在'],
      suitableStyles: ['写实电影', '国风动画', '诗意东方'],
      goodShots: ['丝线微距', '针穿过布面', '纹样逐渐形成', '织物随风'],
      hardShots: ['复杂针法的连续准确动作', '手指与针线高精度交互'],
      cautions: ['不同绣种针法和纹样体系差异明显，具体项目必须基于资料'],
    },
  },
  {
    slug: 'pottery',
    name: '陶艺',
    officialCategory: '传统技艺',
    level: 'creative-group',
    summary: '泥土、旋转、塑形、火与窑变构成完整的视觉变化链，适合短片结构和过程型叙事。',
    keywords: ['泥土', '拉坯', '窑火', '釉色', '器物'],
    typicalMaterials: ['陶泥', '水', '釉料', '窑'],
    typicalActions: ['揉泥', '拉坯', '修坯', '施釉', '烧制'],
    ai: {
      visualStrength: 90,
      motionStrength: 88,
      storyStrength: 86,
      generationStability: 87,
      culturalRisk: 28,
      visualMechanisms: ['泥土快速塑形', '窑火变场景', '器物裂纹承载记忆', '釉色流动'],
      suitableStories: ['失败与重来', '人与材料的关系', '器物的一生', '青年学徒成长'],
      suitableStyles: ['纪录片', '写实电影', '东方诗意'],
      goodShots: ['拉坯旋转', '手掌塑形', '火焰', '窑变', '器物出窑'],
      hardShots: ['手部与旋转泥坯长时间保持精确接触'],
      cautions: ['具体烧制方式、窑型和釉料需要按项目核验'],
    },
  },
  {
    slug: 'stilts',
    name: '高跷',
    officialCategory: '传统体育、游艺与杂技',
    level: 'creative-group',
    summary: '群像、节奏、服装和高难动作带来强动态表现，非常适合节庆、大场面和青年群像叙事。',
    keywords: ['高跷', '群像', '节庆', '表演', '鼓点'],
    typicalMaterials: ['高跷道具', '表演服装', '锣鼓'],
    typicalActions: ['行进', '跳跃', '转身', '列队', '表演'],
    ai: {
      visualStrength: 90,
      motionStrength: 96,
      storyStrength: 84,
      generationStability: 68,
      culturalRisk: 39,
      visualMechanisms: ['人群节奏化移动', '高低视角反差', '传统队伍穿过现代城市'],
      suitableStories: ['青年回乡', '群像成长', '节庆中的身份认同', '传统表演与现代街头'],
      suitableStyles: ['写实电影', '纪录片', '热血短片'],
      goodShots: ['低机位行进', '群体剪影', '鼓点卡点', '广角节庆场面'],
      hardShots: ['多人复杂腿部动作', '高跷道具与脚部结构稳定', '长镜头高难动作'],
      cautions: ['优先短动作、切镜头，不要用一个长镜头要求复杂高难动作'],
    },
  },
  {
    slug: 'yangge',
    name: '秧歌',
    officialCategory: '传统舞蹈',
    level: 'creative-group',
    summary: '队形、舞步、色彩、锣鼓和节奏感突出，适合群体表演与地域生活场景。',
    keywords: ['舞蹈', '队形', '锣鼓', '节庆', '群像'],
    typicalMaterials: ['服装', '扇子', '手绢', '锣鼓'],
    typicalActions: ['扭', '走阵', '挥扇', '转身', '互动'],
    ai: {
      visualStrength: 88,
      motionStrength: 94,
      storyStrength: 82,
      generationStability: 70,
      culturalRisk: 38,
      visualMechanisms: ['队形变化', '彩色服饰形成图案', '传统舞步与现代空间碰撞'],
      suitableStories: ['回乡', '社区群像', '代际关系', '节日一天'],
      suitableStyles: ['纪录片', '写实电影', '热闹民俗短片'],
      goodShots: ['广场群舞', '低机位脚步', '扇子/手绢运动', '俯拍队形'],
      hardShots: ['大量人物同步复杂舞步', '长时间保持每个人物一致'],
      cautions: ['复杂群舞建议拆成短镜头，具体舞种动作不要混用'],
    },
  },
  {
    slug: 'dragon-lion-dance',
    name: '舞龙舞狮',
    officialCategory: '传统体育、游艺与杂技',
    level: 'creative-group',
    summary: '龙狮造型、群体协作和节奏动作有很强的视觉冲击，适合开场、高潮和大型节庆镜头。',
    keywords: ['龙', '狮', '鼓点', '群体协作', '节庆'],
    typicalMaterials: ['龙具', '狮具', '锣鼓', '服装'],
    typicalActions: ['腾跃', '盘旋', '穿行', '点睛', '追逐'],
    ai: {
      visualStrength: 96,
      motionStrength: 97,
      storyStrength: 80,
      generationStability: 65,
      culturalRisk: 36,
      visualMechanisms: ['龙形穿越空间', '鼓点驱动画面', '传统队伍与城市夜景结合'],
      suitableStories: ['团队成长', '节庆回归', '少年第一次上场', '传统与城市'],
      suitableStyles: ['写实电影', '热血东方', '东方幻想'],
      goodShots: ['龙头特写', '低机位穿行', '夜景灯光', '鼓点卡点'],
      hardShots: ['长龙身体连续结构', '大量操作者同步复杂动作'],
      cautions: ['AI 容易让龙身断裂或操作者数量异常，镜头设计需短、明确'],
    },
  },
  {
    slug: 'opera',
    name: '戏曲',
    officialCategory: '传统戏剧',
    level: 'creative-group',
    summary: '脸谱、服饰、舞台、身段、唱念做打与强仪式感，适合人物故事和舞台/现实双空间。',
    keywords: ['舞台', '脸谱', '服饰', '身段', '唱腔'],
    typicalMaterials: ['戏服', '头面', '道具', '舞台装置'],
    typicalActions: ['亮相', '水袖', '圆场', '念白', '武打'],
    ai: {
      visualStrength: 95,
      motionStrength: 88,
      storyStrength: 97,
      generationStability: 74,
      culturalRisk: 56,
      visualMechanisms: ['舞台变现实', '妆容转换身份', '戏中角色与现实人物对话'],
      suitableStories: ['台前幕后', '少年学戏', '身份与角色', '一场最后/第一次演出'],
      suitableStyles: ['写实电影', '舞台电影', '东方幻想'],
      goodShots: ['化妆镜前', '开幕', '水袖慢动作', '舞台逆光'],
      hardShots: ['严格准确的专业身段', '长段武打', '复杂头面结构稳定'],
      cautions: ['具体剧种的服装、脸谱、音乐、身段不可随意混搭'],
    },
  },
  {
    slug: 'lantern-craft',
    name: '灯彩 / 花灯',
    officialCategory: '传统美术',
    level: 'creative-group',
    summary: '灯体结构、纸张/纱材质与夜间光效非常适合 AI 影像，尤其适合夜景、节庆和幻想场景。',
    keywords: ['灯笼', '骨架', '灯光', '夜景', '节庆'],
    typicalMaterials: ['竹木骨架', '纸或纱', '彩绘材料', '灯具'],
    typicalActions: ['扎骨架', '裱糊', '彩绘', '点灯', '悬挂'],
    ai: {
      visualStrength: 94,
      motionStrength: 81,
      storyStrength: 84,
      generationStability: 89,
      culturalRisk: 30,
      visualMechanisms: ['点灯唤醒空间', '灯火漂浮', '灯中出现记忆/世界'],
      suitableStories: ['夜游', '等待与团聚', '一盏灯的旅程', '传统灯会与年轻人'],
      suitableStyles: ['东方幻想', '写实电影', '国风动画'],
      goodShots: ['点灯瞬间', '夜景灯海', '纸灯微距', '灯影随风'],
      hardShots: ['复杂骨架制作的连续手部细节'],
      cautions: ['具体灯彩项目的造型传统需要按地域资料核验'],
    },
  },
  {
    slug: 'traditional-instrument',
    name: '传统乐器制作与演奏',
    officialCategory: '传统技艺',
    level: 'creative-group',
    summary: '声音、材料、手工制作和演奏可以形成“声音驱动画面”的独特叙事，但需要避免把不同乐器工艺混为一谈。',
    keywords: ['乐器', '木材', '弦', '音色', '演奏'],
    typicalMaterials: ['木材', '弦', '漆', '金属或竹材'],
    typicalActions: ['选材', '制作', '调音', '演奏'],
    ai: {
      visualStrength: 82,
      motionStrength: 82,
      storyStrength: 92,
      generationStability: 76,
      culturalRisk: 47,
      visualMechanisms: ['声音变可视化纹理', '音符连接过去和现在', '演奏触发记忆'],
      suitableStories: ['声音记忆', '师徒', '寻找失去的声音', '传统音乐与现代编曲'],
      suitableStyles: ['纪录片', '写实电影', '诗意实验影像'],
      goodShots: ['乐器材质微距', '调音', '手指演奏特写', '声音可视化'],
      hardShots: ['复杂指法长期准确', '乐器结构细节持续一致'],
      cautions: ['具体乐器构造、演奏方法和工艺必须按项目资料核验'],
    },
  },
];

export const OFFICIAL_CATEGORIES = [
  '民间文学',
  '传统音乐',
  '传统舞蹈',
  '传统戏剧',
  '曲艺',
  '传统体育、游艺与杂技',
  '传统美术',
  '传统技艺',
  '传统医药',
  '民俗',
] as const;

export function getHeritageBySlug(slug?: string | null): HeritageEntry | null {
  if (!slug) return null;
  return HERITAGE_CATALOG.find(item => item.slug === slug) ?? null;
}

export function searchHeritage(query: string): HeritageEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return HERITAGE_CATALOG;
  return HERITAGE_CATALOG.filter(item => {
    const haystack = [
      item.name,
      item.officialCategory,
      item.summary,
      ...item.keywords,
      ...item.typicalActions,
    ].join(' ').toLowerCase();
    return haystack.includes(q);
  });
}

export function getHeritageSuggestions(limit = 8): HeritageEntry[] {
  return [...HERITAGE_CATALOG]
    .sort((a, b) => {
      const aScore =
        a.ai.visualStrength +
        a.ai.motionStrength +
        a.ai.storyStrength +
        a.ai.generationStability -
        a.ai.culturalRisk * 0.35;
      const bScore =
        b.ai.visualStrength +
        b.ai.motionStrength +
        b.ai.storyStrength +
        b.ai.generationStability -
        b.ai.culturalRisk * 0.35;
      return bScore - aScore;
    })
    .slice(0, limit);
}
