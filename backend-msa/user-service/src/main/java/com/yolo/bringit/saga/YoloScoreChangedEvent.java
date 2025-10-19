package com.yolo.bringit.saga;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YoloScoreChangedEvent {
    public Long userId;
    public String state;
}
