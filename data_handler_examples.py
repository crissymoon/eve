#!/usr/bin/env python3

from py_files.data_handler import DataPassHandler, process_form_data, process_json_input
from typing import Dict, Any
import json

def example_basic_usage():
    """Basic usage example of the DataPassHandler"""
    
    sample_data = {
        "user_name": "John Doe",
        "user_email": "john.doe@example.com",
        "action": "login_attempt",
        "ip_address": "192.168.1.100",
        "user_agent": "Mozilla/5.0",
        "status": "success"
    }
    
    result = process_form_data(sample_data, "login_system")
    
    if result["success"]:
        print(f"Data written successfully at {result['timestamp']}")
    else:
        print("Failed to write data:")
        for error in result["errors"]:
            print(f"  - {error}")

def example_advanced_usage():
    """Advanced usage with custom handler instance"""
    
    handler = DataPassHandler("py_files/custom_data.txt")
    
    data_entries = [
        {
            "event_type": "page_view",
            "page_url": "/dashboard",
            "user_id": "user_123",
            "session_duration": "00:05:32"
        },
        {
            "event_type": "button_click",
            "element_id": "submit_button",
            "user_id": "user_123",
            "coordinates": "x:150,y:200"
        },
        {
            "event_type": "form_submission",
            "form_name": "contact_form",
            "user_id": "user_123",
            "validation_status": "passed"
        }
    ]
    
    for i, data in enumerate(data_entries):
        success = handler.write_data(data, f"analytics_system_{i+1}")
        if success:
            print(f"Entry {i+1} written successfully")
        else:
            print(f"Entry {i+1} failed: {handler.get_errors()}")

def example_json_processing():
    """Example of processing JSON input"""
    
    json_data = '''
    {
        "transaction_id": "TXN_001",
        "amount": "299.99",
        "currency": "USD",
        "payment_method": "credit_card",
        "merchant": "XcaliburMoon Web Development",
        "customer_email": "customer@example.com"
    }
    '''
    
    result = process_json_input(json_data, "payment_system")
    
    if result["success"]:
        print("JSON data processed successfully")
    else:
        print("JSON processing failed:")
        for error in result["errors"]:
            print(f"  - {error}")

def example_data_reading():
    """Example of reading stored data"""
    
    handler = DataPassHandler()
    stored_data = handler.read_data()
    
    if stored_data:
        print(f"Found {len(stored_data)} entries:")
        for i, entry in enumerate(stored_data):
            print(f"Entry {i+1}:")
            for key, value in entry.items():
                print(f"  {key}: {value}")
            print()
    else:
        print("No data found or error reading data")
        for error in handler.get_errors():
            print(f"  - {error}")

def example_validation_and_sanitization():
    """Example showing validation and sanitization features"""
    
    handler = DataPassHandler()
    
    invalid_data_examples = [
        {},  # Empty data
        {"key": ""},  # Empty value
        {"": "value"},  # Empty key
        None,  # Invalid type
        {"key": None}  # Null value
    ]
    
    print("Testing validation with invalid data:")
    for i, data in enumerate(invalid_data_examples):
        handler.clear_errors()
        is_valid = handler.validate_input(data)
        print(f"Test {i+1}: Valid={is_valid}")
        if not is_valid:
            for error in handler.get_errors():
                print(f"  Error: {error}")
    
    print("\nTesting sanitization:")
    dirty_data = {
        "user_input|-|-|-|-|malicious": "Some text with|-|-|-|-|delimiter and\nnewlines\rand\rcarriage returns",
        "very_long_key_" + "x" * 200: "normal value",
        "normal_key": "x" * 2000  # Very long value
    }
    
    sanitized = handler.sanitize_data(dirty_data)
    print("Sanitized data:")
    for key, value in sanitized.items():
        print(f"  {key[:50]}{'...' if len(key) > 50 else ''}: {value[:100]}{'...' if len(value) > 100 else ''}")

def example_error_handling():
    """Example of comprehensive error handling"""
    
    handler = DataPassHandler("invalid/path/to/file.txt")
    
    test_data = {"test": "data"}
    success = handler.write_data(test_data, "error_test")
    
    if not success:
        print("Expected failure occurred:")
        for error in handler.get_errors():
            print(f"  - {error}")
    
    handler.clear_errors()
    
    handler_valid = DataPassHandler()
    success = handler_valid.write_data(test_data, "error_test")
    
    if success:
        print("Recovery successful with valid handler")

if __name__ == "__main__":
    print("=== DataPassHandler Usage Examples ===\n")
    
    print("1. Basic Usage:")
    example_basic_usage()
    print()
    
    print("2. Advanced Usage:")
    example_advanced_usage()
    print()
    
    print("3. JSON Processing:")
    example_json_processing()
    print()
    
    print("4. Data Reading:")
    example_data_reading()
    print()
    
    print("5. Validation and Sanitization:")
    example_validation_and_sanitization()
    print()
    
    print("6. Error Handling:")
    example_error_handling()
    print()
    
    print("=== Examples Complete ===")
