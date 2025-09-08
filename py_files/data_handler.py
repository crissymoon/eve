#!/usr/bin/env python3

import os
import sys
import json
import datetime
from typing import Dict, List, Any, Optional, Union
from pathlib import Path

class DataPassHandler:
    
    def __init__(self, target_file: str = "passed_info.txt") -> None:
        self.target_file: str = target_file
        self.delimiter: str = "|-|-|-|-|"
        self.base_dir: Path = Path(__file__).parent
        self.full_path: Path = self.base_dir / target_file
        self.validation_rules: Dict[str, Any] = {}
        self.error_log: List[str] = []
        
    def validate_input(self, data: Dict[str, Any]) -> bool:
        if not isinstance(data, dict):
            self.error_log.append(f"Invalid data type: expected dict, got {type(data)}")
            return False
            
        if not data:
            self.error_log.append("Empty data provided")
            return False
            
        for key, value in data.items():
            if not isinstance(key, str):
                self.error_log.append(f"Invalid key type: {type(key)}")
                return False
                
            if value is None or (isinstance(value, str) and not value.strip()):
                self.error_log.append(f"Empty or null value for key: {key}")
                return False
                
        return True
    
    def sanitize_data(self, data: Dict[str, Any]) -> Dict[str, str]:
        sanitized: Dict[str, str] = {}
        
        for key, value in data.items():
            clean_key = str(key).strip().replace(self.delimiter, "").replace("\n", " ").replace("\r", " ")
            clean_value = str(value).strip().replace(self.delimiter, "").replace("\n", " ").replace("\r", " ")
            
            if len(clean_key) > 100:
                clean_key = clean_key[:97] + "..."
            if len(clean_value) > 1000:
                clean_value = clean_value[:997] + "..."
                
            sanitized[clean_key] = clean_value
            
        return sanitized
    
    def format_entry(self, data: Dict[str, str], source: str = "unknown") -> str:
        timestamp = datetime.datetime.now().isoformat()
        
        formatted_data = []
        formatted_data.append(f"timestamp:{timestamp}")
        formatted_data.append(f"source:{source}")
        
        for key, value in data.items():
            formatted_data.append(f"{key}:{value}")
            
        return self.delimiter.join(formatted_data)
    
    def ensure_target_directory(self) -> bool:
        try:
            self.full_path.parent.mkdir(parents=True, exist_ok=True)
            return True
        except Exception as e:
            self.error_log.append(f"Directory creation failed: {str(e)}")
            return False
    
    def write_data(self, data: Dict[str, Any], source: str = "html_form", append: bool = True) -> bool:
        if not self.validate_input(data):
            return False
            
        if not self.ensure_target_directory():
            return False
            
        try:
            sanitized_data = self.sanitize_data(data)
            formatted_entry = self.format_entry(sanitized_data, source)
            
            mode = "a" if append else "w"
            with open(self.full_path, mode, encoding="utf-8") as file:
                if append and self.full_path.stat().st_size > 0:
                    file.write("\n")
                file.write(formatted_entry)
                
            return True
            
        except Exception as e:
            self.error_log.append(f"Write operation failed: {str(e)}")
            return False
    
    def read_data(self) -> List[Dict[str, str]]:
        if not self.full_path.exists():
            return []
            
        try:
            with open(self.full_path, "r", encoding="utf-8") as file:
                content = file.read().strip()
                
            if not content:
                return []
                
            entries = []
            for line in content.split("\n"):
                if line.strip():
                    entry_data = {}
                    parts = line.split(self.delimiter)
                    for part in parts:
                        if ":" in part:
                            key, value = part.split(":", 1)
                            entry_data[key.strip()] = value.strip()
                    if entry_data:
                        entries.append(entry_data)
                        
            return entries
            
        except Exception as e:
            self.error_log.append(f"Read operation failed: {str(e)}")
            return []
    
    def clear_data(self) -> bool:
        try:
            if self.full_path.exists():
                self.full_path.unlink()
            return True
        except Exception as e:
            self.error_log.append(f"Clear operation failed: {str(e)}")
            return False
    
    def get_errors(self) -> List[str]:
        return self.error_log.copy()
    
    def clear_errors(self) -> None:
        self.error_log.clear()

def process_form_data(form_data: Dict[str, Any], source: str = "html_form", target_file: str = "passed_info.txt") -> Dict[str, Any]:
    handler = DataPassHandler(target_file)
    
    success = handler.write_data(form_data, source)
    
    result = {
        "success": success,
        "errors": handler.get_errors(),
        "timestamp": datetime.datetime.now().isoformat()
    }
    
    if success:
        result["message"] = "Data successfully written to file"
    else:
        result["message"] = "Data write operation failed"
        
    return result

def process_json_input(json_string: str, source: str = "json_input") -> Dict[str, Any]:
    try:
        data = json.loads(json_string)
        return process_form_data(data, source)
    except json.JSONDecodeError as e:
        return {
            "success": False,
            "errors": [f"Invalid JSON: {str(e)}"],
            "message": "JSON parsing failed",
            "timestamp": datetime.datetime.now().isoformat()
        }

def process_command_line_args() -> Dict[str, Any]:
    if len(sys.argv) < 2:
        return {
            "success": False,
            "errors": ["No arguments provided"],
            "message": "Command line usage: python data_handler.py key1=value1 key2=value2 ...",
            "timestamp": datetime.datetime.now().isoformat()
        }
    
    form_data = {}
    for arg in sys.argv[1:]:
        if "=" in arg:
            key, value = arg.split("=", 1)
            form_data[key.strip()] = value.strip()
        else:
            form_data[arg] = "true"
    
    return process_form_data(form_data, "command_line")

if __name__ == "__main__":
    result = process_command_line_args()
    
    if result["success"]:
        print("SUCCESS: Data written successfully")
    else:
        print("ERROR: Operation failed")
        for error in result["errors"]:
            print(f"  - {error}")
    
    print(f"Timestamp: {result['timestamp']}")
