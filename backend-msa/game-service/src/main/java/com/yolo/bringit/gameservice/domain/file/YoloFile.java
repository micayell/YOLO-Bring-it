package com.yolo.bringit.gameservice.domain.file;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class YoloFile {
    private String name;
    private String ext;
    private String type;
    private String path;
}