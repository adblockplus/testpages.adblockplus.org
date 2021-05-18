import re


# Note: It should return same id as heading.py
def get_id(title):
    return re.sub('[^a-z0-9]+', '-', title.lower()).strip('-')
