# -*- coding: utf-8 -*-
# 清理 functions/server 中的旧名残留（API 返回值与日志）
import glob

def patch(path, pairs):
    with open(path, 'r', encoding='utf-8') as f:
        c = f.read()
    for old, new in pairs:
        c = c.replace(old, new)
    with open(path, 'w', encoding='utf-8', newline='') as f:
        f.write(c)
    print('patched:', path)

patch(r'C:\项目\非遗导演台\functions\api\health.ts', [
    ("service: '非遗影像工坊 AI 后端 (Pages Functions)'", "service: '辽韵 AI 导演台 AI 后端 (Pages Functions)'"),
])
patch(r'C:\项目\非遗导演台\server\routes\health.ts', [
    ("service: '非遗影像工坊 AI 后端'", "service: '辽韵 AI 导演台 AI 后端'"),
])
patch(r'C:\项目\非遗导演台\server\utils\normalize.ts', [
    ('#非遗影像工坊', '#辽韵AI导演台'),
])
patch(r'C:\项目\非遗导演台\server\index.ts', [
    ('非遗影像工坊 AI 后端入口', '辽韵 AI 导演台 AI 后端入口'),
    ('[非遗影像工坊]', '[辽韵 AI 导演台]'),
])
print('done')
