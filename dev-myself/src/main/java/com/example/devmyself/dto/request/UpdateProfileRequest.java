package com.example.devmyself.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class UpdateProfileRequest {

    @Size(max = 255, message = "Họ tên không được vượt quá 255 ký tự")
    private String fullName;

    private String avatarUrl;
}
