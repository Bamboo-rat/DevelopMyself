package com.example.devmyself.controller;

import com.example.devmyself.dto.request.page.*;
import com.example.devmyself.dto.response.ApiResponse;
import com.example.devmyself.dto.response.page.PageDetailResponse;
import com.example.devmyself.dto.response.page.PageTreeResponse;
import com.example.devmyself.model.User;
import com.example.devmyself.service.PageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pages")
@RequiredArgsConstructor
public class PageController {

    private final PageService pageService;

    /**
     * 2.1 + 2.2  Tạo page gốc hoặc page con
     * POST /api/v1/pages
     * Body: { "title": "...", "parentId": null|"uuid", "pageType": "NOTE", "icon": "📝" }
     */
    @PostMapping
    public ResponseEntity<ApiResponse<PageDetailResponse>> createPage(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreatePageRequest request) {

        PageDetailResponse page = pageService.createPage(currentUser, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo trang thành công", page));
    }

    /**
     * 2.3  Lấy cây sidebar
     * GET /api/v1/pages/tree
     */
    @GetMapping("/tree")
    public ResponseEntity<ApiResponse<List<PageTreeResponse>>> getPageTree(
            @AuthenticationPrincipal User currentUser) {

        List<PageTreeResponse> tree = pageService.getPageTree(currentUser);
        return ResponseEntity.ok(ApiResponse.success(tree));
    }

    /**
     * 2.4  Xem chi tiết page
     * GET /api/v1/pages/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PageDetailResponse>> getPageDetail(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID id) {

        PageDetailResponse page = pageService.getPageDetail(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    /**
     * 2.5  Cập nhật tiêu đề
     * PATCH /api/v1/pages/{id}/title
     */
    @PatchMapping("/{id}/title")
    public ResponseEntity<ApiResponse<PageDetailResponse>> updateTitle(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTitleRequest request) {

        PageDetailResponse page = pageService.updateTitle(id, currentUser, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật tiêu đề thành công", page));
    }

    /**
     * 2.6  Cập nhật nội dung
     * PATCH /api/v1/pages/{id}/content
     */
    @PatchMapping("/{id}/content")
    public ResponseEntity<ApiResponse<PageDetailResponse>> updateContent(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateContentRequest request) {

        PageDetailResponse page = pageService.updateContent(id, currentUser, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật nội dung thành công", page));
    }

    /**
     * 2.7  Xóa page (soft delete)
     * DELETE /api/v1/pages/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePage(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID id) {

        pageService.deletePage(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Xóa trang thành công"));
    }

    /**
     * 2.8  Đổi icon
     * PATCH /api/v1/pages/{id}/icon
     */
    @PatchMapping("/{id}/icon")
    public ResponseEntity<ApiResponse<PageDetailResponse>> updateIcon(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID id,
            @RequestBody UpdateIconRequest request) {

        PageDetailResponse page = pageService.updateIcon(id, currentUser, request);
        return ResponseEntity.ok(ApiResponse.success("Đổi icon thành công", page));
    }

    /**
     * 2.9  Đổi loại page
     * PATCH /api/v1/pages/{id}/type
     */
    @PatchMapping("/{id}/type")
    public ResponseEntity<ApiResponse<PageDetailResponse>> updatePageType(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePageTypeRequest request) {

        PageDetailResponse page = pageService.updatePageType(id, currentUser, request);
        return ResponseEntity.ok(ApiResponse.success("Đổi loại trang thành công", page));
    }

    /**
     * 2.10  Sắp xếp thứ tự trong sidebar (kéo thả)
     * PATCH /api/v1/pages/{id}/sort-order
     */
    @PatchMapping("/{id}/sort-order")
    public ResponseEntity<ApiResponse<PageDetailResponse>> updateSortOrder(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody MoveSortOrderRequest request) {

        PageDetailResponse page = pageService.updateSortOrder(id, currentUser, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thứ tự thành công", page));
    }

    /**
     * 2.11  Di chuyển sang cha khác
     * PATCH /api/v1/pages/{id}/parent
     * Body: { "newParentId": "uuid" | null }
     */
    @PatchMapping("/{id}/parent")
    public ResponseEntity<ApiResponse<PageDetailResponse>> moveToParent(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID id,
            @RequestBody MoveParentRequest request) {

        PageDetailResponse page = pageService.moveToParent(id, currentUser, request);
        return ResponseEntity.ok(ApiResponse.success("Di chuyển trang thành công", page));
    }

    /**
     * 4.3  Archive / Unarchive page
     * PATCH /api/v1/pages/{id}/archive
     * Body: { "archived": true | false }
     */
    @PatchMapping("/{id}/archive")
    public ResponseEntity<ApiResponse<PageDetailResponse>> updateArchive(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateArchiveRequest request) {

        PageDetailResponse page = pageService.updateArchive(id, currentUser, request);
        String msg = Boolean.TRUE.equals(request.getArchived())
                ? "Lưu trữ trang thành công"
                : "Khôi phục trang thành công";
        return ResponseEntity.ok(ApiResponse.success(msg, page));
    }

    /**
     * 3.3  Toggle trạng thái checklist/todo block
     * PATCH /api/v1/pages/{id}/blocks/toggle
     * Body: { "blockId": "block-123", "checked": true }
     */
    @PatchMapping("/{id}/blocks/toggle")
    public ResponseEntity<ApiResponse<PageDetailResponse>> toggleBlock(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody ToggleBlockRequest request) {

        PageDetailResponse page = pageService.toggleBlock(id, currentUser, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật checklist thành công", page));
    }
}
