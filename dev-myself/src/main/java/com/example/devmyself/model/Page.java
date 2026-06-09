package com.example.devmyself.model;

import com.example.devmyself.model.enums.PageType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "pages",
        indexes = {
                @Index(name = "idx_pages_user_id", columnList = "user_id"),
                @Index(name = "idx_pages_parent_id", columnList = "parent_id"),
                @Index(name = "idx_pages_user_parent", columnList = "user_id,parent_id"),
                @Index(name = "idx_pages_user_deleted", columnList = "user_id,is_deleted"),
                @Index(name = "idx_pages_user_favorite", columnList = "user_id,is_favorite"),
                @Index(name = "idx_pages_type", columnList = "page_type")
        }
)
public class Page extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Parent page.
     * Null nghĩa là page gốc.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Page parent;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    /**
     * Nội dung page dạng JSONB.
     * Có thể lưu block: heading, paragraph, todo, code, link...
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "content", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> content;

    @Column(name = "icon", length = 100)
    private String icon;

    @Column(name = "cover_url")
    private String coverUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "page_type", nullable = false, length = 50)
    private PageType pageType = PageType.NOTE;

    /**
     * Thứ tự trong sidebar.
     */
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    /**
     * Cấp thư mục.
     * Root = 0.
     */
    @Column(name = "depth", nullable = false)
    private Integer depth = 0;

    /**
     * Có thể lưu dạng /rootId/childId/currentId
     * Giúp query cây nhanh hơn.
     */
    @Column(name = "path", columnDefinition = "TEXT")
    private String path;

    @Column(name = "is_favorite", nullable = false)
    private Boolean isFavorite = false;

    @Column(name = "is_archived", nullable = false)
    private Boolean isArchived = false;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}

//ví dụ trong content
//        {
//                "blocks": [
//                {
//                "id": "block-1",
//                "type": "heading",
//                "text": "BA Roadmap"
//                },
//                {
//                "id": "block-2",
//                "type": "todo",
//                "text": "Học BPMN",
//                "checked": false
//                },
//                {
//                "id": "block-3",
//                "type": "code",
//                "language": "sql",
//                "text": "SELECT * FROM pages;"
//                }
//                ]
//          }
