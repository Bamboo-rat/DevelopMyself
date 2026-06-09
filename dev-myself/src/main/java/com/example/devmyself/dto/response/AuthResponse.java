package com.example.devmyself.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private UserInfo user;

    @Getter
    @Builder
    public static class UserInfo {
        private UUID id;
        private String email;
        private String fullName;
        private String avatarUrl;
    }
}
