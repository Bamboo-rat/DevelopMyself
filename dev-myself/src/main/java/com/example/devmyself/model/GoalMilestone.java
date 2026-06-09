package com.example.devmyself.model;

import com.example.devmyself.model.enums.MilestoneStatus;
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
        name = "goal_milestones",
        indexes = {
                @Index(name = "idx_goal_milestones_goal_id", columnList = "goal_id"),
                @Index(name = "idx_goal_milestones_status", columnList = "status")
        }
)
public class GoalMilestone extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_id", nullable = false)
    private Goal goal;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private MilestoneStatus status = MilestoneStatus.TODO;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
