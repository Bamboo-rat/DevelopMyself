package com.example.devmyself.controller;

import com.example.devmyself.dto.response.ApiResponse;
import com.example.devmyself.dto.response.page.PageTemplateResponse;
import com.example.devmyself.model.User;
import com.example.devmyself.model.enums.PageType;
import com.example.devmyself.service.PageTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/page-templates")
@RequiredArgsConstructor
public class PageTemplateController {

    private final PageTemplateService templateService;

    /**
     * 3.6  Lấy tất cả templates (hệ thống + của cá nhân)
     * GET /api/v1/page-templates
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PageTemplateResponse>>> getAvailableTemplates(
            @AuthenticationPrincipal User currentUser) {

        List<PageTemplateResponse> templates = templateService.getAvailableTemplates(currentUser);
        return ResponseEntity.ok(ApiResponse.success(templates));
    }

    /**
     * Lấy templates theo loại page (NOTE, GOAL, PROJECT,...)
     * GET /api/v1/page-templates/type/{pageType}
     */
    @GetMapping("/type/{pageType}")
    public ResponseEntity<ApiResponse<List<PageTemplateResponse>>> getTemplatesByType(
            @AuthenticationPrincipal User currentUser,
            @PathVariable PageType pageType) {

        List<PageTemplateResponse> templates = templateService.getTemplatesByPageType(currentUser, pageType);
        return ResponseEntity.ok(ApiResponse.success(templates));
    }
}
