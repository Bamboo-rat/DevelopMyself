package com.example.devmyself.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // =================== Auth ===================
    EMAIL_ALREADY_EXISTS(
            HttpStatus.CONFLICT,
            "Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập."),

    INVALID_CREDENTIALS(
            HttpStatus.UNAUTHORIZED,
            "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại."),

    TOKEN_INVALID(
            HttpStatus.UNAUTHORIZED,
            "Token không hợp lệ. Vui lòng đăng nhập lại."),

    TOKEN_EXPIRED(
            HttpStatus.UNAUTHORIZED,
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."),

    REFRESH_TOKEN_NOT_FOUND(
            HttpStatus.UNAUTHORIZED,
            "Refresh token không tồn tại hoặc đã bị xóa."),

    REFRESH_TOKEN_REVOKED(
            HttpStatus.UNAUTHORIZED,
            "Refresh token đã bị thu hồi. Vui lòng đăng nhập lại."),

    // =================== User ===================
    USER_NOT_FOUND(
            HttpStatus.NOT_FOUND,
            "Không tìm thấy tài khoản người dùng."),

    WRONG_OLD_PASSWORD(
            HttpStatus.BAD_REQUEST,
            "Mật khẩu hiện tại không đúng. Vui lòng kiểm tra lại."),

    USER_INACTIVE(
            HttpStatus.FORBIDDEN,
            "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ."),

    // =================== Page ===================
    PAGE_NOT_FOUND(
            HttpStatus.NOT_FOUND,
            "Không tìm thấy trang. Trang có thể đã bị xóa hoặc không tồn tại."),

    PAGE_ACCESS_DENIED(
            HttpStatus.FORBIDDEN,
            "Bạn không có quyền truy cập trang này."),

    PAGE_ALREADY_DELETED(
            HttpStatus.BAD_REQUEST,
            "Trang này đã bị xóa trước đó."),

    PAGE_CIRCULAR_REFERENCE(
            HttpStatus.BAD_REQUEST,
            "Không thể di chuyển trang vào chính nó hoặc trang con của nó."),

    // =================== Block / Content ===================
    BLOCK_NOT_FOUND(
            HttpStatus.NOT_FOUND,
            "Không tìm thấy block nội dung trong trang này."),

    BLOCK_NOT_TOGGLEABLE(
            HttpStatus.BAD_REQUEST,
            "Chỉ có thể toggle trạng thái cho block dạng todo/checklist."),

    // =================== Common ===================
    UNAUTHORIZED(
            HttpStatus.UNAUTHORIZED,
            "Bạn cần đăng nhập để thực hiện thao tác này."),

    FORBIDDEN(
            HttpStatus.FORBIDDEN,
            "Bạn không có quyền thực hiện thao tác này."),

    VALIDATION_FAILED(
            HttpStatus.UNPROCESSABLE_ENTITY,
            "Dữ liệu đầu vào không hợp lệ. Vui lòng kiểm tra lại các trường bên dưới."),

    INTERNAL_SERVER_ERROR(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "Hệ thống đang gặp sự cố. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.");

    private final HttpStatus httpStatus;
    private final String message;

    ErrorCode(HttpStatus httpStatus, String message) {
        this.httpStatus = httpStatus;
        this.message = message;
    }
}
