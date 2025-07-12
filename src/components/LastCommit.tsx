import { GitHub } from "gheasy";

type TProps = {
	repo?: string;
};

type TCommitData = {
	sha: string;
	html_url: string;
	date: string;
};

async function getLastCommit(repo: string): Promise<TCommitData | null> {
	try {
		const github = GitHub();
		const [owner, repoName] = repo.split("/");

		const commits = await github.repo(owner, repoName).commits.get({
			params: { per_page: 1 },
		});

		if (Array.isArray(commits) && commits.length > 0) {
			const lastCommit = commits[0];
			return {
				sha: lastCommit.sha,
				html_url: lastCommit.html_url,
				date: lastCommit.commit.author.date,
			};
		}

		return null;
	} catch (error) {
		console.error("Failed to fetch last commit:", error);
		return null;
	}
}

export async function LastCommit({
	repo = "remco-stoeten/remcostoeten.nl",
}: TProps) {
	const commitData = await getLastCommit(repo);

	if (!commitData) {
		return (
			<div className="text-muted-foreground text-sm">
				Unable to load commit information
			</div>
		);
	}

	const formatted = Intl.DateTimeFormat("en-GB", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(commitData.date));

	return (
		<div className="text-xs text-muted-foreground">
			The last commit I've pushed was{" "}
			<a
				href={commitData.html_url}
				target="_blank"
				rel="noreferrer"
				className="hover:underline"
			>
				{commitData.sha.slice(0, 7)}
			</a>{" "}
			at {formatted}
		</div>
	);
}
