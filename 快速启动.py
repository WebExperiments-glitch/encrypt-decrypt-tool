#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
加密解密工具 - 快速启动脚本
用于启动本地HTTP服务器
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from threading import Timer

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def open_browser():
    """在浏览器中打开页面"""
    url = f'http://localhost:{PORT}'
    print(f'正在打开浏览器: {url}')
    webbrowser.open(url)

def main():
    print('=' * 50)
    print('🔐 加密解密工具 - 快速启动')
    print('=' * 50)
    print(f'工作目录: {DIRECTORY}')
    print(f'端口: {PORT}')
    print()
    
    try:
        with socketserver.TCPServer(('', PORT), MyHTTPRequestHandler) as httpd:
            print(f'🚀 服务器已启动!')
            print(f'📍 访问地址: http://localhost:{PORT}')
            print()
            print('按 Ctrl+C 停止服务器')
            print('=' * 50)
            print()
            
            Timer(1.5, open_browser).start()
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print()
        print('👋 服务器已停止')
    except OSError as e:
        if e.errno == 48 or e.errno == 10048:
            print(f'❌ 端口 {PORT} 已被占用!')
            print('请尝试:')
            print('  1. 关闭占用该端口的程序')
            print('  2. 或修改脚本中的 PORT 值')
        else:
            print(f'❌ 启动失败: {e}')
        sys.exit(1)

if __name__ == '__main__':
    main()
