# EVE - Comprehensive Python Interpreter

A fully-featured JavaScript-based Python interpreter capable of executing comprehensive Python code with full standard library support and file I/O operations.

## Features

### Core Python Language Support
- **Complete Syntax**: Variables, functions, classes, control structures
- **Data Types**: Numbers, strings, booleans, lists, dictionaries, tuples, sets
- **Control Flow**: if/elif/else, for/while loops, try/except error handling
- **Functions**: Definition, parameters, return values, nested calls, lambda functions
- **Classes**: Definition, methods, inheritance, attributes, special methods
- **Advanced Features**: F-strings, list comprehensions, generator expressions

### Standard Library Modules
- **sys**: System-specific parameters and functions
- **math**: Mathematical functions and constants  
- **time**: Time-related functions
- **json**: JSON encoder and decoder
- **collections**: Specialized container datatypes
- **random**: Generate random numbers and selections
- **os**: Operating system interface functions
- **io**: Core I/O functionality including StringIO and BytesIO

### File I/O Operations
- **Built-in open()**: Full file mode support (r, w, a, r+, w+, a+)
- **File Methods**: read(), readline(), readlines(), write(), writelines()
- **File Positioning**: seek(), tell(), flush(), close()
- **Context Managers**: Support for `with open()` statements
- **In-Memory File System**: Complete simulated file system operations

### Error Handling
- **Comprehensive Exceptions**: Proper Python-compatible error messages
- **File Errors**: FileNotFoundError, IOError, permission errors
- **Type Errors**: Invalid operations, attribute errors
- **Syntax Errors**: Detailed parsing error messages

## Usage

### Basic Usage
Simply open `index.html` in a web browser. The interpreter will automatically load and run test scripts demonstrating its capabilities.

### Running Python Code
```python
# Basic operations
x = 10
y = 20
result = x + y
print(f"Result: {result}")

# File operations
with open("data.txt", "w") as f:
    f.write("Hello, World!")

with open("data.txt", "r") as f:
    content = f.read()
    print(content)

# Using standard libraries
import math
import random

print(f"Pi: {math.pi}")
print(f"Random number: {random.randint(1, 100)}")
```

### Standard Library Import
```python
import sys
import os
import json
import time
from io import StringIO

# All modules work as expected
print(sys.version)
print(os.getcwd())
data = json.dumps({"key": "value"})
```

## Architecture

### Core Components
- **Tokenizer**: Regex-based lexical analysis
- **Parser**: Recursive descent parser with AST generation  
- **Evaluator**: Comprehensive AST node evaluation
- **Scope Management**: Proper variable scoping and namespace handling
- **Module System**: Dynamic module loading and caching

### File System
- **Virtual File System**: Complete in-memory file system simulation
- **Path Operations**: Full path manipulation and resolution
- **Directory Operations**: mkdir, rmdir, listdir functionality
- **File Metadata**: Creation/modification times, file types

### Browser Compatibility
- **Pure JavaScript**: No external dependencies
- **Modern Browsers**: Works in all modern web browsers
- **Local Storage**: All operations work offline
- **Performance Optimized**: Efficient execution and memory usage

## Test Suites

### Comprehensive Test (`comprehensive_test.py`)
Tests all core Python features including:
- Basic operations and data types
- Control structures and functions
- Classes and inheritance
- Built-in functions and modules
- Error handling

### File I/O Test (`file_io_test.py`)
Comprehensive file system testing:
- File read/write operations
- Directory manipulation
- StringIO/BytesIO operations
- Path operations and environment variables
- Error handling for file operations

## Technical Requirements

- Modern web browser with JavaScript support
- No server required - runs entirely client-side
- No external dependencies or CDN requirements

## Development

### Project Structure
```
eve/
├── index.html              # Main interface
├── python_interpreter.js   # Core interpreter implementation
├── comprehensive_test.py   # Full feature test suite
├── file_io_test.py        # File I/O test suite
├── python_stdlib/         # Standard library modules
│   ├── sys.py
│   ├── math.py
│   ├── time.py
│   ├── json.py
│   ├── collections.py
│   ├── random.py
│   ├── os.py
│   └── io.py
├── py_files/              # Sample Python files
└── vault/                 # Additional resources
```

### Key Implementation Features
- **No CDN Dependencies**: All content served locally
- **Modular Design**: Separated concerns for maintainability
- **Extensible Architecture**: Easy to add new modules and features
- **Standards Compliant**: Follows Python language specifications
- **Error Resilient**: Comprehensive error handling throughout

## Capabilities

This interpreter can handle virtually any Python code including:
- Complex data processing scripts
- Object-oriented programming
- File manipulation and data persistence
- Mathematical computations
- String processing and formatting
- JSON data handling
- System operations simulation

## License

This project demonstrates advanced Python interpreter implementation in JavaScript with comprehensive standard library support and file I/O capabilities.

JS - Python Interpreter