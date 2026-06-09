package com.example.devmyself.dto.request.page;

import com.example.devmyself.model.enums.PageKind;
import com.example.devmyself.model.enums.PageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.util.UUID;

@Getter
public class CreatePageRequest {

    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(max = 255, message = "Tiêu đề không được vượt quá 255 ký tự")
    private String title;

    /**
     * Nếu null → tạo page gốc.
     * Nếu có giá trị → tạo page con bên trong parentId.
     */
    private UUID parentId;

    private PageType pageType = PageType.NOTE;

    private PageKind pageKind;

    /**
     * Emoji hoặc URL icon (có thể null)
     */
    private String icon;

    /**
     * UUID của template muốn dùng khi tạo page.
     * Nếu null → content rỗng (Blank Page).
     */
    private java.util.UUID templateId;
}
