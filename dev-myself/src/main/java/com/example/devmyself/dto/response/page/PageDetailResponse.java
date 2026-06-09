package com.example.devmyself.dto.response.page;

import com.example.devmyself.model.enums.PageKind;
import com.example.devmyself.model.enums.PageType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Getter
@Builder
public class PageDetailResponse {

    private UUID id;
    private UUID parentId;
    private String title;

    /**
     * Nội dung dạng JSONB — { "blocks": [...] }
     */
    private Map<String, Object> content;

    private String icon;
    private String coverUrl;
    private PageType pageType;
    private PageKind pageKind;
    private Integer sortOrder;
    private Integer depth;
    private String path;
    private Boolean isFavorite;
    private Boolean isArchived;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
