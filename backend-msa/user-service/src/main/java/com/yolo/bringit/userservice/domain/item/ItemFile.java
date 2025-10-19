package com.yolo.bringit.userservice.domain.item;

import com.yolo.bringit.userservice.domain.BaseTimeEntity;
import com.yolo.bringit.userservice.domain.file.YoloFile;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Entity
@Table(name="item_file")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "itemFileUid", callSuper=false)
public class ItemFile extends BaseTimeEntity {
    @Id
    @Column(name="item_file_uid")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemFileUid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "itemId")
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "yoloFileId")
    private YoloFile yoloFile;

    @Builder
    public ItemFile(Item item, YoloFile yoloFile) {
        this.item = item;
        this.yoloFile = yoloFile;
    }
}
