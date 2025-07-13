"use client";

import APIEndpoint from "./APIEndpoint";

interface LastCommitProps {
  repo?: string;
}

interface CommitData {
  sha: string;
  html_url: string;
  date: string;
}

export default function LastCommit({ repo = "remcostoeten/remcostoeten.nl" }: LastCommitProps) {
  const renderCommitData = (data: CommitData) => {
    if (!data) {
      return "Unable to load commit information";
    }

    const formatted = Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(data.date));

    return (
      <>
        The last commit I've pushed was{" "}
        <a
          href={data.html_url}
          target="_blank"
          rel="noreferrer"
          className="text-accent hover:underline font-medium"
        >
          {data.sha.slice(0, 7)}
        </a>{" "}
        at {formatted}
      </>
    );
  };

  return (
    <APIEndpoint
      endpointUrl={`/api/github/commits?repo=${encodeURIComponent(repo)}`}
      refreshInterval={300000} // Refresh every 5 minutes
      render={renderCommitData}
    />
  );
}
