# -*- coding: utf-8 -*-
# 匿名清理：移除交付相关源码中的禁用词残留
def patch(path, pairs):
    with open(path, 'r', encoding='utf-8') as f:
        c = f.read()
    for old, new in pairs:
        c = c.replace(old, new)
    with open(path, 'w', encoding='utf-8', newline='') as f:
        f.write(c)
    print('patched:', path)

patch(r'C:\项目\非遗导演台\src\pages\Director.tsx', [
    ('非遗影像工坊 2.0', '辽韵 AI 导演台'),
    ('非遗影像工坊.md', '辽韵AI导演台.md'),
    ("app: '非遗影像工坊'", "app: '辽韵 AI 导演台'"),
    ("exportedBy: '阿岩'", "exportedBy: '创作者'"),
    ('非遗影像工坊.json', '辽韵AI导演台.json'),
])
patch(r'C:\项目\非遗导演台\src\pages\MyProjects.tsx', [
    ('非遗影像工坊项目备份', '辽韵AI导演台项目备份'),
])
patch(r'C:\项目\非遗导演台\src\pages\TechRoadmap.tsx', [
    ('豆包大模型', '大模型 API'),
])
print('done')
