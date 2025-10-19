package com.yolo.bringit.userservice.dto;

import lombok.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedList;

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
