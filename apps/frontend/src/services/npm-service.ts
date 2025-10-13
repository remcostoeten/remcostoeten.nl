interface TNpmPackageData {
  name: string;
  description: string;
  version: string;
  weeklyDownloads: number;
  totalDownloads: number;
  lastPublish: string;
  dependencies: number;
  size?: string;
}

export async function fetchNpmPackageData(packageName: string): Promise<TNpmPackageData | null> {
  try {
    // First fetch basic package info
    const packageResponse = await fetch(`https://registry.npmjs.org/${packageName}`);

    if (!packageResponse.ok) {
      console.warn(`Package ${packageName} not found on npm`);
      return null;
    }

    const packageData = await packageResponse.json();

    // Get the latest version info
    const latestVersion = packageData['dist-tags']?.latest;
    if (!latestVersion) {
      console.warn(`No latest version found for package ${packageName}`);
      return null;
    }

    const versionInfo = packageData.versions[latestVersion];

    // Calculate dependencies count
    const dependencies = versionInfo?.dependencies ? Object.keys(versionInfo.dependencies).length : 0;

    // Get download stats
    const downloadResponse = await fetch(`https://api.npmjs.org/downloads/point/last-week/${packageName}`);
    let weeklyDownloads = 0;

    if (downloadResponse.ok) {
      const downloadData = await downloadResponse.json();
      weeklyDownloads = downloadData.downloads || 0;
    }

    // Get total downloads (approximate - npm API doesn't provide exact total easily)
    const totalDownloadResponse = await fetch(`https://api.npmjs.org/downloads/range/2020-01-01:today/${packageName}`);
    let totalDownloads = 0;

    if (totalDownloadResponse.ok) {
      const totalDownloadData = await totalDownloadResponse.json();
      if (totalDownloadData.downloads && Array.isArray(totalDownloadData.downloads)) {
        totalDownloads = totalDownloadData.downloads.reduce((sum: number, day: any) => sum + (day.downloads || 0), 0);
      }
    }

    // Get package size (from unpkg)
    let size: string | undefined;
    try {
      const sizeResponse = await fetch(`https://bundlephobia.com/api/size?package=${packageName}@${latestVersion}`);
      if (sizeResponse.ok) {
        const sizeData = await sizeResponse.json();
        size = sizeData?.size ? `${(sizeData.size / 1024).toFixed(1)}KB` : undefined;
      }
    } catch (sizeError) {
      // Size data is optional, don't fail if we can't get it
    }

    // Format last publish date
    const lastPublish = versionInfo?.publish_time
      ? new Date(versionInfo.publish_time).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      : 'Unknown';

    return {
      name: packageData.name || packageName,
      description: packageData.description || versionInfo?.description || 'No description available',
      version: latestVersion,
      weeklyDownloads,
      totalDownloads,
      lastPublish,
      dependencies,
      size
    };

  } catch (error) {
    console.error(`Failed to fetch npm data for ${packageName}:`, error);
    return null;
  }
}