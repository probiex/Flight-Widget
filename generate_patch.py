import os
from github import Github
import subprocess

def update_code():
    # Example: touch a file or run your AI logic!
    # Here, just add a line to README.md for demo purposes
    with open("README.md", "a") as f:
        f.write("\nAutopatched by AI Agent\n")

def main():
    token = os.environ["GITHUB_TOKEN"]
    repo_name = os.environ["GITHUB_REPOSITORY"]
    pr_number = os.environ.get("PR_NUMBER")  # May be None in some loop triggers

    g = Github(token)
    repo = g.get_repo(repo_name)

    if pr_number:
        pr = repo.get_pull(int(pr_number))
        title = pr.title
        body = pr.body
        print(f"Working on PR: {title}\n{body}")
    else:
        print("No PR context provided.")

    # Your AI logic here: update/patch the codebase as needed
    update_code()

    # Git commands to commit and push changes
    subprocess.run(["git", "config", "user.name", "aibot"], check=True)
    subprocess.run(["git", "config", "user.email", "aibot@example.com"], check=True)
    subprocess.run(["git", "add", "."], check=True)
    subprocess.run(["git", "commit", "-m", "AI patch"], check=True)
    subprocess.run(["git", "push"], check=True)

if __name__ == "__main__":
    main()
