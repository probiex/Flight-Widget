# scripts/get_next_task.py

import subprocess
import json

def get_open_issues():
    result = subprocess.run(["gh", "issue", "list", "--json", "number,title,state", "--state", "open"],
                            capture_output=True, text=True)
    issues = json.loads(result.stdout)
    return issues

def select_next_issue(issues):
    return issues[0] if issues else None

if __name__ == "__main__":
    issues = get_open_issues()
    next_task = select_next_issue(issues)
    if next_task:
        print(f"#TASK#{next_task['number']} - {next_task['title']}")
    else:
        print("NO_TASK")
