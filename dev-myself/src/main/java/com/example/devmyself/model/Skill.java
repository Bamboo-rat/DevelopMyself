package com.example.devmyself.model;

import com.example.devmyself.model.enums.SkillCategory;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "skills",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_skills_user_name", columnNames = {"user_id", "name"})
        },
        indexes = {
                @Index(name = "idx_skills_user_id", columnList = "user_id"),
                @Index(name = "idx_skills_category", columnList = "category")
        }
)
public class Skill extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private SkillCategory category = SkillCategory.OTHER;

    /**
     * Level từ 1 đến 5.
     */
    @Column(name = "current_level", nullable = false)
    private Integer currentLevel = 1;

    @Column(name = "target_level", nullable = false)
    private Integer targetLevel = 5;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
