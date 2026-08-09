import React, { useEffect, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import axios from 'axios';
import './Heatmap.css';

const API_URL = 'http://localhost:5000';

function Heatmap({ userId, showToast, onDayClick }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // -----------------------------------
    // AUTH HEADER
    // -----------------------------------

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');

        if (!token) {
            console.error('No auth token found in localStorage!');

            if (showToast) {
                showToast('Please log in again.', 'error');
            }

            return null;
        }

        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    };

    // -----------------------------------
    // DATE HELPERS
    // -----------------------------------

    const getMonthRange = (date) => {
        const start = new Date(
            date.getFullYear(),
            date.getMonth(),
            1
        );

        const end = new Date(
            date.getFullYear(),
            date.getMonth() + 1,
            0
        );

        return { start, end };
    };

    // IMPORTANT:
    // Don't use toISOString() here because
    // it converts local time to UTC.
    const formatDate = (date) => {
        const year = date.getFullYear();

        const month = String(
            date.getMonth() + 1
        ).padStart(2, '0');

        const day = String(
            date.getDate()
        ).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    // -----------------------------------
    // MONTH NAVIGATION
    // -----------------------------------

    const goToPreviousMonth = () => {
        setCurrentMonth(
            prev =>
                new Date(
                    prev.getFullYear(),
                    prev.getMonth() - 1,
                    1
                )
        );
    };

    const goToNextMonth = () => {
        setCurrentMonth(
            prev =>
                new Date(
                    prev.getFullYear(),
                    prev.getMonth() + 1,
                    1
                )
        );
    };

    const goToToday = () => {
        setCurrentMonth(new Date());
    };

    // -----------------------------------
    // FETCH HEATMAP DATA
    // -----------------------------------

    const fetchHeatmapData = async () => {
        if (!userId) return;

        setLoading(true);

        try {
            const { start, end } =
                getMonthRange(currentMonth);

            const startDate = formatDate(start);
            const endDate = formatDate(end);

            const authHeader = getAuthHeader();

            if (!authHeader) {
                return;
            }

            const response = await axios.get(
                `${API_URL}/notes/heatmap`,
                {
                    params: {
                        userId: userId,
                        startDate: startDate,
                        endDate: endDate,
                    },
                    ...authHeader,
                }
            );

            const heatmapData =
                response.data.map(item => ({
                    date: item.date,
                    count: item.count,
                }));

            setData(heatmapData);

        } catch (err) {

            console.error(
                'Error fetching the heatmap:',
                err
            );

            if (showToast) {
                showToast(
                    'Failed to load the Heatmap.',
                    'error'
                );
            }

        } finally {
            setLoading(false);
        }
    };

    // -----------------------------------
    // FETCH WHEN MONTH / USER CHANGES
    // -----------------------------------

    useEffect(() => {
        if (userId) {
            fetchHeatmapData();
        }
    }, [userId, currentMonth]);

    if (!userId) {
        return null;
    }

    // -----------------------------------
    // DAY CLICK
    // -----------------------------------

    const handleDayClick = (value) => {
        if (!value || !value.date) {
            return;
        }

        if (onDayClick) {
            onDayClick(value.date);
        } else {
            console.log(
                `Day clicked: ${value.date}, ${value.count || 0} notes`
            );
        }
    };

    // -----------------------------------
    // CURRENT MONTH INFORMATION
    // -----------------------------------

    const { start, end } =
        getMonthRange(currentMonth);

    const monthName =
        currentMonth.toLocaleString(
            'default',
            {
                month: 'long',
                year: 'numeric',
            }
        );

    const isCurrentMonth = () => {
        const today = new Date();

        return (
            currentMonth.getMonth() ===
                today.getMonth() &&
            currentMonth.getFullYear() ===
                today.getFullYear()
        );
    };

    // -----------------------------------
    // RENDER
    // -----------------------------------

    return (
        <div className="w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm my-6 overflow-hidden">

            {/* ============================
                HEADER
            ============================ */}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3">

                {/* Title */}

                <div>
                    <div className="flex items-center gap-2">

                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <span className="text-indigo-600 text-sm">
                                📊
                            </span>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Activity Heatmap
                            </h3>

                            <p className="text-xs text-slate-400 mt-0.5">
                                Your note-taking activity
                            </p>
                        </div>

                    </div>
                </div>

                {/* ============================
                    NAVIGATION
                ============================ */}

                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">

                    {/* Previous */}

                    <button
                        onClick={goToPreviousMonth}
                        className="w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm transition-all text-slate-500 hover:text-indigo-600 flex items-center justify-center"
                        title="Previous month"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>

                    {/* Month */}

                    <span className="text-xs font-bold text-slate-700 min-w-[120px] text-center">
                        {monthName}
                    </span>

                    {/* Next */}

                    <button
                        onClick={goToNextMonth}
                        className="w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm transition-all text-slate-500 hover:text-indigo-600 flex items-center justify-center"
                        title="Next month"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>

                    {/* Today */}

                    {!isCurrentMonth() && (
                        <button
                            onClick={goToToday}
                            className="ml-1 px-2.5 py-1.5 text-[11px] font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-all"
                        >
                            Today
                        </button>
                    )}

                </div>
            </div>


            {/* ============================
                LEGEND
            ============================ */}

            <div className="heatmap-legend">

                <span>Less</span>

                <span className="heatmap-legend-square heatmap-legend-0"></span>
                <span className="heatmap-legend-square heatmap-legend-1"></span>
                <span className="heatmap-legend-square heatmap-legend-2"></span>
                <span className="heatmap-legend-square heatmap-legend-3"></span>
                <span className="heatmap-legend-square heatmap-legend-4"></span>
                <span className="heatmap-legend-square heatmap-legend-5"></span>

                <span>More</span>

            </div>


            {/* ============================
                HEATMAP
            ============================ */}

            {loading ? (

                <div className="text-center py-8 text-slate-400 text-sm">
                    Loading heatmap data...
                </div>

            ) : data.length === 0 ? (

                <div className="heatmap-empty">
                    No activity for {monthName}.
                    Start creating notes!
                </div>

            ) : (

                <div className="custom-heatmap">

                    <CalendarHeatmap
                        startDate={start}
                        endDate={end}
                        values={data}

                        classForValue={(value) => {

                            if (
                                !value ||
                                value.count === 0
                            ) {
                                return 'heat-0';
                            }

                            if (value.count === 1) {
                                return 'heat-1';
                            }

                            if (value.count === 2) {
                                return 'heat-2';
                            }

                            if (value.count === 3) {
                                return 'heat-3';
                            }

                            if (value.count <= 5) {
                                return 'heat-4';
                            }

                            return 'heat-5';
                        }}

                        titleForValue={(value) => {

                            if (
                                !value ||
                                value.count === 0
                            ) {
                                return `No notes on ${
                                    value?.date ||
                                    'this day'
                                }`;
                            }

                            return `${value.count} note(s) on ${value.date}`;
                        }}

                        onClick={handleDayClick}

                        showWeekdayLabels={true}

                        weekdayLabels={[
                            'Sun',
                            'Mon',
                            'Tue',
                            'Wed',
                            'Thu',
                            'Fri',
                            'Sat',
                        ]}
                    />

                </div>
            )}


            {/* ============================
                MONTH STATS
            ============================ */}

            {!loading && data.length > 0 && (

                <div className="mt-5 pt-4 border-t border-slate-100">

                    <div className="grid grid-cols-2 gap-3">

                        {/* Total Notes */}

                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">

                            <div className="flex items-center gap-2">

                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                    <span className="text-sm">
                                        📝
                                    </span>
                                </div>

                                <div>

                                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                                        Total Notes
                                    </p>

                                    <p className="text-lg font-bold text-slate-800">
                                        {data.reduce(
                                            (sum, item) =>
                                                sum +
                                                item.count,
                                            0
                                        )}
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* Active Days */}

                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">

                            <div className="flex items-center gap-2">

                                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                                    <span className="text-sm">
                                        📅
                                    </span>
                                </div>

                                <div>

                                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                                        Active Days
                                    </p>

                                    <p className="text-lg font-bold text-slate-800">
                                        {data.filter(
                                            item =>
                                                item.count > 0
                                        ).length}
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                    <p className="text-center text-[10px] text-slate-400 mt-3">
                        Click any day to view your notes
                    </p>

                </div>

            )}

        </div>
    );
}

export default Heatmap;