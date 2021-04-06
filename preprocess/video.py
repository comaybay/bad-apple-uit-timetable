import cv2
import os
import json


def process(video_path, out_path, resize_scale):
    vidcap = cv2.VideoCapture(video_path)
    success, frame = vidcap.read()
    frame_matrices = []

    print(f"convert video from {video_path} to json coordinate array...")
    print("processing video...")
    # while success:
    for i in range(1000):
        resized_frame = cv2.resize(frame, None, fx=resize_scale, fy=resize_scale)
        matrix = process_frame(resized_frame)
        frame_matrices.append(matrix)
        success, frame = vidcap.read()

    print("video processed.")
    print("writting to file...")
    with open(out_path, "w") as fp:
        json.dump(frame_matrices, fp)

    print("writting complete.")
    print()


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
