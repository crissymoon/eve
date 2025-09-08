# Collections of specialized data types

from collections.abc import *

def namedtuple(typename, field_names, *, rename=False, defaults=None):
    """Create a new class with named fields."""
    if isinstance(field_names, str):
        field_names = field_names.split()
    
    field_names = list(field_names)
    
    if rename:
        for i, name in enumerate(field_names):
            if not name.isidentifier() or name.startswith('_'):
                field_names[i] = f'_{i}'
    
    for name in field_names:
        if not name.isidentifier():
            raise ValueError(f"Field names must be valid identifiers: {name!r}")
        if name.startswith('_'):
            raise ValueError(f"Field names cannot start with an underscore: {name!r}")
    
    if len(set(field_names)) != len(field_names):
        raise ValueError("Field names must be unique")
    
    defaults = defaults or []
    if len(defaults) > len(field_names):
        raise TypeError("Defaults cannot be longer than field names")
    
    # Create the namedtuple class
    template = f'''
class {typename}:
    _fields = {field_names!r}
    
    def __init__(self, {", ".join(field_names)}):
        {"; ".join(f"self.{name} = {name}" for name in field_names)}
    
    def __repr__(self):
        args = ", ".join(f"{name}={{self.{name}!r}}" for name in self._fields)
        return f"{typename}({{args}})"
    
    def __eq__(self, other):
        if not isinstance(other, {typename}):
            return False
        return {" and ".join(f"self.{name} == other.{name}" for name in field_names)}
    
    def __getitem__(self, index):
        return [{", ".join(f"self.{name}" for name in field_names)}][index]
    
    def __len__(self):
        return {len(field_names)}
    
    def _asdict(self):
        return {{{", ".join(f"'{name}': self.{name}" for name in field_names)}}}
    
    def _replace(self, **kwargs):
        values = [getattr(self, name) for name in self._fields]
        for name, value in kwargs.items():
            if name not in self._fields:
                raise ValueError(f"Unknown field: {{name}}")
            values[self._fields.index(name)] = value
        return {typename}(*values)
'''
    
    # Execute the template to create the class
    namespace = {}
    exec(template, namespace)
    return namespace[typename]

class deque:
    """A double-ended queue."""
    
    def __init__(self, iterable=None, maxlen=None):
        self._data = list(iterable) if iterable else []
        self.maxlen = maxlen
        if maxlen is not None and len(self._data) > maxlen:
            self._data = self._data[-maxlen:]
    
    def append(self, x):
        """Add x to the right side of the deque."""
        self._data.append(x)
        if self.maxlen is not None and len(self._data) > self.maxlen:
            self._data.pop(0)
    
    def appendleft(self, x):
        """Add x to the left side of the deque."""
        self._data.insert(0, x)
        if self.maxlen is not None and len(self._data) > self.maxlen:
            self._data.pop()
    
    def clear(self):
        """Remove all elements from the deque."""
        self._data.clear()
    
    def copy(self):
        """Create a shallow copy of the deque."""
        return deque(self._data, self.maxlen)
    
    def count(self, x):
        """Count the number of deque elements equal to x."""
        return self._data.count(x)
    
    def extend(self, iterable):
        """Extend the right side of the deque by appending elements."""
        for item in iterable:
            self.append(item)
    
    def extendleft(self, iterable):
        """Extend the left side of the deque by appending elements."""
        for item in iterable:
            self.appendleft(item)
    
    def index(self, x, start=0, stop=None):
        """Return the position of x in the deque."""
        return self._data.index(x, start, stop)
    
    def insert(self, i, x):
        """Insert x into the deque at position i."""
        self._data.insert(i, x)
        if self.maxlen is not None and len(self._data) > self.maxlen:
            if i < len(self._data) // 2:
                self._data.pop()
            else:
                self._data.pop(0)
    
    def pop(self):
        """Remove and return an element from the right side of the deque."""
        if not self._data:
            raise IndexError("pop from empty deque")
        return self._data.pop()
    
    def popleft(self):
        """Remove and return an element from the left side of the deque."""
        if not self._data:
            raise IndexError("pop from empty deque")
        return self._data.pop(0)
    
    def remove(self, value):
        """Remove first occurrence of value."""
        self._data.remove(value)
    
    def reverse(self):
        """Reverse the deque in place."""
        self._data.reverse()
    
    def rotate(self, n=1):
        """Rotate the deque n steps to the right."""
        if self._data:
            n = n % len(self._data)
            self._data = self._data[-n:] + self._data[:-n]
    
    def __len__(self):
        return len(self._data)
    
    def __iter__(self):
        return iter(self._data)
    
    def __reversed__(self):
        return reversed(self._data)
    
    def __getitem__(self, index):
        return self._data[index]
    
    def __setitem__(self, index, value):
        self._data[index] = value
    
    def __delitem__(self, index):
        del self._data[index]
    
    def __repr__(self):
        return f"deque({self._data!r})"
    
    def __bool__(self):
        return bool(self._data)

