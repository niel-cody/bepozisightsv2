import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Conversation } from "@shared/schema";

export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { title: string }) => {
      const response = await apiRequest("POST", "/api/conversations", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/conversations/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });
}

export function useConversationMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: ["/api/chat/messages", conversationId],
    queryFn: conversationId 
      ? async () => {
          const response = await fetch(`/api/chat/messages/${conversationId}`);
          if (!response.ok) throw new Error('Failed to fetch messages');
          return response.json();
        }
      : undefined,
    enabled: !!conversationId,
  });
}