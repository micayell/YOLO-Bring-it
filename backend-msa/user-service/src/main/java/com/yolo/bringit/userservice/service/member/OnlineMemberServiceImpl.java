package com.yolo.bringit.userservice.service.member;

import com.yolo.bringit.userservice.domain.member.OnlineMember;
import com.yolo.bringit.userservice.repository.member.OnlineMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class OnlineMemberServiceImpl implements OnlineMemberService {
    private final OnlineMemberRepository onlineMemberRepository;
    private final Map<String, Long> sessionMemberMap = new ConcurrentHashMap<>();

    public void mapSessionToMember(String sessionId, Long memberId) {
        sessionMemberMap.put(sessionId, memberId);
    }

    public Long getMemberIdBySessionId(String sessionId) {
        return sessionMemberMap.get(sessionId);
    }

    public void removeSession(String sessionId) {
        sessionMemberMap.remove(sessionId);
    }

    public void setOnline(Long memberId) {
        onlineMemberRepository.save(new OnlineMember(memberId));
    }

    public void setOffline(Long memberId) {
        onlineMemberRepository.deleteById(memberId);
    }

    public boolean isOnline(Long memberId) {
        return onlineMemberRepository.existsById(memberId);
    }
}

