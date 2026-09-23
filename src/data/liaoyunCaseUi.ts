export type LiaoyunShot = {
  id: string; title: string; image: string; description: string;
  shotSize: string; composition: string; camera: string; light: string; duration: string;
  tags: string[]; imagePrompt: string; videoPrompt: string;
};

export const LIAOYUN_FACTS = {
  officialName: '剪纸（医巫闾山满族剪纸）',
  category: '传统美术',
  code: 'Ⅶ-16',
  region: '辽宁省锦州市',
  batch: '2006 年 · 第一批',
};

export const LIAOYUN_SHOTS: LiaoyunShot[] = [
  { id:'01', title:'一张红纸', image:'/liaoyun-assets/shot01.jpg', description:'深色桌面上，一张红色剪纸静静铺开。', shotSize:'特写', composition:'中心构图', camera:'固定 · 微距', light:'侧光', duration:'7 秒', tags:['特写','固定','中心构图'], imagePrompt:'俯视特写，一张红色剪纸作品平铺在古朴木桌上，红纸纤维真实，镂空结构清晰，桌面有剪刀和少量纸屑，暖色侧光从窗外洒入，形成柔和树影与层次阴影，中心构图，电影质感，传统文化氛围，真实细节。', videoPrompt:'俯视固定镜头，微距拍摄，一张红色剪纸平铺木桌，手从画面边缘缓慢靠近并轻触纸面，树影在纸面上轻微流动，暖色侧光，7秒，节奏克制，写实电影质感。' },
  { id:'02', title:'纸上的纹样', image:'/liaoyun-assets/shot02.jpg', description:'镜头靠近纸面镂空结构，光从纸后穿过。', shotSize:'特写', composition:'层次构图', camera:'推', light:'逆光', duration:'6 秒', tags:['特写','推','层次构图'], imagePrompt:'剪纸镂空纹样的超近景，红纸与暖金逆光形成强烈正负形，纸纤维与刀口细节清晰，背景暗化，画面克制，不解释具体纹样含义，电影微距摄影。', videoPrompt:'镜头以极慢速度向剪纸纹样推进，逆光从镂空处透出，纸面细节逐渐放大，保持结构稳定，6秒，安静、克制、电影感。' },
  { id:'03', title:'剪刀落下', image:'/liaoyun-assets/shot03.jpg', description:'剪刀沿红纸边缘移动，一片纸屑落到桌面。', shotSize:'特写', composition:'对角线构图', camera:'固定', light:'暖侧光', duration:'5 秒', tags:['特写','固定','对角线构图'], imagePrompt:'双手与剪刀的特写，剪刀沿红纸边缘缓慢剪切，纸屑落在深色木桌，暖侧光照亮手指与纸面，动作简洁，背景虚化，真实手工质感。', videoPrompt:'固定特写，剪刀完成一次短促剪切动作，一小片纸屑自然落下，手部动作简单稳定，暖侧光，5秒，不做复杂连续剪纸。' },
  { id:'04', title:'纸里的山', image:'/liaoyun-assets/shot04.jpg', description:'剪纸镂空与远处山林轮廓形成匹配转场。', shotSize:'远景', composition:'框架构图', camera:'固定', light:'晨昏光', duration:'6 秒', tags:['远景','固定','框架构图'], imagePrompt:'以红色剪纸镂空作为前景框架，远处山林与天空从镂空中显现，山形与纸面轮廓形成视觉呼应，晨昏暖光，东方诗意，避免具体历史建筑复原。', videoPrompt:'固定镜头，前景红纸轻微移动，镂空轮廓逐渐与远处山林对齐，完成一次克制的匹配转场，6秒，真实山林与纸面结构自然融合。' },
  { id:'05', title:'旧图形，新观看', image:'/liaoyun-assets/shot05.jpg', description:'年轻人在窗边举起剪纸，纸影落在墙面与人物附近。', shotSize:'中近景', composition:'三分法', camera:'移', light:'窗光', duration:'7 秒', tags:['中近景','移','三分法'], imagePrompt:'年轻创作者站在窗边举起红色剪纸，自然窗光穿过镂空形成纸影，人物与传统图形处于同一画面，现代服饰，安静观察，写实电影风格。', videoPrompt:'中近景轻微横移，年轻人缓慢举起剪纸对向窗光，纸影逐渐落到墙面与脸侧，动作简单，7秒，克制纪录片质感。' },
  { id:'06', title:'让纸活起来', image:'/liaoyun-assets/shot06.jpg', description:'纸面原创人物轮廓被点状地轻动，与现实窗外山影叠化。', shotSize:'近景', composition:'中心构图', camera:'固定', light:'柔光', duration:'6 秒', tags:['近景','固定','中心构图'], imagePrompt:'红色剪纸纹样近景，少量纸面线条像呼吸一样产生轻微位移，与窗外山影叠化，保持纸张结构真实，不怪物化、不玄幻化，东方诗意数字艺术。', videoPrompt:'固定近景，只有少量线条缓慢延伸与轻微位移，纸面结构始终稳定，与窗外山影完成一次柔和叠化，6秒，克制数字化效果。' },
  { id:'07', title:'重新记录', image:'/liaoyun-assets/shot07.jpg', description:'镜头拉远，年轻人走向山间，手中拿着剪纸作品。', shotSize:'远景', composition:'跟随构图', camera:'移', light:'落日光', duration:'7 秒', tags:['远景','移','跟随构图'], imagePrompt:'落日山林远景，一名当代年轻人背影向前行走，手里拿着红色剪纸作品，传统与当下在同一画面中交汇，真实山林，现代服饰，电影质感。', videoPrompt:'远景缓慢跟随年轻人向前走，手中的剪纸随步伐轻微晃动，落日山林保持稳定，7秒，节奏舒缓，作为段落收束。' },
  { id:'08', title:'一剪见闾山', image:'/liaoyun-assets/shot08.jpg', description:'红色剪纸悬在窗前，镂空中可见山林与天空，青年站在远处归于平静。', shotSize:'全景', composition:'框架构图', camera:'拉', light:'黄昏光', duration:'9 秒', tags:['全景','拉','框架构图'], imagePrompt:'红色剪纸悬在窗前作为前景框架，镂空中可见远处山林与天空，一个年轻中国男性背影站在远处窗前，画面平静，黄昏暖光，电影质感，东方诗意。', videoPrompt:'缓慢拉远镜头，红色剪纸轻轻摆动后停住，镂空中的山林与天空逐渐清晰，青年背影安静站立，9秒，画面归于平静，作为结尾。' },
];
