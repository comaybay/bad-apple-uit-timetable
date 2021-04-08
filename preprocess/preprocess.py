import video
import transcript

from os import path
import sys

VIDEO_SCALE = 0.1

SCRIPT_PATH = path.dirname(path.realpath(sys.argv[0]))
VIDEO_PATH = path.join(SCRIPT_PATH, 'Bad Apple!!.mp4')
TRANSCRIPT_PATH_JP = path.join(SCRIPT_PATH, 'transcript_jp.srt')
TRANSCRIPT_PATH_ROMAJI = path.join(SCRIPT_PATH, 'transcript_romaji.srt')
TRANSCRIPT_PATH_EN = path.join(SCRIPT_PATH, 'transcript_en.srt')
TRANSCRIPT_PATH_VN = path.join(SCRIPT_PATH, 'transcript_vn.srt')

OUT_PATH = path.normpath(path.join(SCRIPT_PATH, ".."))

if (not path.isfile(path.join(OUT_PATH, "frames.json"))):
    video.process(VIDEO_PATH, 'frames.json', VIDEO_SCALE)

if (not path.isfile(path.join(OUT_PATH, "transcript_jp.json"))):
    transcript.process(TRANSCRIPT_PATH_JP, 'transcript_jp.json')

if (not path.isfile(path.join(OUT_PATH, "transcript_romaji.json"))):
    transcript.process(TRANSCRIPT_PATH_ROMAJI, 'transcript_romaji.json')

if (not path.isfile(path.join(OUT_PATH, "transcript_en.json"))):
    transcript.process(TRANSCRIPT_PATH_EN, 'transcript_en.json')

if (not path.isfile(path.join(OUT_PATH, "transcript_vn.json"))):
    transcript.process(TRANSCRIPT_PATH_VN, 'transcript_vn.json')

print("preprocess finished.")
