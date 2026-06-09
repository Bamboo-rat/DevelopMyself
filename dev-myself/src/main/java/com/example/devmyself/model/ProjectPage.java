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
        name = "project_pages",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_project_pages_project_page", columnNames = {"project_id", "page_id"})
        },
        indexes = {
                @Index(name = "idx_project_pages_project_id", columnList = "project_id"),
                @Index(name = "idx_project_pages_page_id", columnList = "page_id")
        }
)
public class ProjectPage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "page_id", nullable = false)
    private Page page;
}
