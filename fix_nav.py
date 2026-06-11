import re

file_path = "/home/reza/projects/rubika-publisher-mvp/frontend/components/app-shell.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and remove QuickCreateDock line from JSX
new_lines = []
for line in lines:
    if '<QuickCreateDock />' not in line:
        new_lines.append(line)

# Join back and remove the quickCreateItems and QuickCreateDock function
content = ''.join(new_lines)

# Remove everything from "const quickCreateItems" to the last "}"
pattern = r'\nconst quickCreateItems = \[[\s\S]*?^}\s*$'
content = re.sub(pattern, '\n}\n', content, flags=re.MULTILINE)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed!")
