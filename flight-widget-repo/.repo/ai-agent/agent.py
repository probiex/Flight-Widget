import openai
import os
import subprocess
import json
from datetime import datetime

MEMORY_DIR = "ai-agent/memory"
MEMORY_FILE = os.path.join(MEMORY_DIR, "context.log")
ERROR_LOG = os.path.join(MEMORY_DIR, "errors.log")
OUTPUT_FILE = os.path.join("ai-agent", "output.md")

def load_memory():
    if os.path.exists(MEMORY_FILE):
        with open(MEMORY_FILE, "r") as f:
            return f.read()
    return ""

def save_memory(message):
    os.makedirs(MEMORY_DIR, exist_ok=True)
    with open(MEMORY_FILE, "a") as f:
        f.write(f"[{datetime.now()}] {message}\n")

def log_error(err):
    with open(ERROR_LOG, "a") as f:
        f.write(f"[{datetime.now()}] {str(err)}\n")

def get_next_task():
    try:
        result = subprocess.run([
            "gh", "issue", "list", "--limit", "1",
            "--json", "number,title", "--state", "open"
        ], capture_output=True, text=True)

        issues = json.loads(result.stdout)
        if not issues:
            return None, None
        issue = issues[0]
        return issue["number"], issue["title"]
    except Exception as e:
        log_error(f"Error fetching issue: {e}")
        return None, None

def create_branch_and_pr(branch_name, commit_message, pr_title, pr_body):
    try:
        subprocess.run(["git", "checkout", "-b", branch_name], check=True)
        subprocess.run(["git", "add", "."], check=True)
        subprocess.run(["git", "commit", "-m", commit_message], check=True)
        subprocess.run(["git", "push", "--set-upstream", "origin", branch_name], check=True)
        subprocess.run(["gh", "pr", "create", "--title", pr_title, "--body", pr_body], check=True)
    except Exception as e:
        log_error(f"Error creating PR: {e}")

def run_agent():
    issue_number, task = get_next_task()
    if not task:
        print("No open issues found.")
        return

    history = load_memory()

    prompt = f"""You are working on a codebase.
Task (from GitHub issue #{issue_number}): {task}
Previous context:\n{history}\n
Write the code changes needed, and explain why.
Respond in Markdown format with code blocks and explanation.
"""

    openai.api_key = os.getenv("OPENAI_API_KEY")

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        output = response['choices'][0]['message']['content']
        print(output)

        # Save to output file
        with open(OUTPUT_FILE, "w") as f:
            f.write(output)

        save_memory(f"TASK #{issue_number}: {task}\nOUTPUT:\n{output}\n")

        # Commit the change (assuming output.md is the change for now)
        branch_name = f"ai/task-{issue_number}"
        commit_message = f"AI: complete task #{issue_number} - {task}"
        create_branch_and_pr(branch_name, commit_message, f"AI task #{issue_number}", output)

    except Exception as e:
        log_error(f"Agent run failed: {e}")

if __name__ == "__main__":
    run_agent()
