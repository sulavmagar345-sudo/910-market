import { create } from 'zustand';
import type { AnalyticsSummary, RevenueDataPoint } from '../types';
import {
  mockAnalyticsSummary,
  mockRevenueData,
  mockRecentActivity,
  mockExtendedSummary,
  mockSparklines,
} from '../data/mock-dashboard';

interface DashboardStore {
  summary: AnalyticsSummary | null;
  extendedSummary: typeof mockExtendedSummary | null;
  sparklines: typeof mockSparklines | null;
  revenueData: RevenueDataPoint[];
  recentActivity: typeof mockRecentActivity;
  isLoading: boolean;
  error: string | null;
  fetchDashboardData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  summary: null,
  extendedSummary: null,
  sparklines: null,
  revenueData: [],
  recentActivity: [],
  isLoading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      set({
        summary: mockAnalyticsSummary,
        extendedSummary: mockExtendedSummary,
        sparklines: mockSparklines,
        revenueData: mockRevenueData,
        recentActivity: mockRecentActivity,
        isLoading: false,
      });
    } catch {
      set({ error: 'Failed to load dashboard data', isLoading: false });
    }
  },
}));
