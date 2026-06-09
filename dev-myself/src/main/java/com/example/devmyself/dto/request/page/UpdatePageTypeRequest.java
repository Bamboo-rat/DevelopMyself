package com.example.devmyself.dto.request.page;

import com.example.devmyself.model.enums.PageType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class UpdatePageTypeRequest {

    @NotNull(message = "Loại page không được để trống")
    private PageType pageType;
}
