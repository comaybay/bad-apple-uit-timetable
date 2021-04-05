import cv2
import os
import json

VIDEO_SCALE = 0.1


def main():
    vidcap = cv2.VideoCapture('preprocess/Bad Apple!!.mp4')
    success, frame = vidcap.read()
    frame_matrices = []

    print("processing...")
    # while success:
    for i in range(1000):
        resized_frame = cv2.resize(frame, None, fx=VIDEO_SCALE, fy=VIDEO_SCALE)
        matrix = process_frame(resized_frame)
        frame_matrices.append(matrix)
        success, frame = vidcap.read()

    print("writting to file...")
    with open('frames.json', "w") as fp:
        json.dump(frame_matrices, fp)

    print("done.")


def process_frame(frame):
    height, width, _ = frame.shape
    matrix = []
    for y in range(height):
        row = []
        for x in range(width):
            color_val = frame[y, x, 0]  # get B color value
            if (color_val < 90):
                row.append(1)
            else:
                row.append(0)
        matrix.append(row)
    return matrix


main()
