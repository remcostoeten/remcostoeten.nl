import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const repo = searchParams.get("repo");

  if (!repo) {
    return NextResponse.json({ error: "Repository parameter is required" }, { status: 400 });
  }

  try {
    const [owner, repoName] = repo.split("/");
    
    if (!owner || !repoName) {
      return NextResponse.json({ error: "Invalid repository format. Use 'owner/repo'" }, { status: 400 });
    }

    // Use GitHub API directly with proper authentication
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/commits?per_page=1`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'remcostoeten.nl',
          // Add token if available in environment
          ...(process.env.GITHUB_TOKEN && {
            'Authorization': `token ${process.env.GITHUB_TOKEN}`
          })
        }
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: `Repository ${repo} not found or not accessible` }, { status: 404 });
      } else {
        return NextResponse.json({ error: `GitHub API error: ${response.status} ${response.statusText}` }, { status: response.status });
      }
    }

    const commits = await response.json();

    if (Array.isArray(commits) && commits.length > 0) {
      const lastCommit = commits[0];
      return NextResponse.json({
        sha: lastCommit.sha,
        html_url: lastCommit.html_url,
        date: lastCommit.commit.author.date,
      });
    }

    return NextResponse.json({ error: "No commits found" }, { status: 404 });
  } catch (error) {
    console.error("Failed to fetch last commit:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
