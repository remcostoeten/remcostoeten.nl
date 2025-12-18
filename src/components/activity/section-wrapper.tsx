import { getCachedContributions } from "@/services/contribution-service";
import { ActivitySection } from "./section";

export async function ActivitySectionWrapper() {
    const data = await getCachedContributions();

    return <ActivitySection contributionData={data.contributions} />;
}
