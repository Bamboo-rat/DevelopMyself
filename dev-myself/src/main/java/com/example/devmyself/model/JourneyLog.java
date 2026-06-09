package com.example.devmyself.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "journey_logs",
        indexes = {
                @Index(name = "idx_journey_logs_user_id", columnList = "user_id"),
                @Index(name = "idx_journey_logs_log_date", columnList = "log_date")
        }
)
public class JourneyLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Có thể liên kết với page JOURNAL.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "page_id")
    private Page page;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "mood", length = 50)
    private String mood;

    /**
     * Độ khó trong ngày: 1 - 5.
     */
    @Column(name = "difficulty")
    private Integer difficulty;

    @Column(name = "learned", columnDefinition = "TEXT")
    private String learned;

    @Column(name = "problem", columnDefinition = "TEXT")
    private String problem;

    @Column(name = "next_plan", columnDefinition = "TEXT")
    private String nextPlan;
}
