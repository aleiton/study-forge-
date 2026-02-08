import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export interface Topic {
  id: string;
  type: string;
  attributes: {
    name: string;
    category: "academy" | "industry";
    subcategory: string | null;
    description: string | null;
    decay_rate: number;
    last_practiced_at: string | null;
    proficiency_level: string;
    freshness_score: number;
    freshness_label: string;
    created_at: string;
    updated_at: string;
  };
}

interface TopicParams {
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  parent_topic_id?: number | null;
  decay_rate?: number;
  proficiency_level?: string;
}

function extractTopics(data: { data: Topic[] }): Topic[] {
  return data.data;
}

export function useTopics(filters?: {
  category?: string;
  subcategory?: string;
  root_only?: boolean;
}) {
  return useQuery({
    queryKey: ["topics", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category) params.set("category", filters.category);
      if (filters?.subcategory) params.set("subcategory", filters.subcategory);
      if (filters?.root_only) params.set("root_only", "true");
      const { data } = await apiClient.get(`/topics?${params}`);
      return extractTopics(data);
    },
  });
}

export function useTopic(id: string) {
  return useQuery({
    queryKey: ["topics", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/topics/${id}`);
      return data.data as Topic;
    },
    enabled: !!id,
  });
}

export function useCreateTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: TopicParams) => {
      const { data } = await apiClient.post("/topics", { topic: params });
      return data.data as Topic;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
  });
}

export function useUpdateTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...params }: TopicParams & { id: string }) => {
      const { data } = await apiClient.patch(`/topics/${id}`, {
        topic: params,
      });
      return data.data as Topic;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
  });
}

export function useDeleteTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/topics/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
  });
}

export function useRustyTopics() {
  return useQuery({
    queryKey: ["topics", "rusty"],
    queryFn: async () => {
      const { data } = await apiClient.get("/topics/rusty");
      return extractTopics(data);
    },
  });
}
