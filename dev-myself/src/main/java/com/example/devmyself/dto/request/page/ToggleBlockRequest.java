package com.example.devmyself.dto.request.page;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class ToggleBlockRequest {

    /**
     * ID của block cần toggle (vd: "block-uuid-123")
     */
    @NotBlank(message = "Block ID không được để trống")
    private String blockId;

    /**
     * Trạng thái mới của checkbox
     */
    @NotNull(message = "Trạng thái checked không được null")
    private Boolean checked;
}
