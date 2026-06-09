package com.example.devmyself.model;

import com.example.devmyself.model.enums.GoalPriority;
import com.example.devmyself.model.enums.GoalStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "goals",
        indexes = {
                @Index(name = "idx_goals_user_id", columnList = "user_id"),
                @Index(name = "idx_goals_status", columnList = "status"),
                @Index(name = "idx_goals_target_date", columnList = "target_date")
        }
)
public class Goal extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Có thể liên kết với một page mô tả chi tiết goal.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "page_id")
    private Page page;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private GoalStatus status = GoalStatus.NOT_STARTED;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    private GoalPriority priority = GoalPriority.MEDIUM;

    @Column(name = "progress", nullable = false)
    private Integer progress = 0;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
