package com.example.devmyself.model;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "page_tags",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_page_tags_page_tag", columnNames = {"page_id", "tag_id"})
        },
        indexes = {
                @Index(name = "idx_page_tags_page_id", columnList = "page_id"),
                @Index(name = "idx_page_tags_tag_id", columnList = "tag_id")
        }
)
public class PageTag extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "page_id", nullable = false)
    private Page page;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_id", nullable = false)
    private Tag tag;
}
