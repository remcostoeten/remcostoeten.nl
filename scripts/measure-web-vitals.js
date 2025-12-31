// Script to measure Web Vitals for your site
// Run this in the browser console or integrate into your app

class WebVitalsMonitor {
    constructor() {
        this.metrics = {
            LCP: null,
            FCP: null,
            TTFB: null,
            TBT: null,
            CLS: null,
        };
        this.tbtData = {
            fcpTime: 0,
            longTasks: [],
        };
    }

    // Measure Largest Contentful Paint
    measureLCP() {
        return new Promise((resolve) => {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.LCP = (lastEntry.renderTime || lastEntry.loadTime) / 1000;
                console.log('✅ LCP:', this.metrics.LCP.toFixed(2) + 's');
            });
            observer.observe({ type: 'largest-contentful-paint', buffered: true });

            // LCP can change, so we'll resolve after a timeout
            setTimeout(() => resolve(this.metrics.LCP), 5000);
        });
    }

    // Measure First Contentful Paint
    measureFCP() {
        return new Promise((resolve) => {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (entry.name === 'first-contentful-paint') {
                        this.metrics.FCP = entry.startTime / 1000;
                        this.tbtData.fcpTime = entry.startTime;
                        console.log('✅ FCP:', this.metrics.FCP.toFixed(2) + 's');
                        resolve(this.metrics.FCP);
                    }
                });
            });
            observer.observe({ type: 'paint', buffered: true });
        });
    }

    // Measure Time to First Byte
    measureTTFB() {
        const navEntry = performance.getEntriesByType('navigation')[0];
        if (navEntry) {
            this.metrics.TTFB = navEntry.responseStart / 1000;
            console.log('✅ TTFB:', this.metrics.TTFB.toFixed(2) + 's');
            return this.metrics.TTFB;
        }
        return null;
    }

    // Measure Total Blocking Time
    measureTBT() {
        return new Promise((resolve) => {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (entry.startTime >= this.tbtData.fcpTime) {
                        this.tbtData.longTasks.push({
                            duration: entry.duration,
                            startTime: entry.startTime,
                        });
                    }
                });
            });
            observer.observe({ type: 'longtask', buffered: true });

            // Calculate TBT after page is interactive
            setTimeout(() => {
                let totalBlockingTime = 0;
                this.tbtData.longTasks.forEach((task) => {
                    if (task.duration > 50) {
                        totalBlockingTime += task.duration - 50;
                    }
                });
                this.metrics.TBT = totalBlockingTime / 1000;
                console.log('✅ TBT:', this.metrics.TBT.toFixed(2) + 's');
                console.log('   Long tasks:', this.tbtData.longTasks.length);
                resolve(this.metrics.TBT);
            }, 5000);
        });
    }

    // Measure Cumulative Layout Shift
    measureCLS() {
        return new Promise((resolve) => {
            let clsValue = 0;
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    // Only count layout shifts without recent user input
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                this.metrics.CLS = clsValue;
            });
            observer.observe({ type: 'layout-shift', buffered: true });

            // Observe for a while, then resolve
            setTimeout(() => {
                console.log('✅ CLS:', this.metrics.CLS.toFixed(3));
                resolve(this.metrics.CLS);
            }, 5000);
        });
    }

    // Get status for each metric
    getStatus(metric, value) {
        const thresholds = {
            LCP: { good: 2.5, needsImprovement: 4.0 },
            FCP: { good: 1.8, needsImprovement: 3.0 },
            TTFB: { good: 0.8, needsImprovement: 1.8 },
            TBT: { good: 0.2, needsImprovement: 0.6 },
            CLS: { good: 0.1, needsImprovement: 0.25 },
        };

        const t = thresholds[metric];
        if (value <= t.good) return '🟢 Good';
        if (value <= t.needsImprovement) return '🟡 Needs Improvement';
        return '🔴 Critical';
    }

    // Run all measurements
    async measureAll() {
        console.log('🚀 Starting Web Vitals measurement...\n');

        // Measure TTFB immediately
        this.measureTTFB();

        // Wait for paint metrics
        await this.measureFCP();

        // Run LCP, TBT, and CLS in parallel
        await Promise.all([
            this.measureLCP(),
            this.measureTBT(),
            this.measureCLS(),
        ]);

        this.displayResults();
        return this.metrics;
    }

    // Display formatted results
    displayResults() {
        console.log('\n📊 Web Vitals Results:');
        console.log('━'.repeat(60));

        Object.entries(this.metrics).forEach(([metric, value]) => {
            if (value !== null) {
                const status = this.getStatus(metric, value);
                const unit = metric === 'CLS' ? '' : 's';
                console.log(`${metric.padEnd(6)} | ${value.toFixed(metric === 'CLS' ? 3 : 2)}${unit.padEnd(2)} | ${status}`);
            }
        });

        console.log('━'.repeat(60));
    }

    // Export as markdown table
    exportAsMarkdown() {
        let markdown = '| Metric | Measured Value | Status |\n';
        markdown += '| :--- | :--- | :--- |\n';

        const metricNames = {
            LCP: 'LCP (Largest Contentful Paint)',
            FCP: 'FCP (First Contentful Paint)',
            TTFB: 'TTFB (Time to First Byte)',
            TBT: 'TBT (Total Blocking Time)',
            CLS: 'CLS (Cumulative Layout Shift)',
        };

        Object.entries(this.metrics).forEach(([metric, value]) => {
            if (value !== null) {
                const name = metricNames[metric];
                const unit = metric === 'CLS' ? '' : 's';
                const status = this.getStatus(metric, value).replace(/[🟢🟡🔴] /, '');
                markdown += `| **${name}** | ${value.toFixed(metric === 'CLS' ? 3 : 2)}${unit} | ${status} |\n`;
            }
        });

        console.log('\n📝 Markdown Table:\n');
        console.log(markdown);
        return markdown;
    }
}

// Usage:
// const monitor = new WebVitalsMonitor();
// monitor.measureAll().then(metrics => {
//   monitor.exportAsMarkdown();
// });

// Auto-run if in browser
if (typeof window !== 'undefined') {
    window.WebVitalsMonitor = WebVitalsMonitor;
    console.log('💡 Usage: const monitor = new WebVitalsMonitor(); await monitor.measureAll();');
}
