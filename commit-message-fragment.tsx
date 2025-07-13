export function CommitMessageFragment({ commitName, projectName, timeAgo }: { commitName: string; projectName: string; timeAgo: string }) {
  return (
    <>
      The last commit I've pushed was {commitName} for {projectName} {timeAgo} ago.
    </>
  );
}
