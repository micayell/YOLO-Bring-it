import { useEffect, useRef, useState } from "react";
import { useUserLoginStore } from "@/app/stores/userStore";
import SockJS from "sockjs-client";
import { Client, Stomp } from "@stomp/stompjs";
import apiClient from "@/shared/services/api";


interface ChatMessage {
  senderId: number;
  receiverId: number;
  content: string;
  regDt?: string | Date;
}

interface ChatWindowProps {
  peerId: number;
  nickname: string;
  onClose: () => void;
}

const WS_ENDPOINT = 'https://i13c207.p.ssafy.io/ws-chat';

export default function ChatWindow({ peerId }: ChatWindowProps) {
  const user = useUserLoginStore((state) => state.userData);
  const myId = user?.memberUid;
  const accessToken = user?.accessToken;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const stompClient = useRef<Client | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  if (!myId || !accessToken) {
    console.warn("❌ myId 또는 accessToken 없음 - ChatWindow 렌더링 중지");
    return null;
  }

   // 1) 과거 히스토리 불러오기
  const loadHistory = async () => {
    try {
      const res = await apiClient.get(`/users/messages/${peerId}/history?size=30`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.status !== 200) throw new Error(`History load error: ${res.status}`);
      const body = res.data;
      const list = body.data;

      const formattedMessages = list
        .reverse()
        .map((item: any): ChatMessage => {
          const [y, m, d, h, mi, s, nano] = item.regDt;
          return {
            ...item,
            regDt: new Date(y, m - 1, d, h, mi, s, Math.floor(nano / 1e6)),
          };
        });

      setMessages(formattedMessages);
      console.log("❌ 히스토리 로드 실패:");
    } catch (err) {
      console.error("❌ 히스토리 로드 실패:", err);
    }
  };


    // 2) WebSocket 연결
    const connectWebSocket = () => {
        const socket = new SockJS(WS_ENDPOINT);
        const client = Stomp.over(socket);

        client.connect(
        { Authorization: accessToken },
        () => {
            console.log("✅ STOMP 연결 성공");

            client.subscribe(
            `/queue/relay.chat-user-${myId}`,
            (message) => {
                const dto = JSON.parse(message.body);
                dto.regDt = new Date(); // 서버에서 오지 않으면 임시로 설정
                setMessages((prev) => [...prev, dto]);
            },
            { Authorization: accessToken }
            );
        },
        (err: any) => {
            console.error("❌ STOMP 연결 실패:", err);
        }
        );

        stompClient.current = client;
    };

    // 3) 메시지 전송
  const sendMessage = () => {
    if (!input.trim() || !stompClient.current?.connected) return;

    const payload = {
      senderId: myId,
      receiverId: peerId,
      content: input,
    };

    stompClient.current.publish({
      destination: "/publish/chat/send",
      headers: { Authorization: accessToken },
      body: JSON.stringify(payload)
    });

    setInput("");
  };

  // 스크롤 아래로 이동
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 초기화
  useEffect(() => {
    loadHistory();
    connectWebSocket();
    return () => {
      stompClient.current?.deactivate();
      console.log("🛑 STOMP 연결 해제");
    };
  }, []);

  return (
    <div className="p-4 max-w-md mx-auto border rounded">
      <div
        id="chatWindow"
        className="h-96 overflow-y-auto bg-gray-100 p-2 mb-2 rounded"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-1 text-sm ${
              msg.senderId === myId ? "text-right text-blue-600" : "text-left text-gray-800"
            }`}
          >
            [{msg.regDt ? new Date(msg.regDt).toLocaleTimeString() : ''}] {msg.content}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="flex">
        <input
          type="text"
          className="flex-grow border p-2 rounded-l"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="bg-blue-500 text-white px-4 rounded-r"
          onClick={sendMessage}
        >
          전송
        </button>
      </div>
    </div>
  );
}
