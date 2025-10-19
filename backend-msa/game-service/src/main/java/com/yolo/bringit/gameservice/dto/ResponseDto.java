package com.yolo.bringit.gameservice.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResponseDto<T> {
    private int state;
    private String result;
    private String message;
    private T data;
    private Object error;
}