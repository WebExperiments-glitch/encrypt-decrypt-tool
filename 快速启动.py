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

DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def open_browser(port):
    """在浏览器中打开页面"""
    url = f'http://localhost:{port}'
    print(f'正在打开浏览器: {url}')
    webbrowser.open(url)

def find_available_port(start_port=8000, max_attempts=10):
    """自动检测可用端口"""
    for port in range(start_port, start_port + max_attempts):
        try:
            with socketserver.TCPServer(('', port), MyHTTPRequestHandler) as test_server:
                test_server.server_close()
                return port
        except OSError:
            continue
    return None

def main():
    print('=' * 50)
    print('🔐 加密解密工具 - 快速启动')
    print('=' * 50)
    print(f'工作目录: {DIRECTORY}')
    print()
    
    port = find_available_port()
    
    if port is None:
        print('❌ 无法找到可用端口，请检查网络配置')
        sys.exit(1)
    
    if port != 8000:
        print(f'端口 8000 已被占用，自动切换至端口 {port}')
    
    print(f'端口: {port}')
    print()
    
    try:
        with socketserver.TCPServer(('', port), MyHTTPRequestHandler) as httpd:
            print(f'🚀 服务器已启动!')
            print(f'📍 访问地址: http://localhost:{port}')
            print()
            print('按 Ctrl+C 停止服务器')
            print('=' * 50)
            print()
            
            Timer(1.5, open_browser, args=(port,)).start()
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print()
        print('👋 服务器已停止')
    except OSError as e:
        print(f'❌ 启动失败: {e}')
        sys.exit(1)

if __name__ == '__main__':
    main()