import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export interface ReviewSession {
  id: string;
  type: string;
  attributes: {
    scheduled_date: string;
    completed_date: string | null;
    quality_rating: number | null;
    interval_days: number;
    ease_factor: number;
    repetition_number: number;
    status: "scheduled" | "completed" | "missed" | "skipped";
    notes: string | null;
    topic_name: string;
    created_at: string;
    updated_at: string;
  };
}

function extractSessions(data: { data: ReviewSession[] }): ReviewSession[] {
  return data.data;
}

export function useReviews(filters?: { status?: string; topic_id?: string }) {
  return useQuery({
    queryKey: ["reviews", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.set("status", filters.status);
      if (filters?.topic_id) params.set("topic_id", filters.topic_id);
      const { data } = await apiClient.get(`/review_sessions?${params}`);
      return extractSessions(data);
    },
  });
}

export function useUpcomingReviews(days: number = 7) {
  return useQuery({
    queryKey: ["reviews", "upcoming", days],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/review_sessions/upcoming?days=${days}`
      );
      return extractSessions(data);
    },
  });
}

export function useCreateReview(topicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post(
        `/topics/${topicId}/review_sessions`
      );
      return data.data as ReviewSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
  });
}

export function useCompleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      quality_rating,
    }: {
      id: string;
      quality_rating: number;
    }) => {
      const { data } = await apiClient.post(
        `/review_sessions/${id}/complete`,
        { quality_rating }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...params
    }: {
      id: string;
      scheduled_date?: string;
      notes?: string;
    }) => {
      const { data } = await apiClient.patch(`/review_sessions/${id}`, {
        review_session: params,
      });
      return data.data as ReviewSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}
