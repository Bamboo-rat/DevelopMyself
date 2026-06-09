package com.example.devmyself.service;

import com.example.devmyself.config.JwtConfig;
import com.example.devmyself.dto.request.LoginRequest;
import com.example.devmyself.dto.request.RegisterRequest;
import com.example.devmyself.dto.response.AuthResponse;
import com.example.devmyself.exception.AppException;
import com.example.devmyself.exception.ErrorCode;
import com.example.devmyself.model.RefreshToken;
import com.example.devmyself.model.User;
import com.example.devmyself.model.enums.UserStatus;
import com.example.devmyself.reponsitory.RefreshTokenRepository;
import com.example.devmyself.reponsitory.UserRepository;
import com.example.devmyself.security.JwtService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final JwtConfig jwtConfig;
    private final PasswordEncoder passwordEncoder;

    /**
     * 1.1 Đăng ký tài khoản mới
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Kiểm tra email trùng
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        // Tạo user mới
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .status(UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);
        log.info("Đăng ký thành công: userId={}, email={}", user.getId(), user.getEmail());

        return buildAuthResponse(user);
    }

    /**
     * 1.2 Đăng nhập
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Tìm user theo email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));

        // Kiểm tra trạng thái tài khoản
        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new AppException(ErrorCode.USER_INACTIVE);
        }

        // Xác thực mật khẩu
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        // Cập nhật last login
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("Đăng nhập thành công: userId={}", user.getId());
        return buildAuthResponse(user);
    }

    /**
     * Làm mới Access Token bằng Refresh Token
     */
    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new AppException(ErrorCode.REFRESH_TOKEN_NOT_FOUND));

        // Kiểm tra token đã bị revoke chưa
        if (storedToken.getRevoked()) {
            throw new AppException(ErrorCode.REFRESH_TOKEN_REVOKED);
        }

        // Kiểm tra token còn hạn không
        if (storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            storedToken.setRevoked(true);
            storedToken.setRevokedAt(LocalDateTime.now());
            refreshTokenRepository.save(storedToken);
            throw new AppException(ErrorCode.TOKEN_EXPIRED);
        }

        User user = storedToken.getUser();

        // Revoke token cũ, cấp token mới (Refresh Token Rotation)
        storedToken.setRevoked(true);
        storedToken.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(storedToken);

        return buildAuthResponse(user);
    }

    /**
     * 1.3 Đăng xuất — revoke tất cả refresh token của user
     */
    @Transactional
    public void logout(User currentUser) {
        refreshTokenRepository.revokeAllByUser(currentUser);
        log.info("Đăng xuất thành công: userId={}", currentUser.getId());
    }

    // =================== PRIVATE HELPERS ===================

    /**
     * Tạo cặp Access Token + Refresh Token và lưu vào DB
     */
    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshTokenValue = jwtService.generateRefreshToken();

        // Lưu Refresh Token vào DB
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(refreshTokenValue)
                .expiresAt(LocalDateTime.now().plusSeconds(
                        jwtConfig.getRefreshTokenExpiration() / 1000))
                .revoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenValue)
                .tokenType("Bearer")
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .avatarUrl(user.getAvatarUrl())
                        .build())
                .build();
    }
}
