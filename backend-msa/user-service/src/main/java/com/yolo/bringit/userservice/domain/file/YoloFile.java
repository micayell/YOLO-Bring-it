package com.yolo.bringit.userservice.domain.file;

import com.yolo.bringit.userservice.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;

@Getter
@Entity
@Table(name="yolo_file")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "yoloFileUid", callSuper=false)
@ToString
public class YoloFile extends BaseEntity {
    @Id
    @Column(name="yolo_file_uid")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long yoloFileUid;

    @Comment("파일 타입")
    @Column(name="type")
    private String type;

    @Comment("파일 이름")
    @Column(name="name", length = 255)
    private String name;

    @Comment("파일 확장자")
    @Column(name="ext")
    private String ext;

    @Comment("파일 경로")
    @Column(name="path", length = 255)
    private String path;

    @Builder
    public YoloFile(String type, String name, String ext, String path) {
        this.type = type;
        this.name = name;
        this.ext = ext;
        this.path = path;
    }
}
