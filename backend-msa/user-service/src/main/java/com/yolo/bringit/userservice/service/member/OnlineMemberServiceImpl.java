package com.yolo.bringit.userservice.service.member;

import com.yolo.bringit.userservice.domain.member.OnlineMember;
import com.yolo.bringit.userservice.repository.member.OnlineMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class OnlineMemberServiceImpl implements OnlineMemberService {
    private final OnlineMemberRepository onlineMemberRepository;

    // sessionId -> memberId 맵핑 보관 (Disconnect 시 유저 식별용)
    private final Map<String, Long> sessionMemberMap = new ConcurrentHashMap<>();

    // 특정 memberId가 가진 모든 sessionId들 (멀티 세션 방어용)
    private final Map<Long, Set<String>> memberSessionsMap = new ConcurrentHashMap<>();

    public void mapSessionToMember(String sessionId, Long memberId) {
        sessionMemberMap.put(sessionId, memberId);

        memberSessionsMap.computeIfAbsent(memberId, k -> ConcurrentHashMap.newKeySet()).add(sessionId);
    }

    public Long getMemberIdBySessionId(String sessionId) {
        return sessionMemberMap.get(sessionId);
    }

    public void removeSession(String sessionId) {
        Long memberId = sessionMemberMap.remove(sessionId);
        if (memberId != null) {
            Set<String> sessions = memberSessionsMap.get(memberId);
            if (sessions != null) {
                sessions.remove(sessionId);
            }
        }
    }

    public void setOnline(Long memberId) {
        onlineMemberRepository.save(new OnlineMember(memberId));
    }

    public void setOffline(Long memberId) {
        Set<String> sessions = memberSessionsMap.get(memberId);

        if (sessions == null || sessions.isEmpty()) {
            onlineMemberRepository.deleteById(memberId);
        }
    }

    public boolean isOnline(Long memberId) {
        return onlineMemberRepository.existsById(memberId);
    }

    public boolean hasActiveSessions(Long memberId) {
        Set<String> sessions = memberSessionsMap.get(memberId);
        return sessions != null && !sessions.isEmpty();
    }
}

