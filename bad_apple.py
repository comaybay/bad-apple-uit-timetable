from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer
import os


server = TCPServer(("", 9999), SimpleHTTPRequestHandler)

# start chrome without cors
os.system('start chrome daa.uit.edu.vn --disable-web-security --user-data-dir=./chromeTemp')

server.serve_forever()
