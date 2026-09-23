# -*- coding: utf-8 -*-
# 清理剩余旧名残留
def patch(path, pairs):
    with open(path, 'r', encoding='utf-8') as f:
        c = f.read()
    for old, new in pairs:
        c = c.replace(old, new)
    with open(path, 'w', encoding='utf-8', newline='') as f:
        f.write(c)
    print('patched:', path)

patch(r'C:\项目\非遗导演台\src\store\projectStore.ts', [
    ("app: '非遗影像工坊'", "app: '辽韵 AI 导演台'"),
])
patch(r'C:\项目\非遗导演台\src\data\mockGenerator.ts', [
    ('#非遗影像工坊', '#辽韵AI导演台'),
])
patch(r'C:\项目\非遗导演台\src\types\index.ts', [
    ('非遗影像工坊 2.0 类型定义', '辽韵 AI 导演台 类型定义'),
])
print('done')
