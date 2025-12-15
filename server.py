#!/usr/bin/env python3
"""
Simple HTTP Server that properly serves index.html for directory requests
"""
import http.server
import socketserver
import os
import json
import sys
from pathlib import Path

# Add blog folder to path so we can import bloglist
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'blog'))
from bloglist import get_blog_posts_json

# Add concepts folder to path so we can import conceptlist
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'concepts'))
from conceptlist import get_concepts_json

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add headers to prevent caching during development
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        # Handle API endpoints
        if self.path == '/api/blog-index':
            try:
                blog_data = get_blog_posts_json()
                response = json.dumps(blog_data).encode('utf-8')
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Content-Length', str(len(response)))
                self.end_headers()
                self.wfile.write(response)
                return
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
                return
        
        if self.path == '/api/concepts-index':
            try:
                concepts_data = get_concepts_json()
                response = json.dumps(concepts_data).encode('utf-8')
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Content-Length', str(len(response)))
                self.end_headers()
                self.wfile.write(response)
                return
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
                return
        
        # Original file serving logic
        # If the path ends with /, serve index.html
        if self.path.endswith('/'):
            # Try to serve index.html
            self.path = self.path + 'index.html'
        
        # If path doesn't have an extension, try .html
        if '.' not in os.path.basename(self.path) and not self.path.endswith('/'):
            # First try the exact file
            if not os.path.exists(os.path.join(os.getcwd(), self.path.lstrip('/'))):
                # Try with .html extension
                test_path = self.path + '.html'
                if os.path.exists(os.path.join(os.getcwd(), test_path.lstrip('/'))):
                    self.path = test_path
        
        return super().do_GET()

def run_server():
    # Change to the WebsitePortfolio directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    Handler = MyHTTPRequestHandler
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Server running at http://localhost:{PORT}/")
        print(f"Serving files from: {os.getcwd()}")
        print("Press Ctrl+C to stop the server")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    run_server()
