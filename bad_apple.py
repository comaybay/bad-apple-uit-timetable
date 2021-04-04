import http.server
import socketserver
import os


class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/script":
            self.path = 'script.js'

        elif self.path == "/data":
            self.path = 'data.json'

        return http.server.SimpleHTTPRequestHandler.do_GET(self)


# start chrome without cors
os.system('start chrome daa.uit.edu.vn --disable-web-security --disable-gpu --user-data-dir=~/chromeTemp')

socketserver.TCPServer(("", 9999), MyHttpRequestHandler).serve_forever()
