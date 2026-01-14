filepath = './data/accounts.csv'
with open(filepath, 'r') as f:
    content = f.read()  # Read as single string, not list

print("Before:")
print(content.split('\n')[894])
print(content.split('\n')[35034])

updated_filepath = './data/accounts_cleaned.csv'

content = content.replace(',null\n', ',\n')
content = content.replace('\\"', '')

print("\nAfter:")
print(content.split('\n')[894])
print(content.split('\n')[35034])

with open(updated_filepath, 'w') as f:  # Fixed typo
    f.write(content)