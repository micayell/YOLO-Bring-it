import { motion } from "framer-motion";
import { Send, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

export interface ChatPanelProps {
  messages: { id: number; user: string; message: string; timestamp: string }[];
  message: string;
  setMessage: (message: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export function ChatPanel({ messages, message, setMessage, onSendMessage, onKeyPress }: ChatPanelProps) {
  return (
    <div className="flex-1 flex flex-col">
      <CardContent className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            className={`flex flex-col text-sm w-full ${msg.user === '나' ? 'items-end' : 'items-start'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={`p-3 rounded-lg max-w-[85%] ${msg.user === '나' ? 'bg-[#6dc4e8] text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
              <div className="font-bold text-sm mb-1">{msg.user}</div>
              <p className="text-sm break-words">{msg.message}</p>
              <div className="text-xs text-slate-500/80 dark:text-slate-400/80 mt-1.5 text-right">{msg.timestamp}</div>
            </div>
          </motion.div>
        ))}
      </CardContent>
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-700/80 flex-shrink-0">
        <div className="flex gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="메시지를 입력하세요"
            className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-300/80 dark:border-slate-600/80 rounded-lg px-4 py-2 text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6dc4e8] transition-all"
          />
          <Button
            onClick={onSendMessage}
            disabled={!message.trim()}
            className="bg-[#6dc4e8] hover:bg-[#57b3d9] text-white font-bold transition-colors"
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ChatSidePanel(props: ChatPanelProps) {
    return (
        <Card className="w-full h-full bg-white/70 dark:bg-card/70 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 shadow-xl flex flex-col rounded-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200/80 dark:border-slate-700/80 flex-shrink-0">
                <h2 className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-xl text-slate-700 dark:text-slate-200">채팅</h2>
            </div>
            <ChatPanel {...props} />
        </Card>
    )
}

export const MobileSheet = ({ children, onClose, title, icon, className }: { children: React.ReactNode, onClose: () => void, title: string, icon: React.ReactNode, className?: string }) => (
    <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-end justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
    >
        <motion.div
            className={`w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-t-3xl flex flex-col shadow-2xl border-t border-gray-200 dark:border-slate-700 max-h-[40vh] ${className}`}
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-between p-4 border-b border-gray-200/80 dark:border-slate-700/80 flex-shrink-0">
                <div className="flex items-center gap-2 font-bold text-lg text-gray-800 dark:text-slate-200">
                    {icon}
                    {title}
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                    <X size={20} />
                </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {children}
            </div>
        </motion.div>
    </motion.div>
); 