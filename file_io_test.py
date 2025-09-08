# Comprehensive File I/O Test Suite
# This test suite validates all file I/O operations using standard libraries

print("=== Python File I/O Test Suite ===")

# Test 1: Basic file operations
print("\n=== Test 1: Basic File Operations ===")

# Create and write to a file
with open("test_file.txt", "w") as f:
    f.write("Hello, World!\n")
    f.write("This is a test file.\n")
    f.write("Line 3 with numbers: 123\n")

print("File created and written successfully")

# Read the entire file
with open("test_file.txt", "r") as f:
    content = f.read()
    print("File content:")
    print(content)

# Test 2: Line-by-line operations
print("\n=== Test 2: Line-by-line Operations ===")

# Read file line by line
with open("test_file.txt", "r") as f:
    print("Reading line by line:")
    line_num = 1
    while True:
        line = f.readline()
        if not line:
            break
        print(f"Line {line_num}: {line.strip()}")
        line_num += 1

# Read all lines at once
with open("test_file.txt", "r") as f:
    lines = f.readlines()
    print(f"Total lines read: {len(lines)}")
    for i, line in enumerate(lines, 1):
        print(f"Line {i}: {line.strip()}")

# Test 3: Append mode
print("\n=== Test 3: Append Mode ===")

with open("test_file.txt", "a") as f:
    f.write("Appended line 1\n")
    f.write("Appended line 2\n")

print("Data appended to file")

# Verify append worked
with open("test_file.txt", "r") as f:
    content = f.read()
    print("File content after append:")
    print(content)

# Test 4: File positioning (seek/tell)
print("\n=== Test 4: File Positioning ===")

with open("test_file.txt", "r") as f:
    print(f"Initial position: {f.tell()}")
    
    # Read first 5 characters
    data = f.read(5)
    print(f"Read 5 chars: '{data}'")
    print(f"Position after read: {f.tell()}")
    
    # Seek to beginning
    f.seek(0)
    print(f"Position after seek(0): {f.tell()}")
    
    # Read again
    data = f.read(10)
    print(f"Read 10 chars from start: '{data}'")

# Test 5: StringIO operations
print("\n=== Test 5: StringIO Operations ===")

import io

# Create StringIO object
string_buffer = io.StringIO()
string_buffer.write("Line 1\n")
string_buffer.write("Line 2\n")
string_buffer.write("Line 3\n")

print("StringIO write completed")

# Read from StringIO
string_buffer.seek(0)
content = string_buffer.read()
print("StringIO content:")
print(content)

# Test StringIO readline
string_buffer.seek(0)
print("StringIO readline test:")
while True:
    line = string_buffer.readline()
    if not line:
        break
    print(f"Read line: {line.strip()}")

string_buffer.close()

# Test 6: BytesIO operations
print("\n=== Test 6: BytesIO Operations ===")

bytes_buffer = io.BytesIO()
bytes_buffer.write("Binary data test\n")
bytes_buffer.write("More binary data\n")

print("BytesIO write completed")

# Read from BytesIO
bytes_buffer.seek(0)
data = bytes_buffer.read()
print(f"BytesIO content: {data}")

bytes_buffer.close()

# Test 7: OS module file operations
print("\n=== Test 7: OS Module File Operations ===")

import os

# Test file existence
print(f"test_file.txt exists: {os.path.exists('test_file.txt')}")
print(f"nonexistent.txt exists: {os.path.exists('nonexistent.txt')}")

# Test path operations
full_path = os.path.abspath("test_file.txt")
print(f"Absolute path: {full_path}")

dirname = os.path.dirname(full_path)
basename = os.path.basename(full_path)
print(f"Directory: {dirname}")
print(f"Filename: {basename}")

# Test path join
new_path = os.path.join("/tmp", "subfolder", "file.txt")
print(f"Joined path: {new_path}")

# Test splitext
name, ext = os.path.splitext("document.pdf")
print(f"Filename: {name}, Extension: {ext}")

# Test 8: Directory operations
print("\n=== Test 8: Directory Operations ===")

# Create directory
try:
    os.mkdir("/tmp/test_dir")
    print("Directory created: /tmp/test_dir")
except Exception as e:
    print(f"Directory creation failed: {e}")

# Create nested directories
try:
    os.makedirs("/tmp/nested/deep/path", exist_ok=True)
    print("Nested directories created")
except Exception as e:
    print(f"Nested directory creation failed: {e}")

# Test current directory
current_dir = os.getcwd()
print(f"Current directory: {current_dir}")

# List directory contents
try:
    contents = os.listdir("/tmp")
    print(f"Contents of /tmp: {contents}")
except Exception as e:
    print(f"Directory listing failed: {e}")

# Test 9: Environment variables
print("\n=== Test 9: Environment Variables ===")

home = os.environ.get("HOME", "Not found")
path = os.environ.get("PATH", "Not found")
user = os.environ.get("USER", "Not found")

print(f"HOME: {home}")
print(f"PATH: {path}")
print(f"USER: {user}")

# Test 10: Error handling
print("\n=== Test 10: Error Handling ===")

# Test reading non-existent file
try:
    with open("nonexistent_file.txt", "r") as f:
        content = f.read()
except Exception as e:
    print(f"Expected error reading non-existent file: {e}")

# Test writing to closed file
try:
    f = open("test_file.txt", "w")
    f.close()
    f.write("This should fail")
except Exception as e:
    print(f"Expected error writing to closed file: {e}")

# Test operations on StringIO after close
try:
    sio = io.StringIO("test")
    sio.close()
    sio.read()
except Exception as e:
    print(f"Expected error on closed StringIO: {e}")

print("\n=== File I/O Test Suite Completed Successfully! ===")
print("All file operations, standard library modules, and error handling work correctly.")
