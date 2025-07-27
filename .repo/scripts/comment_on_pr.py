import subprocess
import sys

pr_number = sys.argv[1]
comment = sys.argv[2]

subprocess.run([
    "gh", "pr", "comment", pr_number, "--body", comment
])
