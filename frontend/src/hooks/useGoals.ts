import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export interface AnnualGoal {
  id: string;
  type: string;
  attributes: {
    year: number;
    title: string;
    description: string | null;
    goal_type: "academy" | "industry" | "certification" | "general";
    status: "not_started" | "in_progress" | "completed" | "abandoned";
    progress_pct: number;
    target_date: string | null;
    monthly_plan_items_count: number;
    created_at: string;
    updated_at: string;
  };
}

interface GoalParams {
  year: number;
  title: string;
  description?: string;
  goal_type: string;
  status?: string;
  progress_pct?: number;
  target_date?: string;
}

function extractGoals(data: { data: AnnualGoal[] }): AnnualGoal[] {
  return data.data;
}

export function useGoals(filters?: { year?: number; status?: string }) {
  return useQuery({
    queryKey: ["goals", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.year) params.set("year", String(filters.year));
      if (filters?.status) params.set("status", filters.status);
      const { data } = await apiClient.get(`/annual_goals?${params}`);
      return extractGoals(data);
    },
  });
}

export function useGoal(id: string) {
  return useQuery({
    queryKey: ["goals", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/annual_goals/${id}`);
      return data.data as AnnualGoal;
    },
    enabled: !!id,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: GoalParams) => {
      const { data } = await apiClient.post("/annual_goals", {
        annual_goal: params,
      });
      return data.data as AnnualGoal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...params }: GoalParams & { id: string }) => {
      const { data } = await apiClient.patch(`/annual_goals/${id}`, {
        annual_goal: params,
      });
      return data.data as AnnualGoal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/annual_goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}
