package com.example.devmyself.service;

import com.example.devmyself.dto.request.ChangePasswordRequest;
import com.example.devmyself.dto.request.UpdateProfileRequest;
import com.example.devmyself.dto.response.UserProfileResponse;
import com.example.devmyself.exception.AppException;
import com.example.devmyself.exception.ErrorCode;
import com.example.devmyself.model.User;
import com.example.devmyself.reponsitory.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 1.4 Xem thông tin cá nhân
     */
    public UserProfileResponse getProfile(UUID userId) {
        User user = findUserById(userId);
        return mapToProfileResponse(user);
    }

    /**
     * 1.5 Cập nhật thông tin cá nhân
     */
    @Transactional
    public UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = findUserById(userId);

        if (StringUtils.hasText(request.getFullName())) {
            user.setFullName(request.getFullName());
        }
        if (StringUtils.hasText(request.getAvatarUrl())) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        user = userRepository.save(user);
        log.info("Cập nhật hồ sơ thành công: userId={}", userId);
        return mapToProfileResponse(user);
    }

    /**
     * Đổi mật khẩu
     */
    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = findUserById(userId);

        // Xác thực mật khẩu cũ
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new AppException(ErrorCode.WRONG_OLD_PASSWORD);
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Đổi mật khẩu thành công: userId={}", userId);
    }

    // =================== PRIVATE HELPERS ===================

    private User findUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private UserProfileResponse mapToProfileResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .status(user.getStatus())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
