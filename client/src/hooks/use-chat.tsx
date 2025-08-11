import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
  userId?: string;
}

interface ChatResponse {
  message: ChatMessage;
  data?: any;
}

export function useChat() {
  const [isTyping, setIsTyping] = useState(false);
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation<ChatResponse, Error, { message: string }>({
    mutationFn: async ({ message }) => {
      const response = await apiRequest("POST", "/api/chat/message", {
        message,
        userId: null
      });
      return await response.json();
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
    },
  });

  const sendMessage = useCallback((message: string) => {
    if (!message.trim()) return;
    sendMessageMutation.mutate({ message: message.trim() });
  }, [sendMessageMutation]);

  return {
    sendMessage,
    isTyping: isTyping || sendMessageMutation.isPending,
    isLoading: sendMessageMutation.isPending,
    error: sendMessageMutation.error,
  };
}
