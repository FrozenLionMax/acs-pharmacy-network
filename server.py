"""
ACS (All Chemists & Stores Registry) - Local Development Server
Launches a lightweight HTTP server on port 8000 and serves the web application.
Supports clean SPA routing for /pharmacy/<slug> (e.g. /pharmacy/anand-chemist).
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from urllib.parse import urlparse

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # Serve static assets from root regardless of nested subpath
        filename = os.path.basename(path)
        if any(path.endswith(ext) for ext in [".css", ".js", ".png", ".jpg", ".jpeg", ".svg", ".ico", ".json", ".map", ".woff", ".woff2", ".txt", ".xml"]):
            self.path = f"/{filename}"
            return super().do_GET()

        # SPA URL Rewrite: Route /pharmacy/<slug> and /pharmacy/<slug>/audit directly to index.html
        if path.startswith("/pharmacy/") or path == "/pharmacy":
            self.path = "/index.html"

        return super().do_GET()

def main():
    os.chdir(DIRECTORY)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}/pharmacy/anand-chemist"
        print("=" * 68)
        print("   ACS - ALL CHEMISTS & STORES CENTRAL PORTAL (UP)")
        print("=" * 68)
        print(f"Portal running at: http://localhost:{PORT}/index.html")
        print(f"Live Hosted Pharmacy URL: {url}")
        print("Press Ctrl+C at any time to stop the server.")
        print("=" * 68)

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server gracefully...")
            httpd.server_close()
            sys.exit(0)

if __name__ == "__main__":
    main()
