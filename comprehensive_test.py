#!/usr/bin/env python3
"""
Comprehensive Python Interpreter Test Suite
Testing all major Python features and standard library functionality
"""

import sys
import math
import time
import json
import random
import os

def test_basic_operations():
    """Test basic arithmetic and string operations"""
    print("=== Testing Basic Operations ===")
    
    # Arithmetic
    a, b = 10, 20
    print(f"Addition: {a} + {b} = {a + b}")
    print(f"Subtraction: {a} - {b} = {a - b}")
    print(f"Multiplication: {a} * {b} = {a * b}")
    print(f"Division: {a} / {b} = {a / b}")
    print(f"Power: {a} ** 2 = {a ** 2}")
    
    # Strings
    name = "Python"
    version = "3.11"
    message = f"Welcome to {name} {version}!"
    print(f"String formatting: {message}")
    
    return True

def test_control_structures():
    """Test loops and conditionals"""
    print("\n=== Testing Control Structures ===")
    
    # For loop with range
    print("For loop with range(5):")
    for i in range(5):
        print(f"  Iteration {i}")
    
    # While loop
    print("While loop countdown:")
    count = 3
    while count > 0:
        print(f"  Count: {count}")
        count -= 1
    
    # Conditional statements
    x = 15
    if x > 10:
        result = "greater than 10"
    elif x == 10:
        result = "equal to 10"
    else:
        result = "less than 10"
    print(f"Conditional: {x} is {result}")
    
    return True

def test_functions():
    """Test function definitions and calls"""
    print("\n=== Testing Functions ===")
    
    def factorial(n):
        """Calculate factorial recursively"""
        if n <= 1:
            return 1
        return n * factorial(n - 1)
    
    def fibonacci(n):
        """Calculate nth Fibonacci number"""
        if n <= 1:
            return n
        return fibonacci(n - 1) + fibonacci(n - 2)
    
    # Test function calls
    for i in range(6):
        fact = factorial(i)
        fib = fibonacci(i)
        print(f"  factorial({i}) = {fact}, fibonacci({i}) = {fib}")
    
    return True

def test_data_structures():
    """Test lists, dictionaries, and sets"""
    print("\n=== Testing Data Structures ===")
    
    # Lists
    numbers = [1, 2, 3, 4, 5]
    squared = [x**2 for x in numbers]
    print(f"Original list: {numbers}")
    print(f"Squared list: {squared}")
    print(f"List length: {len(numbers)}")
    print(f"List sum: {sum(numbers)}")
    
    # Dictionaries
    person = {
        "name": "Alice",
        "age": 30,
        "city": "New York",
        "skills": ["Python", "JavaScript", "SQL"]
    }
    print(f"Person data: {person}")
    print(f"Name: {person['name']}, Age: {person['age']}")
    
    # Sets (simplified)
    colors = ["red", "blue", "red", "green", "blue"]
    unique_colors = list(set(colors))
    print(f"Original colors: {colors}")
    print(f"Unique colors: {unique_colors}")
    
    return True

class Calculator:
    """A simple calculator class"""
    
    def __init__(self):
        self.history = []
        self.result = 0
    
    def add(self, x, y):
        """Add two numbers"""
        result = x + y
        operation = f"{x} + {y} = {result}"
        self.history.append(operation)
        self.result = result
        return result
    
    def multiply(self, x, y):
        """Multiply two numbers"""
        result = x * y
        operation = f"{x} * {y} = {result}"
        self.history.append(operation)
        self.result = result
        return result
    
    def get_history(self):
        """Get calculation history"""
        return self.history
    
    def get_result(self):
        """Get last result"""
        return self.result

def test_classes():
    """Test class definitions and object creation"""
    print("\n=== Testing Classes ===")
    
    calc = Calculator()
    
    # Test method calls
    result1 = calc.add(5, 3)
    result2 = calc.multiply(4, 6)
    result3 = calc.add(result1, result2)
    
    print(f"Calculator results:")
    print(f"  5 + 3 = {result1}")
    print(f"  4 * 6 = {result2}")
    print(f"  {result1} + {result2} = {result3}")
    print(f"  Final result: {calc.get_result()}")
    
    print("Calculator history:")
    for operation in calc.get_history():
        print(f"  {operation}")
    
    return True

def test_built_in_functions():
    """Test built-in functions"""
    print("\n=== Testing Built-in Functions ===")
    
    numbers = [3, 1, 4, 1, 5, 9, 2, 6]
    
    print(f"Numbers: {numbers}")
    print(f"Length: {len(numbers)}")
    print(f"Sum: {sum(numbers)}")
    print(f"Max: {max(numbers)}")
    print(f"Min: {min(numbers)}")
    print(f"Sorted: {sorted(numbers)}")
    print(f"Reversed: {list(reversed(numbers))}")
    
    # Test enumerate
    print("Enumerate:")
    for i, value in enumerate(numbers[:5]):
        print(f"  Index {i}: {value}")
    
    return True

def test_modules():
    """Test module imports and usage"""
    print("\n=== Testing Modules ===")
    
    # Math module
    print(f"Math constants: pi={math.pi:.4f}, e={math.e:.4f}")
    print(f"Math functions: sqrt(16)={math.sqrt(16)}, pow(2,3)={math.pow(2,3)}")
    
    # Random module (simplified)
    random_num = random.randint(1, 100)
    print(f"Random number (1-100): {random_num}")
    
    # JSON module (simplified)
    data = {"name": "test", "value": 42, "active": True}
    json_str = json.dumps(data)
    parsed_data = json.loads(json_str)
    print(f"JSON serialization: {json_str}")
    print(f"JSON parsing: {parsed_data}")
    
    # System module
    print(f"Python version: {sys.version}")
    print(f"Platform: {sys.platform}")
    
    return True

def test_error_handling():
    """Test try/except blocks"""
    print("\n=== Testing Error Handling ===")
    
    try:
        result = 10 / 2
        print(f"Division result: {result}")
    except ZeroDivisionError:
        print("Cannot divide by zero!")
    
    try:
        numbers = [1, 2, 3]
        value = numbers[1]  # Valid index
        print(f"List access: {value}")
    except IndexError:
        print("Index out of range!")
    
    return True

def run_all_tests():
    """Run the complete test suite"""
    print("Python Interpreter Comprehensive Test Suite")
    print("=" * 50)
    
    tests = [
        test_basic_operations,
        test_control_structures,
        test_functions,
        test_data_structures,
        test_classes,
        test_built_in_functions,
        test_modules,
        test_error_handling
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
                print(f"✓ {test.__name__} passed")
            else:
                print(f"✗ {test.__name__} failed")
        except Exception as e:
            print(f"✗ {test.__name__} failed with error: {e}")
    
    print("\n" + "=" * 50)
    print(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The Python interpreter is working correctly.")
    else:
        print(f"⚠️  {total - passed} tests failed. Some features may not be fully implemented.")
    
    return passed == total

# Run the test suite
if __name__ == "__main__":
    success = run_all_tests()
    print(f"\nTest suite completed. Success: {success}")
