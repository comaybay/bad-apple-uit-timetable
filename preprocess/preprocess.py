from preprocess import video, transcript

import os
import sys

VIDEO_SCALE = 0.1

SCRIPT_PATH = os.path.dirname(os.path.realpath(sys.argv[0]))
VIDEO_PATH = os.path.join(SCRIPT_PATH, 'Bad Apple!!.mp4')
TRANSCRIPT_PATH_JP = os.path.join(SCRIPT_PATH, 'transcript_jp.srt')
TRANSCRIPT_PATH_ROMAJI = os.path.join(SCRIPT_PATH, 'transcript_romaji.srt')
TRANSCRIPT_PATH_EN = os.path.join(SCRIPT_PATH, 'transcript_en.srt')
TRANSCRIPT_PATH_VN = os.path.join(SCRIPT_PATH, 'transcript_vn.srt')

if (not os.path.isfile("frames.json")):
    video.process(VIDEO_PATH, 'frames.json', VIDEO_SCALE)

if (not os.path.isfile("transcript_jp.json")):
    transcript.process(TRANSCRIPT_PATH_JP, 'transcript_jp.json')

if (not os.path.isfile("transcript_romaji.json")):
    transcript.process(TRANSCRIPT_PATH_ROMAJI, 'transcript_romaji.json')

if (not os.path.isfile("transcript_en.json")):
    transcript.process(TRANSCRIPT_PATH_EN, 'transcript_en.json')

if (not os.path.isfile("transcript_vn.json")):
    transcript.process(TRANSCRIPT_PATH_VN, 'transcript_vn.json')

print("preprocess finished.")
