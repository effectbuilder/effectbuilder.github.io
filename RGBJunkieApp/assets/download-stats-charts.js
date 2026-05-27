/**
 * Chart.js visuals for admin download stats (requires Chart.js + RGBJ_DOWNLOAD_STATS).
 */
(function () {
    const cfg = window.RGBJ_DOWNLOAD_STATS || {};
    const DAYS = cfg.days || 30;

    const PALETTE = [
        'rgba(0, 240, 255, 0.9)',
        'rgba(167, 139, 250, 0.9)',
        'rgba(56, 189, 248, 0.85)',
        'rgba(244, 114, 182, 0.85)',
        'rgba(52, 211, 153, 0.85)',
        'rgba(251, 191, 36, 0.85)',
        'rgba(248, 113, 113, 0.85)',
        'rgba(129, 140, 248, 0.85)',
    ];

    const chartInstances = [];

    function destroyCharts() {
        chartInstances.forEach(function (chart) {
            chart.destroy();
        });
        chartInstances.length = 0;
    }

    function baseChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.78)',
                        font: { family: 'system-ui, sans-serif', size: 11 },
                        padding: 14,
                    },
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 16, 28, 0.92)',
                    borderColor: 'rgba(0, 240, 255, 0.35)',
                    borderWidth: 1,
                    titleColor: '#e2e8f0',
                    bodyColor: '#cbd5e1',
                    padding: 10,
                },
            },
        };
    }

    function axisGridColor() {
        return 'rgba(255, 255, 255, 0.06)';
    }

    function axisTickColor() {
        return 'rgba(255, 255, 255, 0.55)';
    }

    function timelineSeries(byDayList) {
        const map = new Map();
        byDayList.forEach(function (row) {
            map.set(row.day, row.downloads);
        });

        const labels = [];
        const data = [];
        const end = new Date();
        end.setUTCHours(0, 0, 0, 0);

        for (let i = DAYS - 1; i >= 0; i -= 1) {
            const d = new Date(end);
            d.setUTCDate(d.getUTCDate() - i);
            const key = d.toISOString().slice(0, 10);
            const parts = key.split('-');
            labels.push(parts[1] + '/' + parts[2]);
            data.push(map.get(key) || 0);
        }

        return { labels: labels, data: data };
    }

    function shortFileLabel(name) {
        const base = String(name || 'file');
        if (base.length <= 36) {
            return base;
        }
        return base.slice(0, 16) + '…' + base.slice(-18);
    }

    function topEntries(rows, labelKey, limit) {
        return rows
            .slice()
            .sort(function (a, b) {
                return b.downloads - a.downloads;
            })
            .slice(0, limit);
    }

    function renderTimeline(summary) {
        const canvas = document.getElementById('rgbj-chart-timeline');
        if (!canvas || typeof Chart === 'undefined') {
            return;
        }

        const series = timelineSeries(summary.by_day || []);
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
        gradient.addColorStop(0.55, 'rgba(167, 139, 250, 0.12)');
        gradient.addColorStop(1, 'rgba(167, 139, 250, 0)');

        const options = baseChartOptions();
        options.interaction = { mode: 'index', intersect: false };
        options.scales = {
            x: {
                grid: { color: axisGridColor(), drawBorder: false },
                ticks: { color: axisTickColor(), maxRotation: 0, autoSkip: true, maxTicksLimit: 12 },
            },
            y: {
                beginAtZero: true,
                grid: { color: axisGridColor(), drawBorder: false },
                ticks: { color: axisTickColor(), precision: 0 },
            },
        };

        chartInstances.push(
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: series.labels,
                    datasets: [
                        {
                            label: 'Downloads',
                            data: series.data,
                            borderColor: 'rgba(0, 240, 255, 0.95)',
                            backgroundColor: gradient,
                            fill: true,
                            tension: 0.35,
                            pointRadius: series.data.length <= 14 ? 4 : 2,
                            pointHoverRadius: 6,
                            pointBackgroundColor: '#0a1628',
                            pointBorderColor: 'rgba(0, 240, 255, 1)',
                            pointBorderWidth: 2,
                            borderWidth: 2.5,
                        },
                    ],
                },
                options: options,
            })
        );
    }

    function renderDoughnut(canvasId, rows, labelKey, labelFormat) {
        const canvas = document.getElementById(canvasId);
        if (!canvas || typeof Chart === 'undefined') {
            return;
        }

        const sorted = topEntries(rows, labelKey, 8);
        if (sorted.length === 0) {
            return;
        }

        const labels = sorted.map(function (row) {
            return labelFormat(row[labelKey], row);
        });
        const data = sorted.map(function (row) {
            return row.downloads;
        });

        const options = baseChartOptions();
        options.cutout = '62%';
        options.plugins.legend.position = 'bottom';

        chartInstances.push(
            new Chart(canvas.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            data: data,
                            backgroundColor: PALETTE.slice(0, labels.length),
                            borderColor: 'rgba(10, 16, 28, 0.9)',
                            borderWidth: 2,
                            hoverOffset: 8,
                        },
                    ],
                },
                options: options,
            })
        );
    }

    function renderHorizontalBar(canvasId, rows, labelKey, labelFn, limit) {
        const canvas = document.getElementById(canvasId);
        if (!canvas || typeof Chart === 'undefined') {
            return;
        }

        const sorted = topEntries(rows, labelKey, limit).reverse();
        if (sorted.length === 0) {
            return;
        }

        const labels = sorted.map(function (row) {
            return labelFn(row);
        });
        const data = sorted.map(function (row) {
            return row.downloads;
        });

        const barColors = sorted.map(function (_row, i) {
            const t = i / Math.max(sorted.length - 1, 1);
            const r = Math.round(0 + (167 - 0) * t);
            const g = Math.round(240 + (139 - 240) * t);
            const b = Math.round(255 + (250 - 255) * t);
            return 'rgba(' + r + ', ' + g + ', ' + b + ', 0.85)';
        });

        const options = baseChartOptions();
        options.indexAxis = 'y';
        options.plugins.legend.display = false;
        options.scales = {
            x: {
                beginAtZero: true,
                grid: { color: axisGridColor(), drawBorder: false },
                ticks: { color: axisTickColor(), precision: 0 },
            },
            y: {
                grid: { display: false, drawBorder: false },
                ticks: { color: axisTickColor(), font: { size: 10 } },
            },
        };

        chartInstances.push(
            new Chart(canvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Downloads',
                            data: data,
                            backgroundColor: barColors,
                            borderRadius: 6,
                            borderSkipped: false,
                        },
                    ],
                },
                options: options,
            })
        );
    }

    function channelLabel(channel) {
        return channel === 'app-update' ? 'App update' : 'Website';
    }

    function platformLabel(platform) {
        const p = String(platform || 'other');
        if (p === 'windows') {
            return 'Windows';
        }
        if (p === 'linux') {
            return 'Linux';
        }
        if (p === 'other') {
            return 'Other';
        }
        return p.charAt(0).toUpperCase() + p.slice(1);
    }

    window.rgbjStatsDestroyCharts = destroyCharts;

    window.rgbjStatsRenderCharts = function (summary) {
        destroyCharts();

        if (!summary || typeof Chart === 'undefined') {
            return;
        }

        renderTimeline(summary);
        renderDoughnut('rgbj-chart-channel', summary.by_channel || [], 'channel', channelLabel);
        renderDoughnut('rgbj-chart-platform', summary.by_platform || [], 'platform', platformLabel);
        renderHorizontalBar(
            'rgbj-chart-country',
            summary.by_country || [],
            'country',
            function (row) {
                return row.country;
            },
            8
        );

        const fileRows = (summary.by_file || []).map(function (row) {
            return {
                file_name: row.file_name,
                downloads: row.downloads,
            };
        });
        renderHorizontalBar(
            'rgbj-chart-files',
            fileRows,
            'file_name',
            function (row) {
                return shortFileLabel(row.file_name);
            },
            10
        );
    };
})();
