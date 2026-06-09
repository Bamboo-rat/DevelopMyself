package com.example.devmyself.dto.request.page;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class UpdateArchiveRequest {

    @NotNull(message = "Trạng thái lưu trữ không được null")
    private Boolean archived;
}
