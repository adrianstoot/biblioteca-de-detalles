import http.server
import socketserver
import os
import json
import base64
import urllib.parse
import threading
import time
import subprocess

PORT = 8088
DIRECTORY = "."
THUMBNAILS_DIR = "public/thumbnails"
os.makedirs(THUMBNAILS_DIR, exist_ok=True)

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path.startswith("/save"):
            query = urllib.parse.urlparse(self.path).query
            params = urllib.parse.parse_qs(query)
            model_id = params.get("id", ["unknown"])[0]
            
            content_len = int(self.headers.get('Content-Length', 0))
            post_body = self.rfile.read(content_len).decode('utf-8')
            
            # Extract base64
            if "data:image/png;base64," in post_body:
                data = post_body.split("data:image/png;base64,")[1]
                img_bytes = base64.b64decode(data)
                
                out_path = os.path.join(THUMBNAILS_DIR, f"{model_id}.png")
                with open(out_path, "wb") as f:
                    f.write(img_bytes)
                print(f"Saved thumbnail: {out_path} ({len(img_bytes)} bytes)")
                
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"OK")
        else:
            self.send_response(404)
            self.end_headers()

def run_server():
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Thumbnail server running on port {PORT}")
        httpd.serve_forever()

if __name__ == "__main__":
    t = threading.Thread(target=run_server, daemon=True)
    t.start()
    
    # Wait for server
    time.sleep(1)
    
    # Launch Edge/Chrome to load render_thumbnails.html
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    browser = chrome_path if os.path.exists(chrome_path) else edge_path
    
    url = f"http://localhost:{PORT}/render_thumbnails.html"
    print(f"Opening browser {browser} at {url}...")
    
    proc = subprocess.Popen([browser, "--headless=new", "--disable-gpu", url])
    
    # Wait for completion (max 20 seconds)
    start_time = time.time()
    while time.time() - start_time < 25:
        count = len([f for f in os.listdir(THUMBNAILS_DIR) if f.endswith(".png")])
        if count >= 34:
            print(f"All {count} thumbnails generated successfully!")
            break
        time.sleep(1)
        
    proc.terminate()
    print("Done generating thumbnails!")
