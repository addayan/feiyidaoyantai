# -*- coding: utf-8 -*-
# 更新部署脚本：去掉旧 TRAE 路径与署名
p = r'C:\项目\非遗导演台\deploy-v2.2.bat'
with open(p, 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('echo   非遗影像工坊 V2.2.0 部署脚本 BY 阿岩', 'echo   辽韵 AI 导演台 部署脚本')
c = c.replace('echo   V2.2.0 部署完成 BY 阿岩', 'echo   部署完成')
c = c.replace('cd /d "C:\\Users\\Administrator\\AppData\\Roaming\\TRAE SOLO CN\\ModularData\\ai-agent\\work-mode-projects\\6a572d3fdf87250939ae844b\\feiyidaoyantai-main"', 'cd /d "%~dp0"')
with open(p, 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(c)
print('patched deploy-v2.2.bat')
