import json
import sys
from pathlib import Path

def read_passed_info(): 
    with open("passed_info.txt") as f: return f.read() 

def check_user(user: str, psswd: str):
    import os
    vault_path = Path(__file__).parent.parent / 'vault' / 'users.txt'
    
    # Debug: print current working directory and attempted path
    print(f"Current working directory: {os.getcwd()}")
    print(f"Attempting to read from: {vault_path}")
    print(f"File exists: {vault_path.exists()}")
    
    try:
        with open(vault_path, 'r') as f:
            content = f.read()
            new_content = content.split("\n")
            for x in new_content:
                if ',' in x:
                    line = x.split(",")
                    username = line[0]
                    password = line[1]
                    access_level = line[2]
                    if user == username and psswd == password:
                        return access_level
            return "No User Found!"
    except FileNotFoundError:
        print(f"Error: Could not find users.txt at {vault_path}")
        return "System Error: User database not found"
    except Exception as e:
        print(f"Error reading user database: {e}")
        return "System Error: Database read error"

print("Login system initialized")

if 'data' in globals():
    username = data.get('username', '')
    password = data.get('password', '')
    
    print(f"Processing login for user: {username}")
    
    access_level = check_user(username.lower().strip(), password.strip())
    
    if access_level != "No User Found!":
        print(f"LOGIN SUCCESS: Welcome {username}! Access level: {access_level}")
        result = {"status": "success", "message": "Login successful", "user": username, "access_level": access_level}
    else:
        print("LOGIN FAILED: Invalid credentials")
        result = {"status": "failed", "message": "Invalid username or password"}
    
    print(json.dumps(result))
else:
    print("No login data provided")

if __name__ == "__main__":
    print("'q' to quit")
    
    check_info = True
    while check_info:
        info = read_passed_info()
        split_delim = info.split("|-|-|-|-|")
        if len(split_delim) >= 2:
            result = check_user(split_delim[0], split_delim[1])
            print(result)
        break
        
