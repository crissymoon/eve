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
    
    
    # Test logic for retriving info
    run = True
    while run:
        usern = input("Enter your user name: ")
        if usern.lower().strip() == 'q': break
        thepass = input("Enter your password: ")
        if thepass.lower().strip() == 'q': break
        print(check_user(usern.lower().strip(), thepass.strip()))
        
