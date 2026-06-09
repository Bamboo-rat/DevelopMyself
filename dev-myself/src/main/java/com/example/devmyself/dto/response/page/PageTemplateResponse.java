package com.example.devmyself.dto.response.page;

import com.example.devmyself.model.enums.PageType;
import lombok.Builder;
import lombok.Getter;

import java.util.Map;
import java.util.UUID;

@Getter
@Builder
public class PageTemplateResponse {

    private UUID id;
    private String name;
    private String description;
    private PageType pageType;
    private Map<String, Object> defaultContent;
    private Boolean isSystem;
}
