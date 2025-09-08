# System-specific parameters and functions

import os

# Platform information
platform = "emscripten"
version = "3.11.0"
version_info = (3, 11, 0, 'final', 0)

# Module information
builtin_module_names = (
    'builtins', 'sys', 'math', 'random', 'os', 'time', 'datetime',
    'json', 'collections', 'itertools', 'functools', 'operator'
)

# Path information
path = ['', 'python_stdlib']
prefix = '/usr/local'
exec_prefix = '/usr/local'
executable = '/usr/local/bin/python'

# Standard streams
class MockFile:
    def __init__(self, name):
        self.name = name
        self.mode = 'w'
        self.closed = False
    
    def write(self, text):
        return len(text)
    
    def read(self, size=-1):
        return ''
    
    def readline(self, size=-1):
        return ''
    
    def close(self):
        self.closed = True
    
    def flush(self):
        pass

stdin = MockFile('<stdin>')
stdout = MockFile('<stdout>')
stderr = MockFile('<stderr>')

# Exit functions
def exit(code=0):
    """Exit the interpreter."""
    raise SystemExit(code)

def _getframe(depth=0):
    """Return a frame object from the call stack."""
    # Simplified implementation
    return None

# Module cache
modules = {}

# Encoding information
def getfilesystemencoding():
    """Return the name of the encoding used to convert Unicode filenames to bytes."""
    return 'utf-8'

def getfilesystemencodeerrors():
    """Return the name of the error mode used to convert Unicode filenames to bytes."""
    return 'surrogateescape'

def getdefaultencoding():
    """Return the name of the current default string encoding used by the Unicode implementation."""
    return 'utf-8'

# Memory and reference counting
def getrefcount(object):
    """Return the reference count of the object."""
    return 1  # Simplified

def getsizeof(object, default=None):
    """Return the size of an object in bytes."""
    if hasattr(object, '__sizeof__'):
        return object.__sizeof__()
    if default is not None:
        return default
    return 0

# Recursion control
def getrecursionlimit():
    """Return the current value of the recursion limit."""
    return 1000

def setrecursionlimit(limit):
    """Set the maximum depth of the Python interpreter stack."""
    pass

# Trace function
def settrace(func):
    """Set the global debug tracing function."""
    pass

def gettrace():
    """Get the global debug tracing function."""
    return None

# Profile function
def setprofile(func):
    """Set the global profile function."""
    pass

def getprofile():
    """Get the global profile function."""
    return None

# Exception information
def exc_info():
    """Return information about the most recent exception."""
    return (None, None, None)

# Display hook
def displayhook(value):
    """Print value to stdout."""
    if value is not None:
        print(repr(value))

def excepthook(type, value, traceback):
    """Handle uncaught exceptions."""
    print(f"{type.__name__}: {value}")

# Flags
class Flags:
    def __init__(self):
        self.debug = 0
        self.inspect = 0
        self.interactive = 0
        self.optimize = 0
        self.dont_write_bytecode = 0
        self.no_user_site = 0
        self.no_site = 0
        self.ignore_environment = 0
        self.verbose = 0
        self.bytes_warning = 0
        self.quiet = 0
        self.hash_randomization = 1
        self.isolated = 0
        self.dev_mode = False
        self.utf8_mode = 0

flags = Flags()

# Copyright and license
copyright = "Copyright (c) 2001-2023 Python Software Foundation"

def intern(string):
    """Enter string into the table of interned strings."""
    return string

# Hash information
hash_info = type('hash_info', (), {
    'width': 64,
    'modulus': 2305843009213693951,
    'inf': 314159,
    'nan': 0,
    'imag': 1000003,
    'algorithm': 'siphash24',
    'hash_bits': 64,
    'seed_bits': 128,
    'cutoff': 0
})()

# Integer information
int_info = type('int_info', (), {
    'bits_per_digit': 30,
    'sizeof_digit': 4
})()

# Float information
float_info = type('float_info', (), {
    'max': 1.7976931348623157e+308,
    'max_exp': 1024,
    'max_10_exp': 308,
    'min': 2.2250738585072014e-308,
    'min_exp': -1021,
    'min_10_exp': -307,
    'dig': 15,
    'mant_dig': 53,
    'epsilon': 2.220446049250313e-16,
    'radix': 2,
    'rounds': 1
})()

# Implementation information
implementation = type('implementation', (), {
    'name': 'cpython',
    'version': version_info,
    'hexversion': 0x30b0000,
    'cache_tag': 'cpython-311'
})()

# Meta path and path hooks
meta_path = []
path_hooks = []
path_importer_cache = {}

# Audit hook
def audit(event, *args):
    """Raise an auditing event."""
    pass

def addaudithook(hook):
    """Add a callable to the current audit hooks."""
    pass

# Breakpoint hook
def breakpointhook(*args, **kwargs):
    """Breakpoint hook function."""
    pass

# Thread information
def getswitchinterval():
    """Return the current thread switch interval."""
    return 0.005

def setswitchinterval(interval):
    """Set the current thread switch interval."""
    pass

# DLL path (Windows specific)
def getwindowsversion():
    """Return information about the running version of Windows."""
    raise AttributeError("module 'sys' has no attribute 'getwindowsversion'")

# Coroutine wrapper
def set_coroutine_origin_tracking_depth(depth):
    """Enable or disable coroutine origin tracking."""
    pass

def get_coroutine_origin_tracking_depth():
    """Get the current coroutine origin tracking depth."""
    return 0

# Async generator hooks
def set_asyncgen_hooks(firstiter, finalizer):
    """Set a finalizer for async generators."""
    pass

def get_asyncgen_hooks():
    """Get the async generator hooks."""
    return (None, None)
