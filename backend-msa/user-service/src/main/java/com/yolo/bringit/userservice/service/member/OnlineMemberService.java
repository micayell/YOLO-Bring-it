package com.yolo.bringit.userservice.service.member;

public interface OnlineMemberService {
    void setOnline(Long memberId);
    void setOffline(Long memberId);
    boolean isOnline(Long memberId);
    void mapSessionToMember(String sessionId, Long memberId);
    Long getMemberIdBySessionId(String sessionId);
    void removeSession(String sessionId);
}
