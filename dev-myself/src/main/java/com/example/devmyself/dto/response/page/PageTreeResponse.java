package com.example.devmyself.dto.response.page;

import com.example.devmyself.model.enums.PageType;
import lombok.Builder;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class PageTreeResponse {

    private UUID id;
    private String title;
    private String icon;
    private PageType pageType;
    private Integer sortOrder;
    private Integer depth;

    /**
     * Danh sách page con — đệ quy, đã được sắp xếp theo sortOrder
     */
    @Builder.Default
    private List<PageTreeResponse> children = new ArrayList<>();
}
