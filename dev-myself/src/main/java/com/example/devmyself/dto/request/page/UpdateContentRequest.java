package com.example.devmyself.dto.request.page;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.util.Map;

@Getter
public class UpdateContentRequest {

    /**
     * Nội dung dạng JSONB.
     * Cấu trúc: { "blocks": [ { "id": "...", "type": "paragraph", "text": "..." }, ... ] }
     */
    @NotNull(message = "Nội dung không được null")
    private Map<String, Object> content;
}
