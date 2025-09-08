# JSON encoder and decoder

def dumps(obj, indent=None):
    """Serialize obj to a JSON formatted string."""
    return _serialize(obj, indent, 0)

def loads(s):
    """Deserialize s (a string containing a JSON document) to a Python object."""
    return _parse(s.strip())

def dump(obj, fp, indent=None):
    """Serialize obj as a JSON formatted stream to fp."""
    fp.write(dumps(obj, indent))

def load(fp):
    """Deserialize fp to a Python object."""
    return loads(fp.read())

def _serialize(obj, indent, level):
    """Internal serialization function."""
    if obj is None:
        return "null"
    elif isinstance(obj, bool):
        return "true" if obj else "false"
    elif isinstance(obj, (int, float)):
        return str(obj)
    elif isinstance(obj, str):
        return _quote_string(obj)
    elif isinstance(obj, list):
        return _serialize_array(obj, indent, level)
    elif isinstance(obj, dict):
        return _serialize_object(obj, indent, level)
    else:
        raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")

def _serialize_array(arr, indent, level):
    """Serialize a list to JSON array."""
    if not arr:
        return "[]"
    
    if indent is None:
        items = [_serialize(item, indent, level) for item in arr]
        return "[" + ", ".join(items) + "]"
    else:
        items = []
        for item in arr:
            items.append(" " * (indent * (level + 1)) + _serialize(item, indent, level + 1))
        return "[\\n" + ",\\n".join(items) + "\\n" + " " * (indent * level) + "]"

def _serialize_object(obj, indent, level):
    """Serialize a dictionary to JSON object."""
    if not obj:
        return "{}"
    
    if indent is None:
        items = [_quote_string(str(k)) + ": " + _serialize(v, indent, level) for k, v in obj.items()]
        return "{" + ", ".join(items) + "}"
    else:
        items = []
        for k, v in obj.items():
            key_val = _quote_string(str(k)) + ": " + _serialize(v, indent, level + 1)
            items.append(" " * (indent * (level + 1)) + key_val)
        return "{\\n" + ",\\n".join(items) + "\\n" + " " * (indent * level) + "}"

def _quote_string(s):
    """Quote a string for JSON output."""
    s = s.replace("\\", "\\\\")
    s = s.replace('"', '\\"')
    s = s.replace("\\n", "\\n")
    s = s.replace("\\r", "\\r")
    s = s.replace("\\t", "\\t")
    return '"' + s + '"'

def _parse(s):
    """Parse JSON string."""
    s = s.strip()
    if not s:
        raise ValueError("Expecting value")
    
    return _parse_value(s, 0)[0]

def _parse_value(s, index):
    """Parse a JSON value starting at index."""
    s = s[index:].lstrip()
    if not s:
        raise ValueError("Expecting value")
    
    if s[0] == '"':
        return _parse_string(s)
    elif s[0] == '{':
        return _parse_object(s)
    elif s[0] == '[':
        return _parse_array(s)
    elif s.startswith('true'):
        return True, 4
    elif s.startswith('false'):
        return False, 5
    elif s.startswith('null'):
        return None, 4
    else:
        return _parse_number(s)

def _parse_string(s):
    """Parse a JSON string."""
    if not s.startswith('"'):
        raise ValueError("Expecting '\"'")
    
    result = ""
    i = 1
    while i < len(s):
        if s[i] == '"':
            return result, i + 1
        elif s[i] == '\\':
            if i + 1 >= len(s):
                raise ValueError("Unterminated string escape")
            next_char = s[i + 1]
            if next_char == '"':
                result += '"'
            elif next_char == '\\':
                result += '\\'
            elif next_char == 'n':
                result += '\\n'
            elif next_char == 'r':
                result += '\\r'
            elif next_char == 't':
                result += '\\t'
            else:
                result += next_char
            i += 2
        else:
            result += s[i]
            i += 1
    
    raise ValueError("Unterminated string")

def _parse_number(s):
    """Parse a JSON number."""
    i = 0
    if s[i] == '-':
        i += 1
    
    if i >= len(s) or not s[i].isdigit():
        raise ValueError("Expecting digit")
    
    if s[i] == '0':
        i += 1
    else:
        while i < len(s) and s[i].isdigit():
            i += 1
    
    if i < len(s) and s[i] == '.':
        i += 1
        if i >= len(s) or not s[i].isdigit():
            raise ValueError("Expecting digit")
        while i < len(s) and s[i].isdigit():
            i += 1
    
    if i < len(s) and s[i].lower() == 'e':
        i += 1
        if i < len(s) and s[i] in '+-':
            i += 1
        if i >= len(s) or not s[i].isdigit():
            raise ValueError("Expecting digit")
        while i < len(s) and s[i].isdigit():
            i += 1
    
    num_str = s[:i]
    try:
        if '.' in num_str or 'e' in num_str.lower():
            return float(num_str), i
        else:
            return int(num_str), i
    except ValueError:
        raise ValueError("Invalid number")

def _parse_array(s):
    """Parse a JSON array."""
    if not s.startswith('['):
        raise ValueError("Expecting '['")
    
    s = s[1:].lstrip()
    if s.startswith(']'):
        return [], 2
    
    result = []
    index = 1
    
    while True:
        s = s.lstrip()
        value, consumed = _parse_value(s, 0)
        result.append(value)
        index += consumed
        s = s[consumed:].lstrip()
        
        if s.startswith(']'):
            return result, index + 1
        elif s.startswith(','):
            s = s[1:]
            index += 1
        else:
            raise ValueError("Expecting ',' or ']'")

def _parse_object(s):
    """Parse a JSON object."""
    if not s.startswith('{'):
        raise ValueError("Expecting '{'")
    
    s = s[1:].lstrip()
    if s.startswith('}'):
        return {}, 2
    
    result = {}
    index = 1
    
    while True:
        s = s.lstrip()
        
        # Parse key
        if not s.startswith('"'):
            raise ValueError("Expecting property name enclosed in double quotes")
        
        key, consumed = _parse_string(s)
        index += consumed
        s = s[consumed:].lstrip()
        
        # Expect colon
        if not s.startswith(':'):
            raise ValueError("Expecting ':'")
        
        s = s[1:].lstrip()
        index += 1
        
        # Parse value
        value, consumed = _parse_value(s, 0)
        result[key] = value
        index += consumed
        s = s[consumed:].lstrip()
        
        if s.startswith('}'):
            return result, index + 1
        elif s.startswith(','):
            s = s[1:]
            index += 1
        else:
            raise ValueError("Expecting ',' or '}'")

# JSON Exceptions
class JSONDecodeError(ValueError):
    """Subclass of ValueError with the following additional properties."""
    pass
