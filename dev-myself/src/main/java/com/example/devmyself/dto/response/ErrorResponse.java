package com.example.devmyself.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    /**
     * HTTP status code (vd: 400, 401, 404, 500)
     */
    private int status;

    /**
     * Mã lỗi định danh (vd: "INVALID_CREDENTIALS", "USER_NOT_FOUND")
     */
    private String errorCode;

    /**
     * Thông báo lỗi thân thiện với người dùng
     */
    private String message;

    /**
     * Chi tiết lỗi validation — chỉ xuất hiện khi có lỗi từng field
     * Vd: { "email": "Email không hợp lệ", "password": "Mật khẩu quá ngắn" }
     */
    private Map<String, String> errors;

    /**
     * Thời điểm xảy ra lỗi
     */
    private LocalDateTime timestamp;

    // =================== FACTORY METHODS ===================

    public static ErrorResponse of(HttpStatus status, String errorCode, String message) {
        return ErrorResponse.builder()
                .status(status.value())
                .errorCode(errorCode)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static ErrorResponse of(HttpStatus status, String errorCode, String message,
                                   Map<String, String> errors) {
        return ErrorResponse.builder()
                .status(status.value())
                .errorCode(errorCode)
                .message(message)
                .errors(errors)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
