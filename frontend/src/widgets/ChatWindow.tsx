import { motion } from "framer-motion";
import { X, Send } from "lucide-react";
import { OptimizedImage } from "@/shared/ui/OptimizedImage";
import { useState, useEffect, useRef } from "react";
import { useChatWebSocket } from "@/shared/hooks/useChatWebSocket";
import { useUserLoginStore } from "@/app/stores/userStore";
import apiClient from "@/shared/services/api";

interface Message {
  id: number | string;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
}

interface Friend {
  id: string; // memberUid
  name: string;
  avatar: string;
}

interface ChatWindowProps {
  friend: Friend;
  onClose: () => void;
}

export function ChatWindow({ friend, onClose }: ChatWindowProps) {
  const { userData } = useUserLoginStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1:1 채팅 메시지 수신 처리
  const { isConnected, sendMessage } = useChatWebSocket({
    onChatMessage: (newMessage) => {
      // 메시지가 현재 채팅방과 관련된 것인지 확인
      const friendIdNum = Number(friend.id);
      if (
        (newMessage.senderId === userData?.memberUid && newMessage.receiverId === friendIdNum) ||
        (newMessage.senderId === friendIdNum && newMessage.receiverId === userData?.memberUid)
      ) {
        setMessages((prev) => [...prev, newMessage]);
      }
    },
    onError: (error) => {
      console.error("Chat WebSocket Error:", error);
      // 여기에 사용자에게 에러를 알리는 UI 로직을 추가할 수 있습니다.
    },
  });

  // 이전 채팅 내역 불러오기
  useEffect(() => {
    const fetchHistory = async () => {
      if (!userData || !friend.id) return;
      try {
        const response = await apiClient.get(`/chats/history/${friend.id}`);
        const history = response.data.data.map((msg: any) => ({
          ...msg,
          id: msg.messageId, // 고유 ID 필드 맞추기
        }));
        setMessages(history);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      }
    };
    fetchHistory();
  }, [friend.id, userData]);

  // 메시지 목록이 업데이트될 때마다 맨 아래로 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !userData || !isConnected) return;

    sendMessage(Number(friend.id), newMessage.trim());
    setNewMessage("");
  };

  return (
    <motion.div
      className="fixed bottom-4 right-4 w-96 h-[500px] bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-border/30 flex flex-col overflow-hidden z-20"
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      drag
      dragConstraints={{ top: -200, left: -400, right: 4, bottom: 4 }}
      dragMomentum={false}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-border/20 cursor-move">
        <div className="flex items-center gap-3">
          <OptimizedImage
            src={friend.avatar}
            alt={friend.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-bold text-foreground">{friend.name}</h3>
            <p className="text-xs text-green-500">온라인</p>
          </div>
        </div>
        <motion.button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-black/10"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </motion.button>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${msg.senderId === userData?.memberUid ? 'justify-end' : 'justify-start'}`}
            >
              {msg.senderId !== userData?.memberUid && (
                <OptimizedImage src={friend.avatar} alt={friend.name} className="w-8 h-8 rounded-full" />
              )}
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl ${
                  msg.senderId === userData?.memberUid
                    ? 'bg-[#6dc4e8] text-white rounded-br-none'
                    : 'bg-gray-200 text-foreground rounded-bl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* 입력 폼 */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border/20">
        <div className="relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지 입력..."
            className="w-full bg-black/5 rounded-full pl-4 pr-12 py-2 focus:outline-none focus:ring-2 focus:ring-[#6dc4e8]"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#6dc4e8] rounded-full flex items-center justify-center text-white"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </motion.div>
  );
} 