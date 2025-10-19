import { useChatStore } from "@/app/stores/chatStore";
import ChatWindow from "@/components/chats/ChatWindow";
import { AnimatePresence, motion } from "framer-motion";

export const ChatModalWrapper = () => {
  const chatModal = useChatStore((state) => state.chatModal);
  const closeChat = useChatStore((state) => state.closeChat);

  if (!chatModal?.open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="chat-modal"
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <ChatWindow
          peerId={chatModal.peerId}
          nickname={chatModal.nickname}
          onClose={closeChat}
        />
      </motion.div>
    </AnimatePresence>
  );
};
