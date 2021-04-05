from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer
import os

# start chrome without cors
os.system('start chrome daa.uit.edu.vn --disable-web-security --user-data-dir=./chromeTemp')

server = TCPServer(("", 9999), SimpleHTTPRequestHandler)
server.serve_forever()
