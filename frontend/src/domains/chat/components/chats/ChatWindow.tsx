import { useEffect, useRef, useState } from "react";
import { useUserLoginStore } from "@/domains/user/stores/userStore";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { X, Send } from "lucide-react";
import { chatService } from "@/domains/chat/services/chatService";
import { WS_BASE_URL } from "@/shared/services/api";

interface ChatMessage {
  senderId: number;
  receiverId: number;
  content: string;
  regDt?: string | Date;
  messageUid?: string;
}

interface ChatWindowProps {
  peerId: number;
  nickname: string;
  onClose: () => void;
}

const WS_ENDPOINT = `${WS_BASE_URL}/ws-chat`;

export default function ChatWindow({ peerId, nickname, onClose }: ChatWindowProps) {
  const user = useUserLoginStore((state) => state.userData);
  const myId = user?.memberUid;
  const accessToken = user?.accessToken;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const seenMessages = useRef(new Set<string>());
  const clientRef = useRef<Client | null>(null);

  if (!myId || !accessToken) {
    console.warn("❌ ChatWindow 렌더링 중지: myId 또는 accessToken 없음");
    return null;
  }

  const formatKST = (date: Date | string): string => {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      console.error("🚫 유효하지 않은 날짜:", date);
      return new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
    }
    return d.toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const loadHistory = async () => {
    try {
      const history = await chatService.getChatHistory(peerId, undefined, 30);

      if (!Array.isArray(history.data)) {
        console.error("history.data가 배열이 아닙니다:", history.data);
        return;
      }

      const formatted = history.data.reverse().map((item: any) => {
        const utcDate = new Date(item.regDt);
        if (isNaN(utcDate.getTime())) {
          console.error("🚫 유효하지 않은 히스토리 regDt:", item.regDt);
          return { ...item, regDt: new Date() };
        }
        const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
        if (item.messageUid) seenMessages.current.add(item.messageUid);
        return {
          ...item,
          regDt: kstDate,
        };
      });

      setMessages(formatted);
      console.log("📜 히스토리 불러오기 완료:", formatted);
    } catch (err) {
      console.error("❌ 히스토리 로드 실패:", err);
    }
  };

  useEffect(() => {
    if (!myId || !accessToken) return;

    console.log("🧩 WebSocket 연결 시도");
    loadHistory();

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_ENDPOINT),
      connectHeaders: { Authorization: `Bearer ${accessToken}` },
      debug: (msg) => console.log("💬 STOMP Debug:", msg),
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      reconnectDelay: 1000,
      onConnect: () => {
        console.log("✅ STOMP 연결 성공");
        client.subscribe(
          `/queue/chat-user-${myId}`,
          (msg) => {
            const dto = JSON.parse(msg.body);
            console.log("📥 수신 메시지:", dto);
            if (dto.messageUid && seenMessages.current.has(dto.messageUid)) {
              console.log("🚫 중복 메시지 무시:", dto.messageUid);
              return;
            }
            if (dto.messageUid) seenMessages.current.add(dto.messageUid);
            const utcDate = new Date(dto.regDt);
            if (isNaN(utcDate.getTime())) {
              console.error("🚫 유효하지 않은 regDt:", dto.regDt);
              dto.regDt = new Date();
            } else {
              dto.regDt = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
            }
            setMessages((prev) => [...prev.filter((m) => m.messageUid !== dto.messageUid), dto]);
          },
          { Authorization: `Bearer ${accessToken}` }
        );
      },
      onStompError: (frame) => console.error("🔴 STOMP 에러 발생", frame),
      onWebSocketError: (error) => console.error("🔌 WebSocket 연결 에러", error),
      onDisconnect: () => {
        console.log("📴 STOMP 연결 해제 완료");
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      console.log("🛑 연결 종료");
      clientRef.current?.deactivate();
      clientRef.current = null;
    };
  }, [accessToken, myId, peerId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 모의 타이핑 인디케이터 (실제 구현은 서버에서 타이핑 이벤트 필요)
  useEffect(() => {
    const timer = setTimeout(() => setIsTyping(false), 3000);
    return () => clearTimeout(timer);
  }, [input]);

  const handleSend = () => {
    console.log("✉️ handleSend 실행됨");

    const trimmed = input.trim();
    if (!trimmed) return;

    const stompClient = clientRef.current;
    if (!stompClient?.connected) {
      console.warn("⛔ stompClient 연결 안 됨", stompClient?.connected);
      return;
    }

    const payload: ChatMessage = {
      senderId: myId,
      receiverId: peerId,
      content: trimmed,
    };

    console.log("🔼 전송 시도됨:", payload);

    stompClient.publish({
      destination: "/publish/chat/send",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(payload),
    });

    console.log("✅ 메시지 전송됨");
    setInput("");
    setIsTyping(true); // 모의 타이핑 이벤트
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-4 w-[400px] sm:w-[500px] h-[500px] shadow-2xl flex flex-col font-sans">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-300 pb-2 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            {nickname[0].toUpperCase()}
          </div>
          <h2 className="text-lg font-semibold text-gray-800">{nickname}님과의 대화</h2>
        </div>
        <X className="cursor-pointer text-gray-500 hover:text-gray-700" onClick={onClose} />
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto mb-4 px-2 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.messageUid ?? `temp-${msg.senderId}-${msg.regDt}`}
            className={`flex ${msg.senderId === myId ? "justify-end" : "justify-start"} mb-2`}
          >
            <div className={`flex items-start space-x-2 max-w-[75%] ${msg.senderId === myId ? "flex-row-reverse space-x-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${msg.senderId === myId ? "bg-blue-500" : "bg-green-500"}`}>
                {msg.senderId === myId ? "나" : nickname[0].toUpperCase()}
              </div>
              <div>
                <div
                  className={`p-3 rounded-lg shadow-sm ${
                    msg.senderId === myId
                      ? "bg-blue-100 text-blue-900 rounded-br-none"
                      : "bg-green-100 text-green-900 rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-xs text-gray-500 mt-1 block">
                  {formatKST(msg.regDt ?? "")}
                </span>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start mb-2">
            <div className="bg-gray-200 p-3 rounded-lg max-w-[75%]">
              <span className="text-gray-500 text-sm animate-pulse">입력 중...</span>
            </div>
          </div>
        )}
        <div ref={messageEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-inner">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요"
          className="flex-1 border-none rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full flex items-center justify-center"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
