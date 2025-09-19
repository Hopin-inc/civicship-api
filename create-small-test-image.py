from PIL import Image
import os

img = Image.new('RGB', (100, 100), color='blue')
img.save('/tmp/small-test.png')

file_size = os.path.getsize('/tmp/small-test.png')
print(f'Created small test image: {file_size} bytes')
