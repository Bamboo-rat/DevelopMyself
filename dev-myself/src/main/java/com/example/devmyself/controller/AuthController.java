package com.example.devmyself.controller;

import com.example.devmyself.dto.request.LoginRequest;
import com.example.devmyself.dto.request.RegisterRequest;
import com.example.devmyself.dto.response.ApiResponse;
import com.example.devmyself.dto.response.AuthResponse;
import com.example.devmyself.exception.AppException;
import com.example.devmyself.exception.ErrorCode;
import com.example.devmyself.model.User;
import com.example.devmyself.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/v1/auth/register
     * Đăng ký tài khoản mới
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthResponse authResponse = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đăng ký thành công", authResponse));
    }

    /**
     * POST /api/v1/auth/login
     * Đăng nhập — trả về Access Token + Refresh Token
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", authResponse));
    }

    /**
     * POST /api/v1/auth/refresh-token
     * Làm mới Access Token bằng Refresh Token
     * Body: { "refreshToken": "..." }
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @RequestParam String refreshToken) {

        if (refreshToken == null || refreshToken.isBlank()) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }

        AuthResponse authResponse = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.success("Làm mới token thành công", authResponse));
    }

    /**
     * POST /api/v1/auth/logout
     * Đăng xuất — revoke Refresh Token
     * Header: Authorization: Bearer <accessToken>
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal User currentUser) {

        authService.logout(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công"));
    }
}
