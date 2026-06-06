import os
import subprocess
import json
import tempfile
from pathlib import Path

class Deployer:
    def __init__(self, project_dir: str):
        self.project_dir = Path(project_dir)
        self.github_token = os.getenv("GITHUB_TOKEN", "")
        self.vercel_token = os.getenv("VERCEL_TOKEN", "")

    def init_git(self) -> bool:
        if (self.project_dir / ".git").exists():
            return True
        return self._run("git init") and self._run("git checkout -b main")

    def commit_all(self, message: str = "HackEasy generated project") -> bool:
        self._run("git add -A")
        return self._run(f'git commit -m "{message}"')

    def create_github_repo(self, repo_name: str, public: bool = True) -> str | None:
        if not self.github_token:
            return None
        visibility = "public" if public else "private"
        cmd = f'gh repo create {repo_name} --{visibility} --source=. --push'
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=self.project_dir)
        if result.returncode == 0:
            return result.stdout.strip()
        return None

    def deploy_vercel(self, project_dir: str | None = None) -> str | None:
        target = project_dir or self.project_dir
        env = os.environ.copy()
        if self.vercel_token:
            env["VERCEL_TOKEN"] = self.vercel_token

        if not (Path(target) / "vercel.json").exists():
            vercel_config = {
                "framework": "nextjs",
                "buildCommand": "npx next build",
                "outputDirectory": ".next",
                "installCommand": "npm install"
            }
            (Path(target) / "vercel.json").write_text(json.dumps(vercel_config, indent=2))

        result = subprocess.run(
            "npx vercel --prod --yes --token " + self.vercel_token if self.vercel_token else "npx vercel --prod --yes",
            shell=True, capture_output=True, text=True, cwd=str(target), env=env
        )
        if result.returncode == 0:
            for line in result.stdout.split("\n"):
                if "https://" in line and ".vercel.app" in line:
                    return line.strip()
        return None

    def deploy_docker(self, image_name: str = "hackeasy") -> bool:
        return self._run(f"docker build -t {image_name} .")

    def _run(self, cmd: str) -> bool:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=self.project_dir)
        return result.returncode == 0
