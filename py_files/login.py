def read_passed_info(): 
    with open("passed_info.txt") as f: return f.read() 

def check_user(user: str, psswd: str):
    with open('../vault/users.txt', 'r') as f: 
        content = f.read()
        new_content = content.split("\n")
        for x in new_content:
            line = x.split(",")
            username = line[0]
            password = line[1]
            access_level = line[2]
            if user == username and psswd == password:
                return access_level
        return "No User Found!"

# with open('../vault/users.txt', 'r') as f:  print(f.read()) # Test Path
        
if __name__ == "__main__":
    print("'q' to quit")
    
    check_info = True
    while check_info:
        info = read_passed_info()
        split_delim = info.split("|-|-|-|-|")
        check_user(split_delim[0], split_delim[1])
        
    
    
    
    # Test logic for retriving info
    run = False
    while run:
        usern = input("Enter your user name: ")
        if usern.lower().strip() == 'q': break
        thepass = input("Enter your password: ")
        if thepass.lower().strip() == 'q': break
        print(check_user(usern.lower().strip(), thepass.strip()))
        
