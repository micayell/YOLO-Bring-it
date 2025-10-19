import apiClient from './api';
import { authService } from './authService';

class ChatService {
  async getChatHistory(peerId: number, cursor?: string, size: number = 20) {
    try {
      const headers = authService.getAuthHeaders();
      const response = await apiClient.get(
        `/chats/${peerId}/history`,
        {
          headers,
          params: {
            cursor,
            size,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get chat history:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
