import { useNavigate } from "react-router-dom";
import { useWebSocketStore } from '@/app/stores/websocketStore'; // 변경된 스토어 import
import { useUserLoginStore } from "@/domains/user/stores/userStore";
import apiClient from "@/shared/services/api";
import { Button } from "./button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./dialog";

export function InvitationModal() {
  const { invitation, clearInvitation } = useWebSocketStore(); // useInvitationStore -> useWebSocketStore
  const { userData } = useUserLoginStore();
  const navigate = useNavigate();

  const handleAccept = async () => {
    if (!invitation || !userData?.accessToken || !userData?.memberUid) return;

    try {
      // 초대 수락 API 호출 (헤더는 인터셉터가 처리)
      await apiClient.patch(
        `/games/rooms/${invitation.roomId}/invitation/${invitation.senderId}/accepted`,
        {},
        {
          headers: {
            'X-MEMBER-UID': userData.memberUid.toString(),
          },
        }
      );
      console.log('✅ 초대 수락 성공!');
      
      // 초대 수락 후 해당 게임방으로 화면 전환
      navigate(`/waiting?roomId=${invitation.roomId}`);
      
      clearInvitation();
    } catch (error) {
      console.error('❌ 초대 수락 실패:', error);
      alert('초대 수락에 실패했습니다.');
      clearInvitation();
    }
  };

  const handleDecline = () => {
    console.log('🚫 초대 거절');
    clearInvitation();
  };

  return (
    <Dialog open={!!invitation} onOpenChange={(open) => !open && clearInvitation()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>게임 초대</DialogTitle>
          <DialogDescription>
            {invitation?.senderNickname}님이 게임에 초대했습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleDecline}>거절</Button>
          <Button onClick={handleAccept}>수락</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
