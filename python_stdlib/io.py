# Python io module implementation
# This module provides core I/O functionality

DEFAULT_BUFFER_SIZE = 8192

class IOError(Exception):
    """Base exception for I/O related errors."""
    pass

class BlockingIOError(IOError):
    """Raised when I/O operation would block on a non-blocking stream."""
    pass

class UnsupportedOperation(IOError):
    """Raised when an operation is not supported."""
    pass

class StringIO:
    """Text I/O implementation using an in-memory text buffer."""
    
    def __init__(self, initial_value=""):
        self._buffer = initial_value
        self._position = 0
        self._closed = False
    
    def read(self, size=-1):
        if self._closed:
            raise ValueError("I/O operation on closed file")
        if size == -1:
            result = self._buffer[self._position:]
            self._position = len(self._buffer)
            return result
        else:
            result = self._buffer[self._position:self._position + size]
            self._position += len(result)
            return result
    
    def readline(self, size=-1):
        if self._closed:
            raise ValueError("I/O operation on closed file")
        start = self._position
        end = self._buffer.find('\n', start)
        if end == -1:
            end = len(self._buffer)
        else:
            end += 1
        if size != -1 and end - start > size:
            end = start + size
        result = self._buffer[start:end]
        self._position = end
        return result
    
    def readlines(self, hint=-1):
        if self._closed:
            raise ValueError("I/O operation on closed file")
        lines = []
        total_size = 0
        while True:
            line = self.readline()
            if not line:
                break
            lines.append(line)
            total_size += len(line)
            if hint != -1 and total_size >= hint:
                break
        return lines
    
    def write(self, s):
        if self._closed:
            raise ValueError("I/O operation on closed file")
        s = str(s)
        if self._position == len(self._buffer):
            self._buffer += s
        else:
            self._buffer = (self._buffer[:self._position] + 
                          s + 
                          self._buffer[self._position + len(s):])
        self._position += len(s)
        return len(s)
    
    def writelines(self, lines):
        for line in lines:
            self.write(line)
    
    def seek(self, pos, whence=0):
        if self._closed:
            raise ValueError("I/O operation on closed file")
        if whence == 0:
            self._position = pos
        elif whence == 1:
            self._position += pos
        elif whence == 2:
            self._position = len(self._buffer) + pos
        self._position = max(0, min(self._position, len(self._buffer)))
        return self._position
    
    def tell(self):
        if self._closed:
            raise ValueError("I/O operation on closed file")
        return self._position
    
    def close(self):
        self._closed = True
    
    def closed(self):
        return self._closed
    
    def getvalue(self):
        return self._buffer
    
    def truncate(self, size=None):
        if self._closed:
            raise ValueError("I/O operation on closed file")
        if size is None:
            size = self._position
        self._buffer = self._buffer[:size]
        if self._position > size:
            self._position = size
        return size
    
    def __enter__(self):
        return self
    
    def __exit__(self, type, value, traceback):
        self.close()

class BytesIO:
    """Binary I/O implementation using an in-memory bytes buffer."""
    
    def __init__(self, initial_bytes=b""):
        if isinstance(initial_bytes, str):
            initial_bytes = initial_bytes.encode('utf-8')
        self._buffer = initial_bytes
        self._position = 0
        self._closed = False
    
    def read(self, size=-1):
        if self._closed:
            raise ValueError("I/O operation on closed file")
        if size == -1:
            result = self._buffer[self._position:]
            self._position = len(self._buffer)
            return result
        else:
            result = self._buffer[self._position:self._position + size]
            self._position += len(result)
            return result
    
    def readline(self, size=-1):
        if self._closed:
            raise ValueError("I/O operation on closed file")
        start = self._position
        newline_byte = ord('\n')
        end = -1
        for i in range(start, len(self._buffer)):
            if self._buffer[i] == newline_byte:
                end = i + 1
                break
        if end == -1:
            end = len(self._buffer)
        if size != -1 and end - start > size:
            end = start + size
        result = self._buffer[start:end]
        self._position = end
        return result
    
    def write(self, b):
        if self._closed:
            raise ValueError("I/O operation on closed file")
        if isinstance(b, str):
            b = b.encode('utf-8')
        if self._position == len(self._buffer):
            self._buffer += b
        else:
            self._buffer = (self._buffer[:self._position] + 
                          b + 
                          self._buffer[self._position + len(b):])
        self._position += len(b)
        return len(b)
    
    def seek(self, pos, whence=0):
        if self._closed:
            raise ValueError("I/O operation on closed file")
        if whence == 0:
            self._position = pos
        elif whence == 1:
            self._position += pos
        elif whence == 2:
            self._position = len(self._buffer) + pos
        self._position = max(0, min(self._position, len(self._buffer)))
        return self._position
    
    def tell(self):
        if self._closed:
            raise ValueError("I/O operation on closed file")
        return self._position
    
    def close(self):
        self._closed = True
    
    def closed(self):
        return self._closed
    
    def getvalue(self):
        return self._buffer
    
    def truncate(self, size=None):
        if self._closed:
            raise ValueError("I/O operation on closed file")
        if size is None:
            size = self._position
        self._buffer = self._buffer[:size]
        if self._position > size:
            self._position = size
        return size
    
    def __enter__(self):
        return self
    
    def __exit__(self, type, value, traceback):
        self.close()

# Base I/O classes
class IOBase:
    """Abstract base class for all I/O classes."""
    
    def __init__(self):
        self._closed = False
    
    def close(self):
        self._closed = True
    
    def closed(self):
        return self._closed
    
    def fileno(self):
        raise UnsupportedOperation("fileno")
    
    def flush(self):
        pass
    
    def isatty(self):
        return False
    
    def readable(self):
        return False
    
    def seekable(self):
        return False
    
    def writable(self):
        return False
    
    def __enter__(self):
        return self
    
    def __exit__(self, type, value, traceback):
        self.close()

class TextIOBase(IOBase):
    """Base class for text streams."""
    
    def read(self, size=-1):
        raise UnsupportedOperation("read")
    
    def readline(self, size=-1):
        raise UnsupportedOperation("readline")
    
    def write(self, s):
        raise UnsupportedOperation("write")

class BufferedIOBase(IOBase):
    """Base class for buffered I/O."""
    
    def read(self, size=-1):
        raise UnsupportedOperation("read")
    
    def read1(self, size=-1):
        raise UnsupportedOperation("read1")
    
    def write(self, b):
        raise UnsupportedOperation("write")

class RawIOBase(IOBase):
    """Base class for raw binary I/O."""
    
    def read(self, size=-1):
        raise UnsupportedOperation("read")
    
    def readall(self):
        raise UnsupportedOperation("readall")
    
    def write(self, b):
        raise UnsupportedOperation("write")

def open(file, mode='r', buffering=-1, encoding=None, errors=None, newline=None, closefd=True, opener=None):
    """Open file and return a file object."""
    # This is handled by the interpreter's built-in open function
    return file

# Module constants
SEEK_SET = 0
SEEK_CUR = 1
SEEK_END = 2
