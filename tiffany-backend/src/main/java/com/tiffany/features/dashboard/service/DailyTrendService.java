package com.tiffany.features.dashboard.service;

import com.tiffany.features.dashboard.dto.DailyTrendResponse;

public interface DailyTrendService {
    DailyTrendResponse getDailyTrends(int days);
    DailyTrendResponse getLast30DaysTrends();
}