class Counter(dict):
    """A dict subclass for counting hashable objects."""
    
    def __init__(self, iterable=None, **kwargs):
        super().__init__()
        self.update(iterable, **kwargs)
    
    def __missing__(self, key):
        return 0
    
    def most_common(self, n=None):
        """Return a list of the n most common elements and their counts."""
        items = sorted(self.items(), key=lambda x: x[1], reverse=True)
        return items if n is None else items[:n]
    
    def elements(self):
        """Return an iterator over elements repeating each as many times as its count."""
        for element, count in self.items():
            for _ in range(count):
                yield element
    
    def subtract(self, iterable=None, **kwargs):
        """Subtract counts (in-place)."""
        if iterable is not None:
            if hasattr(iterable, 'items'):
                for element, count in iterable.items():
                    self[element] -= count
            else:
                for element in iterable:
                    self[element] -= 1
        
        for element, count in kwargs.items():
            self[element] -= count
    
    def update(self, iterable=None, **kwargs):
        """Add counts from an iterable or mapping."""
        if iterable is not None:
            if hasattr(iterable, 'items'):
                for element, count in iterable.items():
                    self[element] = self.get(element, 0) + count
            else:
                for element in iterable:
                    self[element] = self.get(element, 0) + 1
        
        for element, count in kwargs.items():
            self[element] = self.get(element, 0) + count
    
    def __add__(self, other):
        """Add counts from two counters."""
        if not isinstance(other, Counter):
            return NotImplemented
        result = Counter()
        for element in set(self) | set(other):
            result[element] = self[element] + other[element]
        return result
    
    def __sub__(self, other):
        """Subtract counts from two counters."""
        if not isinstance(other, Counter):
            return NotImplemented
        result = Counter()
        for element in set(self) | set(other):
            count = self[element] - other[element]
            if count > 0:
                result[element] = count
        return result
    
    def __and__(self, other):
        """Intersection: min(c[x], d[x])."""
        if not isinstance(other, Counter):
            return NotImplemented
        result = Counter()
        for element in set(self) & set(other):
            result[element] = min(self[element], other[element])
        return result
    
    def __or__(self, other):
        """Union: max(c[x], d[x])."""
        if not isinstance(other, Counter):
            return NotImplemented
        result = Counter()
        for element in set(self) | set(other):
            result[element] = max(self[element], other[element])
        return result

class defaultdict(dict):
    """A dict subclass that calls a factory function to supply missing values."""
    
    def __init__(self, default_factory=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.default_factory = default_factory
    
    def __getitem__(self, key):
        try:
            return super().__getitem__(key)
        except KeyError:
            return self.__missing__(key)
    
    def __missing__(self, key):
        if self.default_factory is None:
            raise KeyError(key)
        self[key] = value = self.default_factory()
        return value
    
    def __repr__(self):
        return f"defaultdict({self.default_factory!r}, {dict(self)!r})"

class OrderedDict(dict):
    """A dict that remembers insertion order."""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._keys = list(super().keys())
    
    def __setitem__(self, key, value):
        if key not in self:
            self._keys.append(key)
        super().__setitem__(key, value)
    
    def __delitem__(self, key):
        super().__delitem__(key)
        self._keys.remove(key)
    
    def __iter__(self):
        return iter(self._keys)
    
    def keys(self):
        return self._keys.copy()
    
    def values(self):
        return [self[key] for key in self._keys]
    
    def items(self):
        return [(key, self[key]) for key in self._keys]
    
    def popitem(self, last=True):
        """Remove and return an arbitrary (key, value) pair."""
        if not self:
            raise KeyError('dictionary is empty')
        key = self._keys.pop() if last else self._keys.pop(0)
        value = self[key]
        del self[key]
        return key, value
    
    def move_to_end(self, key, last=True):
        """Move an existing element to the end (or beginning if last is false)."""
        if key not in self:
            raise KeyError(key)
        self._keys.remove(key)
        if last:
            self._keys.append(key)
        else:
            self._keys.insert(0, key)
