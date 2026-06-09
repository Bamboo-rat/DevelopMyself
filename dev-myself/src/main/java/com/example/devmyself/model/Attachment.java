package com.example.devmyself.model;

import com.example.devmyself.model.enums.AttachmentType;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "attachments",
        indexes = {
                @Index(name = "idx_attachments_user_id", columnList = "user_id"),
                @Index(name = "idx_attachments_page_id", columnList = "page_id"),
                @Index(name = "idx_attachments_public_id", columnList = "public_id")
        }
)
public class Attachment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Có thể null nếu file chưa gắn vào page nào.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "page_id")
    private Page page;

    @Enumerated(EnumType.STRING)
    @Column(name = "attachment_type", nullable = false, length = 30)
    private AttachmentType attachmentType;

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "file_url", nullable = false, columnDefinition = "TEXT")
    private String fileUrl;

    /**
     * Public ID của Cloudinary để xóa/sửa file.
     */
    @Column(name = "public_id", length = 255)
    private String publicId;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "file_size")
    private Long fileSize;
}
