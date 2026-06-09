package com.example.devmyself.controller;

import com.example.devmyself.dto.request.ChangePasswordRequest;
import com.example.devmyself.dto.request.UpdateProfileRequest;
import com.example.devmyself.dto.response.ApiResponse;
import com.example.devmyself.dto.response.UserProfileResponse;
import com.example.devmyself.model.User;
import com.example.devmyself.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * GET /api/v1/users/me
     * Xem thông tin cá nhân
     * Header: Authorization: Bearer <accessToken>
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
            @AuthenticationPrincipal User currentUser) {

        UserProfileResponse profile = userService.getProfile(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    /**
     * PUT /api/v1/users/me
     * Cập nhật thông tin cá nhân (fullName, avatarUrl)
     * Header: Authorization: Bearer <accessToken>
     */
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UpdateProfileRequest request) {

        UserProfileResponse profile = userService.updateProfile(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin thành công", profile));
    }

    /**
     * PUT /api/v1/users/me/password
     * Đổi mật khẩu
     * Header: Authorization: Bearer <accessToken>
     */
    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ChangePasswordRequest request) {

        userService.changePassword(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công"));
    }
}
