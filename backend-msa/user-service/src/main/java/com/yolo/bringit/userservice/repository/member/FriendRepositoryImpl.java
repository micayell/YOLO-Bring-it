package com.yolo.bringit.userservice.repository.member;

import com.querydsl.core.types.dsl.CaseBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.yolo.bringit.userservice.domain.member.Friend;
import com.yolo.bringit.userservice.domain.member.Member;
import com.yolo.bringit.userservice.domain.member.QFriend;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class FriendRepositoryImpl implements FriendRepositoryCustom {
    private final JPAQueryFactory jpaQueryFactory;

    QFriend friend = QFriend.friend;

    @Override
    public List<Friend> findAcceptedFriends(Member memberParam) {
        return jpaQueryFactory
                .selectFrom(friend)
                .where(
                        friend.isAccepted.isTrue()
                                .and(friend.sender.eq(memberParam)
                                        .or(friend.receiver.eq(memberParam)))
                )
                .fetch();
    }

    @Override
    public List<Member> searchFriendsByNickname(Member me, String nickname) {
        List<Member> asSender = jpaQueryFactory
                .select(friend.receiver)
                .from(friend)
                .where(
                        friend.isAccepted.isTrue(),
                        friend.sender.eq(me),
                        friend.receiver.nickname.containsIgnoreCase(nickname)
                )
                .fetch();

        List<Member> asReceiver = jpaQueryFactory
                .select(friend.sender)
                .from(friend)
                .where(
                        friend.isAccepted.isTrue(),
                        friend.receiver.eq(me),
                        friend.sender.nickname.containsIgnoreCase(nickname)
                )
                .fetch();

        List<Member> result = new ArrayList<>();
        result.addAll(asSender);
        result.addAll(asReceiver);
        return result;
    }

}
