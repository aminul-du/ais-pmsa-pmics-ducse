#!/usr/bin/env python3
import http.server
import json
import socketserver
import sys
import urllib.error
import urllib.request

LISTEN_PORT = int(sys.argv[1])
UI_TARGET = sys.argv[2]
API_TARGET = sys.argv[3]
WEB_BASE = "http://127.0.0.1:3020"


class GatewayHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        self.proxy("GET")

    def do_POST(self):
        self.proxy("POST")

    def proxy(self, method):
        path = self.path
        if path == "/" or path == "":
            upstream = UI_TARGET
        elif path.startswith("/_next/") or path.startswith("/api/"):
            upstream = f"{WEB_BASE}{path}"
        else:
            upstream = f"{API_TARGET}{path}"

        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length) if length > 0 else None
        req = urllib.request.Request(upstream, data=body, method=method)
        for k, v in self.headers.items():
            if k.lower() not in ("host", "connection", "accept-encoding"):
                req.add_header(k, v)

        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = resp.read()
                self.send_response(resp.status)
                for k, v in resp.getheaders():
                    if k.lower() not in ("transfer-encoding", "connection"):
                        self.send_header(k, v)
                self.end_headers()
                self.wfile.write(data)
        except urllib.error.HTTPError as e:
            data = e.read()
            self.send_response(e.code)
            self.end_headers()
            self.wfile.write(data)
        except Exception as exc:
            payload = json.dumps({
                "status": "NOT CONNECTED",
                "gatewayPort": LISTEN_PORT,
                "upstream": upstream,
                "detail": str(exc),
            }).encode("utf-8")
            self.send_response(502)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(payload)

    def log_message(self, format, *args):
        return


class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True


if __name__ == "__main__":
    with ThreadedTCPServer(("127.0.0.1", LISTEN_PORT), GatewayHandler) as httpd:
        httpd.serve_forever()
