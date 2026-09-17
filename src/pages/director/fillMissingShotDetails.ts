// ===== 前端镜头细节补齐（V2.2.0 新增，与后端 fillMissingShotDetails 保持一致）=====
export function fillMissingShotDetailsClient(shot: any, index: number, totalShots: number): void {
  if (!shot.composition) {
    const map: Record<string, string> = { '特写': '中心构图', '近景': '中心构图', '中景': '三分法', '中近景': '三分法', '全景': '层次构图', '远景': '引导线构图', '大远景': '黄金分割' };
    shot.composition = map[shot.shotSize] || '三分法';
  }
  if (!shot.lighting) {
    const d = String(shot.description || '');
    if (/黄昏|夕阳|暖光|温暖/.test(d)) shot.lighting = '暖光';
    else if (/逆光|剪影|轮廓/.test(d)) shot.lighting = '逆光';
    else if (/室内|工坊|屋内/.test(d)) shot.lighting = '柔光';
    else if (/室外|户外|自然/.test(d)) shot.lighting = '自然光';
    else if (/冷|蓝|夜/.test(d)) shot.lighting = '冷光';
    else shot.lighting = '柔光';
  }
  if (!shot.cameraAngle) {
    const map: Record<string, string> = { '固定': '平视', '推': '平视', '拉': '平视', '摇': '平视', '移': '平视', '跟': '平视', '升': '仰视', '降': '俯视', '航拍': '鸟瞰', '环绕': '低角度' };
    shot.cameraAngle = map[shot.camera] || '平视';
  }
  if (!shot.depthOfField) {
    const map: Record<string, string> = { '特写': '浅景深', '近景': '浅景深', '中景': '浅景深', '中近景': '浅景深', '全景': '深景深', '远景': '深景深', '大远景': '全景深' };
    shot.depthOfField = map[shot.shotSize] || '浅景深';
  }
  if (!shot.speed) {
    const d = String(shot.description || '');
    if (/慢|缓|凝/.test(d)) shot.speed = '慢动作';
    else if (/快|疾|飞/.test(d)) shot.speed = '快动作';
    else if (/定格|静止/.test(d)) shot.speed = '定格';
    else shot.speed = '正常速度';
  }
  if (!shot.mood) {
    const d = String(shot.description || '');
    if (/庄|肃|敬/.test(d)) shot.mood = '庄重';
    else if (/温|暖|柔/.test(d)) shot.mood = '温馨';
    else if (/紧|急|险/.test(d)) shot.mood = '紧张';
    else if (/神|秘|幽/.test(d)) shot.mood = '神秘';
    else if (/宁|静|安/.test(d)) shot.mood = '宁静';
    else if (/怀|旧|忆/.test(d)) shot.mood = '怀旧';
    else if (index >= totalShots - 2) shot.mood = '期待';
    else shot.mood = '庄重';
  }
  if (!shot.transition) {
    shot.transition = (index === totalShots - 1) ? '淡入淡出' : '硬切';
  }
}
