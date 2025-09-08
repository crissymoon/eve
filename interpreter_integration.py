#!/usr/bin/env python3

"""
Integration module for the Python interpreter system
Demonstrates how to use the data handler within the EVE interpreter environment
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from py_files.data_handler import DataPassHandler, process_form_data

def interpreter_data_integration():
    """
    Function to be called from the Python interpreter system
    Processes interpreter execution data and logs it
    """
    
    execution_data = {
        "interpreter_version": "EVE_v1.0",
        "execution_type": "code_execution",
        "user_session": "browser_session",
        "status": "active",
        "modules_loaded": "sys,math,time,json,collections,random,os,io",
        "features_used": "file_io,standard_libs,error_handling"
    }
    
    result = process_form_data(execution_data, "python_interpreter")
    return result

def log_interpreter_event(event_type: str, details: dict, source: str = "interpreter"):
    """
    Log specific interpreter events with structured data
    
    Args:
        event_type: Type of event (execution, error, module_load, etc.)
        details: Dictionary containing event details
        source: Source system generating the event
    """
    
    event_data = {
        "event_type": event_type,
        "interpreter_system": "EVE",
        **details
    }
    
    handler = DataPassHandler()
    success = handler.write_data(event_data, source)
    
    if not success:
        print("Logging failed:", handler.get_errors())
    
    return success

def process_interpreter_form_data(form_data: dict):
    """
    Process form data submitted to the interpreter system
    """
    
    enhanced_data = {
        **form_data,
        "system": "EVE_Python_Interpreter",
        "processing_method": "server_side_python",
        "data_format": "structured_form"
    }
    
    return process_form_data(enhanced_data, "interpreter_form")

if __name__ == "__main__":
    print("EVE Interpreter Data Integration Test")
    
    # Test interpreter integration
    result = interpreter_data_integration()
    if result["success"]:
        print("Interpreter data logged successfully")
    
    # Test event logging
    success = log_interpreter_event(
        "code_execution", 
        {
            "code_lines": "15",
            "execution_time": "0.245s",
            "memory_usage": "2.1MB",
            "status": "completed"
        }
    )
    
    if success:
        print("Event logged successfully")
    
    # Test form processing
    sample_form = {
        "user_code": "print('Hello from EVE interpreter')",
        "execution_mode": "immediate",
        "user_id": "guest_user",
        "session_id": "sess_12345"
    }
    
    form_result = process_interpreter_form_data(sample_form)
    if form_result["success"]:
        print("Form data processed successfully")
    
    print("Integration test completed")
