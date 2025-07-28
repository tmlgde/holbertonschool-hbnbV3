import bcrypt

plain = "admin123"
hashed = bcrypt.hashpw(plain.encode('utf-8'), bcrypt.gensalt())
print(hashed.decode())

