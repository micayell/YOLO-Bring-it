package com.yolo.bringit.gameservice.util;

import com.yolo.bringit.gameservice.dto.ResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;

@Component
public class ResponseHandler {

    public <T> ResponseEntity<ResponseDto<T>> success(T data, String message, HttpStatus status) {
        ResponseDto<T> res = new ResponseDto<>(status.value(), "success", message, data, Collections.emptyList());
        return ResponseEntity.status(status).body(res);
    }

    public <T> ResponseEntity<ResponseDto<T>> success(T data) {
        return success(data, null, HttpStatus.OK);
    }

    public ResponseEntity<ResponseDto<List<Object>>> success(String message) {
        return success(Collections.emptyList(), message, HttpStatus.OK);
    }

    public ResponseEntity<ResponseDto<List<Object>>> success() {
        return success(Collections.emptyList(), null, HttpStatus.OK);
    }

    public <T> ResponseEntity<ResponseDto<T>> fail(T data, String message, HttpStatus status) {
        ResponseDto<T> res = new ResponseDto<>(
                status.value(),
                "fail",
                message,
                data,
                Collections.emptyList()
        );
        return ResponseEntity.status(status).body(res);
    }

    public ResponseEntity<ResponseDto<List<Object>>> fail(String message, HttpStatus status) {
        return ResponseEntity.status(status).body(
                new ResponseDto<>(status.value(), "fail", message, Collections.emptyList(), null)
        );
    }

    public ResponseEntity<ResponseDto<List<Object>>> invalidData(LinkedList<LinkedHashMap<String, String>> errors) {
        ResponseDto<List<Object>> res = new ResponseDto<>(
                HttpStatus.BAD_REQUEST.value(),
                "fail",
                "",
                Collections.emptyList(),
                errors
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
    }
}
