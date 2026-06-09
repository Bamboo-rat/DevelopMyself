package com.example.devmyself.model;

import com.example.devmyself.model.enums.PageType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "page_templates",
        indexes = {
                @Index(name = "idx_page_templates_user_id", columnList = "user_id"),
                @Index(name = "idx_page_templates_type", columnList = "page_type")
        }
)
public class PageTemplate extends BaseEntity {

    /**
     * Null nghĩa là template mặc định của hệ thống.
     * Có user_id nghĩa là template riêng của user.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "page_type", nullable = false, length = 50)
    private PageType pageType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "default_content", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> defaultContent;

    @Column(name = "is_system", nullable = false)
    private Boolean isSystem = false;
}

//PageTemplate model
//
//Dùng cho template:
//
//Blank Page
//Career Goal
//Daily Journal
//Learning Note
//Project Plan
//Interview Prep
//Weekly Review
