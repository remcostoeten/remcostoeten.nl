import { getCachedContributions } from "@/services/contribution-service";
import { ContributionGraphClient } from "./contribution-graph-client";

export async function GithubContributionGraph() {
    const data = await getCachedContributions();

    // filtering for the current year or last 365 days is handled by the API 'y=last' param
    // but let's ensure we pass the correct array

    return <ContributionGraphClient data={data.contributions} />;
}
