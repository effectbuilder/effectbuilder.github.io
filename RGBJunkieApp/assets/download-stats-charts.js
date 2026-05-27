/**
 * Chart.js visuals for admin download stats (requires Chart.js + RGBJ_DOWNLOAD_STATS).
 * Charts are created when their container scrolls into view so entrance animations run on reveal.
 */
(function () {
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
    const renderedCanvasIds = new Set();
    let chartObserver = null;
    let pendingJobs = [];
    let currentSummary = null;
    let timelineChart = null;
    let timelineFilterBound = false;
    let timelinePreset = '30';
    let timelineCustom = false;

    function destroyCharts() {
        if (chartObserver) {
            chartObserver.disconnect();
            chartObserver = null;
        }
        chartInstances.forEach(function (chart) {
            chart.destroy();
        });
        chartInstances.length = 0;
        timelineChart = null;
        currentSummary = null;
        timelineCustom = false;
        timelinePreset = '30';
        renderedCanvasIds.clear();
        pendingJobs = [];
    }

    function baseChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeOutQuart',
            },
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

    function utcTodayKey() {
        const end = new Date();
        end.setUTCHours(0, 0, 0, 0);
        return end.toISOString().slice(0, 10);
    }

    function parseDayKey(key) {
        const parts = String(key || '').split('-');
        if (parts.length !== 3) {
            return NaN;
        }
        return Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }

    function formatDayKey(ts) {
        return new Date(ts).toISOString().slice(0, 10);
    }

    function formatDayLabel(key) {
        const parts = key.split('-');
        return parts[1] + '/' + parts[2];
    }

    function dayBounds(byDayList) {
        if (!byDayList || byDayList.length === 0) {
            const today = utcTodayKey();
            return { min: today, max: today };
        }
        const days = byDayList
            .map(function (row) {
                return row.day;
            })
            .sort();
        return { min: days[0], max: days[days.length - 1] };
    }

    function shiftDayKey(key, deltaDays) {
        const ts = parseDayKey(key) + deltaDays * 86400000;
        return formatDayKey(ts);
    }

    function getTimelineDayRows() {
        if (!currentSummary) {
            return [];
        }
        const rows = currentSummary.by_day_all || currentSummary.by_day || [];
        return rows;
    }

    function getSelectedTimelineRange() {
        const fromInput = document.getElementById('rgbj-chart-from');
        const toInput = document.getElementById('rgbj-chart-to');
        const bounds = dayBounds(getTimelineDayRows());
        let start = fromInput && fromInput.value ? fromInput.value : bounds.min;
        let end = toInput && toInput.value ? toInput.value : bounds.max;

        if (parseDayKey(start) > parseDayKey(end)) {
            const swap = start;
            start = end;
            end = swap;
        }

        if (parseDayKey(start) < parseDayKey(bounds.min)) {
            start = bounds.min;
        }
        const today = utcTodayKey();
        if (parseDayKey(end) > parseDayKey(today)) {
            end = today;
        }
        if (parseDayKey(end) < parseDayKey(bounds.min)) {
            end = bounds.max;
        }
        if (parseDayKey(start) > parseDayKey(bounds.max)) {
            start = bounds.min;
        }

        return { start: start, end: end };
    }

    function timelineSeriesForRange(startKey, endKey) {
        const map = new Map();
        getTimelineDayRows().forEach(function (row) {
            map.set(row.day, row.downloads);
        });

        const labels = [];
        const data = [];
        let total = 0;
        let ts = parseDayKey(startKey);
        const endTs = parseDayKey(endKey);

        while (ts <= endTs) {
            const key = formatDayKey(ts);
            const count = map.get(key) || 0;
            labels.push(formatDayLabel(key));
            data.push(count);
            total += count;
            ts += 86400000;
        }

        return { labels: labels, data: data, total: total, start: startKey, end: endKey };
    }

    function updateRangeSummary(series) {
        const node = document.getElementById('rgbj-chart-range-summary');
        if (!node || !series) {
            return;
        }
        const days = series.labels.length;
        node.textContent =
            series.start +
            ' → ' +
            series.end +
            ' · ' +
            days.toLocaleString() +
            (days === 1 ? ' day' : ' days') +
            ' · ' +
            series.total.toLocaleString() +
            ' downloads';
        node.hidden = false;
    }

    function setPresetButtonsActive(preset) {
        document.querySelectorAll('[data-rgbj-range]').forEach(function (btn) {
            const isActive = !timelineCustom && btn.getAttribute('data-rgbj-range') === preset;
            btn.classList.toggle('active', isActive);
        });
    }

    function syncTimelineInputs(startKey, endKey) {
        const fromInput = document.getElementById('rgbj-chart-from');
        const toInput = document.getElementById('rgbj-chart-to');
        if (fromInput) {
            fromInput.value = startKey;
        }
        if (toInput) {
            toInput.value = endKey;
        }
    }

    function initTimelineFilterInputs() {
        const rows = getTimelineDayRows();
        const bounds = dayBounds(rows);
        const fromInput = document.getElementById('rgbj-chart-from');
        const toInput = document.getElementById('rgbj-chart-to');

        if (fromInput) {
            fromInput.min = bounds.min;
            fromInput.max = bounds.max;
        }
        const today = utcTodayKey();
        if (toInput) {
            toInput.min = bounds.min;
            toInput.max = today;
        }

        applyTimelinePreset(timelinePreset, false);
    }

    function applyTimelinePreset(preset, updateChart) {
        timelinePreset = preset;
        timelineCustom = false;
        const bounds = dayBounds(getTimelineDayRows());
        const end = utcTodayKey();
        let start = end;

        if (preset === 'all') {
            start = bounds.min;
        } else {
            const days = Number(preset);
            if (Number.isFinite(days) && days > 0) {
                start = shiftDayKey(end, -(days - 1));
            }
        }

        syncTimelineInputs(start, end);
        setPresetButtonsActive(preset);

        if (updateChart !== false) {
            refreshTimelineChart(true);
        } else {
            const series = timelineSeriesForRange(start, end);
            updateRangeSummary(series);
        }
    }

    function applyTimelineCustomRange() {
        timelineCustom = true;
        setPresetButtonsActive('');
        refreshTimelineChart(true);
    }

    function refreshTimelineChart(animate) {
        const range = getSelectedTimelineRange();
        const series = timelineSeriesForRange(range.start, range.end);
        updateRangeSummary(series);

        if (!timelineChart) {
            return;
        }

        timelineChart.data.labels = series.labels;
        timelineChart.data.datasets[0].data = series.data;
        timelineChart.data.datasets[0].pointRadius = series.labels.length <= 14 ? 4 : 2;
        timelineChart.options.scales.x.ticks.maxTicksLimit =
            series.labels.length <= 14 ? series.labels.length : 12;
        timelineChart.update(animate ? 'active' : 'none');
    }

    function bindTimelineFilter() {
        if (timelineFilterBound) {
            return;
        }
        timelineFilterBound = true;

        document.querySelectorAll('[data-rgbj-range]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                applyTimelinePreset(btn.getAttribute('data-rgbj-range') || '30', true);
            });
        });

        const applyBtn = document.getElementById('rgbj-chart-apply-range');
        if (applyBtn) {
            applyBtn.addEventListener('click', function () {
                applyTimelineCustomRange();
            });
        }

        ['rgbj-chart-from', 'rgbj-chart-to'].forEach(function (id) {
            const input = document.getElementById(id);
            if (!input) {
                return;
            }
            input.addEventListener('change', function () {
                timelineCustom = true;
                setPresetButtonsActive('');
            });
            input.addEventListener('keydown', function (ev) {
                if (ev.key === 'Enter') {
                    ev.preventDefault();
                    applyTimelineCustomRange();
                }
            });
        });
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

        if (timelineChart) {
            timelineChart.destroy();
            const idx = chartInstances.indexOf(timelineChart);
            if (idx >= 0) {
                chartInstances.splice(idx, 1);
            }
            timelineChart = null;
        }

        currentSummary = summary;
        const range = getSelectedTimelineRange();
        const series = timelineSeriesForRange(range.start, range.end);
        updateRangeSummary(series);

        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
        gradient.addColorStop(0.55, 'rgba(167, 139, 250, 0.12)');
        gradient.addColorStop(1, 'rgba(167, 139, 250, 0)');

        const options = baseChartOptions();
        options.plugins.legend.display = false;
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

        timelineChart = new Chart(ctx, {
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
                        pointRadius: series.labels.length <= 14 ? 4 : 2,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#0a1628',
                        pointBorderColor: 'rgba(0, 240, 255, 1)',
                        pointBorderWidth: 2,
                        borderWidth: 2.5,
                    },
                ],
            },
            options: options,
        });
        chartInstances.push(timelineChart);
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

    function buildChartJobs(summary) {
        const fileRows = (summary.by_file || []).map(function (row) {
            return {
                file_name: row.file_name,
                downloads: row.downloads,
            };
        });

        return [
            {
                canvasId: 'rgbj-chart-timeline',
                render: function () {
                    renderTimeline(summary);
                },
            },
            {
                canvasId: 'rgbj-chart-channel',
                render: function () {
                    renderDoughnut('rgbj-chart-channel', summary.by_channel || [], 'channel', channelLabel);
                },
            },
            {
                canvasId: 'rgbj-chart-platform',
                render: function () {
                    renderDoughnut('rgbj-chart-platform', summary.by_platform || [], 'platform', platformLabel);
                },
            },
            {
                canvasId: 'rgbj-chart-country',
                render: function () {
                    renderHorizontalBar(
                        'rgbj-chart-country',
                        summary.by_country || [],
                        'country',
                        function (row) {
                            return row.country;
                        },
                        8
                    );
                },
            },
            {
                canvasId: 'rgbj-chart-files',
                render: function () {
                    renderHorizontalBar(
                        'rgbj-chart-files',
                        fileRows,
                        'file_name',
                        function (row) {
                            return shortFileLabel(row.file_name);
                        },
                        10
                    );
                },
            },
        ];
    }

    function observeTarget(target, job) {
        if (!target || renderedCanvasIds.has(job.canvasId)) {
            return;
        }
        chartObserver.observe(target);
    }

    function runChartJob(job) {
        if (renderedCanvasIds.has(job.canvasId)) {
            return;
        }
        renderedCanvasIds.add(job.canvasId);

        const canvas = document.getElementById(job.canvasId);
        const wrap = canvas ? canvas.closest('.rgbj-stats-chart-wrap') : null;
        if (wrap) {
            wrap.classList.add('rgbj-stats-chart-wrap--visible');
        }

        job.render();
    }

    function observeCharts(jobs) {
        pendingJobs = jobs;

        if (typeof Chart === 'undefined') {
            return;
        }

        if (!('IntersectionObserver' in window)) {
            jobs.forEach(runChartJob);
            return;
        }

        chartObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) {
                        return;
                    }
                    const canvas = entry.target.querySelector('canvas');
                    const canvasId = canvas ? canvas.id : '';
                    const job = pendingJobs.find(function (j) {
                        return j.canvasId === canvasId;
                    });
                    if (!job) {
                        return;
                    }
                    runChartJob(job);
                    chartObserver.unobserve(entry.target);
                });
            },
            {
                root: null,
                rootMargin: '0px 0px -5% 0px',
                threshold: 0.18,
            }
        );

        jobs.forEach(function (job) {
            const canvas = document.getElementById(job.canvasId);
            if (!canvas) {
                return;
            }
            const wrap = canvas.closest('.rgbj-stats-chart-wrap');
            observeTarget(wrap || canvas, job);
        });
    }

    window.rgbjStatsDestroyCharts = destroyCharts;

    window.rgbjStatsRenderCharts = function (summary) {
        destroyCharts();

        if (!summary || typeof Chart === 'undefined') {
            return;
        }

        currentSummary = summary;
        bindTimelineFilter();
        initTimelineFilterInputs();

        observeCharts(buildChartJobs(summary));
    };
})();
