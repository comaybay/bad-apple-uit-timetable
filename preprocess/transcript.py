
import re
import json

TIMECODE_REGEX = '\d{2}:\d{2}:\d{2},\d{3}'
TIMECODE_RANGE_REGEX = f'{TIMECODE_REGEX} --> {TIMECODE_REGEX}'
CAPTION_REGEX = f'(?<={TIMECODE_RANGE_REGEX}\n)[\s\S]*?(?=\n\n\d|\n$)'


def process(srt_file_path, out_path):
    caption_frames = []

    print(f"convert transcript from {srt_file_path} to json format...")
    print("processing transcripts...")

    with open(srt_file_path, 'r', encoding='utf8') as fp:
        content = fp.read()
        # matches timecode
        t_ranges = re.findall(TIMECODE_RANGE_REGEX, content)
        # matches text below timecode and above the next subtitle number
        captions = re.findall(CAPTION_REGEX, content)

        for i in range(len(t_ranges)):
            t_from, t_to = parse_timecode_range(t_ranges[i])
            caption_frame = {
                'from': t_from,
                'to': t_to,
                'caption': captions[i],
            }
            caption_frames.append(caption_frame)

    print("transcripts processed.")
    print("writting to file...")

    with open(out_path, 'w', encoding='utf8') as fp:
        json.dump(caption_frames, fp)

    print("writting complete.")
    print()


def parse_timecode_range(input):
    rawFrom, rawTo = re.findall(TIMECODE_REGEX, input)
    t_from = parse_timecode(rawFrom)
    t_to = parse_timecode(rawTo)
    return (t_from, t_to)


# example: 00:01:11,262 -> 71.262
def parse_timecode(input):
    hour, minute, second = re.findall('\d{2}(?:,\d{3})?', input)
    return int(hour) * 3600 + int(minute) * 60 + int(second.replace(',', '')) / 1000
