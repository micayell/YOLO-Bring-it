package com.yolo.bringit.gameservice.service.game;

import com.yolo.bringit.gameservice.dto.client.ClientResponseDto;

import java.util.List;

public interface GameUserService {
    List<ClientResponseDto.MemberSimpleInfo> getLastGameUsers(Long userId);
}
