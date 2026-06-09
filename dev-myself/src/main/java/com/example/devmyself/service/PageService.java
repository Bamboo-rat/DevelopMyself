package com.example.devmyself.service;

import com.example.devmyself.dto.request.page.*;
import com.example.devmyself.dto.response.page.PageDetailResponse;
import com.example.devmyself.dto.response.page.PageTreeResponse;
import com.example.devmyself.exception.AppException;
import com.example.devmyself.exception.ErrorCode;
import com.example.devmyself.model.Page;
import com.example.devmyself.model.PageTemplate;
import com.example.devmyself.model.User;
import com.example.devmyself.model.enums.PageKind;
import com.example.devmyself.reponsitory.PageRepository;
import com.example.devmyself.reponsitory.PageTemplateRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PageService {

    private final PageRepository pageRepository;
    private final PageTemplateRepository templateRepository;

    // ============================================================
    // 2.1 + 2.2  Tạo page gốc hoặc page con
    // ============================================================
    @Transactional
    public PageDetailResponse createPage(User user, CreatePageRequest request) {
        Page parent = null;
        int depth = 0;
        String path;

        if (request.getParentId() != null) {
            // Tạo page con — xác minh parent tồn tại và thuộc user
            parent = findAndVerifyPage(request.getParentId(), user);
            depth = parent.getDepth() + 1;
        }

        // Auto-set sortOrder = max + 1 trong cùng cấp
        int nextSortOrder = pageRepository.findMaxSortOrder(user, request.getParentId()) + 1;

        PageKind kind = request.getPageKind() != null ? request.getPageKind() : PageKind.DOCUMENT;
        
        Page page = Page.builder()
                .user(user)
                .parent(parent)
                .title(request.getTitle())
                .content(kind == PageKind.FOLDER ? new java.util.HashMap<>() : resolveInitialContent(request))
                .icon(request.getIcon())
                .pageType(request.getPageType() != null ? request.getPageType()
                        : com.example.devmyself.model.enums.PageType.NOTE)
                .pageKind(kind)
                .sortOrder(nextSortOrder)
                .depth(depth)
                .isFavorite(false)
                .isArchived(false)
                .isDeleted(false)
                .build();

        page = pageRepository.save(page);

        // Sau khi save mới có ID → build path
        path = buildPath(parent, page.getId());
        page.setPath(path);
        page = pageRepository.save(page);

        log.info("Tạo page thành công: pageId={}, userId={}, parentId={}",
                page.getId(), user.getId(), request.getParentId());

        return mapToDetail(page);
    }

    // ============================================================
    // 2.3  Lấy cây page dạng tree (O(n) — build trong memory)
    // ============================================================
    public List<PageTreeResponse> getPageTree(User user) {
        List<Page> allPages = pageRepository.findAllActiveByUser(user);

        // Map id → PageTreeResponse node
        Map<UUID, PageTreeResponse> nodeMap = new LinkedHashMap<>();
        for (Page page : allPages) {
            nodeMap.put(page.getId(), mapToTree(page));
        }

        // Gắn children vào cha tương ứng
        List<PageTreeResponse> roots = new ArrayList<>();
        for (Page page : allPages) {
            PageTreeResponse node = nodeMap.get(page.getId());
            if (page.getParent() == null) {
                roots.add(node);
            } else {
                PageTreeResponse parentNode = nodeMap.get(page.getParent().getId());
                if (parentNode != null) {
                    parentNode.getChildren().add(node);
                }
            }
        }

        return roots;
    }

    // ============================================================
    // 2.3.1 Tìm kiếm toàn cục (Global Search)
    // ============================================================
    public List<PageTreeResponse> searchPages(String keyword, com.example.devmyself.model.enums.PageType type, User user) {
        String typeStr = type != null ? type.name() : null;
        String kw = keyword != null ? keyword.trim() : "";
        List<Page> results = pageRepository.searchPages(user.getId(), kw, typeStr);
        return results.stream().map(this::mapToTree).collect(Collectors.toList());
    }

    // ============================================================
    // 2.4  Xem chi tiết page
    // ============================================================
    public PageDetailResponse getPageDetail(UUID pageId, User user) {
        Page page = findAndVerifyPage(pageId, user);
        return mapToDetail(page);
    }

    // ============================================================
    // 2.5  Cập nhật tiêu đề
    // ============================================================
    @Transactional
    public PageDetailResponse updateTitle(UUID pageId, User user, UpdateTitleRequest request) {
        Page page = findAndVerifyPage(pageId, user);
        page.setTitle(request.getTitle());
        page = pageRepository.save(page);
        return mapToDetail(page);
    }

    // ============================================================
    // 2.6  Cập nhật nội dung JSONB
    // ============================================================
    @Transactional
    public PageDetailResponse updateContent(UUID pageId, User user, UpdateContentRequest request) {
        Page page = findAndVerifyPage(pageId, user);
        page.setContent(request.getContent());
        page = pageRepository.save(page);
        return mapToDetail(page);
    }

    // ============================================================
    // 2.7  Soft delete — cascade toàn bộ descendants
    // ============================================================
    @Transactional
    public void deletePage(UUID pageId, User user) {
        Page page = findAndVerifyPage(pageId, user);

        if (Boolean.TRUE.equals(page.getIsDeleted())) {
            throw new AppException(ErrorCode.PAGE_ALREADY_DELETED);
        }

        LocalDateTime now = LocalDateTime.now();

        // Soft delete page hiện tại
        page.setIsDeleted(true);
        page.setDeletedAt(now);
        pageRepository.save(page);

        // Cascade soft delete toàn bộ descendants theo path prefix
        if (page.getPath() != null) {
            pageRepository.softDeleteByPathPrefix(page.getPath() + "/%", now);
        }

        log.info("Soft delete page: pageId={}, userId={}", pageId, user.getId());
    }

    // ============================================================
    // 2.8  Đổi icon
    // ============================================================
    @Transactional
    public PageDetailResponse updateIcon(UUID pageId, User user, UpdateIconRequest request) {
        Page page = findAndVerifyPage(pageId, user);
        page.setIcon(request.getIcon());   // null = xóa icon
        page = pageRepository.save(page);
        return mapToDetail(page);
    }

    // ============================================================
    // 2.9  Đổi loại page
    // ============================================================
    @Transactional
    public PageDetailResponse updatePageType(UUID pageId, User user, UpdatePageTypeRequest request) {
        Page page = findAndVerifyPage(pageId, user);
        page.setPageType(request.getPageType());
        page = pageRepository.save(page);
        return mapToDetail(page);
    }

    // ============================================================
    // 2.10  Cập nhật sort_order (kéo thả sidebar)
    // ============================================================
    @Transactional
    public PageDetailResponse updateSortOrder(UUID pageId, User user, MoveSortOrderRequest request) {
        Page page = findAndVerifyPage(pageId, user);
        page.setSortOrder(request.getSortOrder());
        page = pageRepository.save(page);
        return mapToDetail(page);
    }

    // ============================================================
    // 2.11  Di chuyển sang parent khác
    // ============================================================
    @Transactional
    public PageDetailResponse moveToParent(UUID pageId, User user, MoveParentRequest request) {
        Page page = findAndVerifyPage(pageId, user);

        // Kiểm tra circular reference: không thể di chuyển vào chính nó hoặc descendant của nó
        if (request.getNewParentId() != null) {
            if (request.getNewParentId().equals(pageId)) {
                throw new AppException(ErrorCode.PAGE_CIRCULAR_REFERENCE);
            }
            // Kiểm tra newParent có phải là descendant của page hiện tại không
            if (page.getPath() != null && pageRepository.isDescendantOf(
                    request.getNewParentId(), page.getPath() + "/%")) {
                throw new AppException(ErrorCode.PAGE_CIRCULAR_REFERENCE);
            }
        }

        Page newParent = null;
        int newDepth = 0;

        if (request.getNewParentId() != null) {
            newParent = findAndVerifyPage(request.getNewParentId(), user);
            newDepth = newParent.getDepth() + 1;
        }

        UUID newParentId = newParent != null ? newParent.getId() : null;
        int nextSortOrder = pageRepository.findMaxSortOrder(user, newParentId) + 1;

        String oldPath = page.getPath();
        int oldDepth = page.getDepth();

        page.setParent(newParent);
        page.setDepth(newDepth);
        page.setSortOrder(nextSortOrder);
        String newPath = buildPath(newParent, page.getId());
        page.setPath(newPath);
        page = pageRepository.save(page);

        // Nếu page có children, cập nhật path và depth của toàn bộ descendants
        if (oldPath != null) {
            String pathPrefix = oldPath + "/%";
            int depthDelta = newDepth - oldDepth;
            pageRepository.updateDescendantsPathAndDepth(oldPath, newPath, depthDelta, pathPrefix);
        }

        log.info("Di chuyển page: pageId={}, newParentId={}", pageId, request.getNewParentId());
        return mapToDetail(page);
    }

    // ============================================================
    // 2.12  Duplicate page
    // ============================================================
    @Transactional
    public PageDetailResponse duplicatePage(UUID pageId, User user) {
        Page original = findAndVerifyPage(pageId, user);

        UUID parentId = original.getParent() != null ? original.getParent().getId() : null;
        int nextSortOrder = pageRepository.findMaxSortOrder(user, parentId) + 1;

        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> newContent = null;
        try {
            if (original.getContent() != null) {
                String json = mapper.writeValueAsString(original.getContent());
                newContent = mapper.readValue(json, new TypeReference<Map<String, Object>>() {});
            }
        } catch (Exception e) {
            log.error("Lỗi khi duplicate content", e);
        }

        Page copy = Page.builder()
                .user(user)
                .parent(original.getParent())
                .title(original.getTitle() + " (Copy)")
                .pageType(original.getPageType())
                .icon(original.getIcon())
                .content(newContent)
                .depth(original.getDepth())
                .sortOrder(nextSortOrder)
                .isArchived(false)
                .isDeleted(false)
                .build();

        copy = pageRepository.save(copy);
        copy.setPath(buildPath(original.getParent(), copy.getId()));
        copy = pageRepository.save(copy);

        log.info("Duplicate page: oldId={}, newId={}", pageId, copy.getId());
        return mapToDetail(copy);
    }

    // ============================================================
    // 4.3  Archive / Unarchive page
    // ============================================================
    @Transactional
    public PageDetailResponse updateArchive(UUID pageId, User user, UpdateArchiveRequest request) {
        Page page = findAndVerifyPage(pageId, user);
        page.setIsArchived(request.getArchived());
        page = pageRepository.save(page);
        log.info("Archive page: pageId={}, archived={}", pageId, request.getArchived());
        return mapToDetail(page);
    }

    // ============================================================
    // 3.3  Toggle trạng thái checklist / todo block
    // ============================================================
    @SuppressWarnings("unchecked")
    @Transactional
    public PageDetailResponse toggleBlock(UUID pageId, User user, ToggleBlockRequest request) {
        Page page = findAndVerifyPage(pageId, user);

        Map<String, Object> content = page.getContent();
        if (content == null || !content.containsKey("blocks")) {
            throw new AppException(ErrorCode.BLOCK_NOT_FOUND);
        }

        List<Map<String, Object>> blocks = (List<Map<String, Object>>) content.get("blocks");
        boolean found = false;

        for (Map<String, Object> block : blocks) {
            if (request.getBlockId().equals(block.get("id"))) {
                String type = (String) block.get("type");
                if (!"todo".equals(type)) {
                    throw new AppException(ErrorCode.BLOCK_NOT_TOGGLEABLE);
                }
                block.put("checked", request.getChecked());
                found = true;
                break;
            }
        }

        if (!found) {
            throw new AppException(ErrorCode.BLOCK_NOT_FOUND);
        }

        // Tạo map mới để trigger dirty detection của Hibernate
        Map<String, Object> updatedContent = new HashMap<>(content);
        updatedContent.put("blocks", blocks);
        page.setContent(updatedContent);
        page = pageRepository.save(page);

        log.info("Toggle block: pageId={}, blockId={}, checked={}", pageId, request.getBlockId(), request.getChecked());
        return mapToDetail(page);
    }

    // ============================================================
    // PRIVATE HELPERS
    // ============================================================

    /**
     * Tìm page theo id, kiểm tra ownership và trạng thái chưa xóa
     */
    private Page findAndVerifyPage(UUID pageId, User user) {
        Page page = pageRepository.findActiveById(pageId)
                .orElseThrow(() -> new AppException(ErrorCode.PAGE_NOT_FOUND));

        if (!page.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.PAGE_ACCESS_DENIED);
        }

        return page;
    }

    /**
     * Build path dạng /parentPath/currentId
     * Dùng để query nhanh descendants theo prefix
     */
    private String buildPath(Page parent, UUID currentId) {
        if (parent == null) {
            return "/" + currentId;
        }
        String parentPath = parent.getPath() != null ? parent.getPath() : "/" + parent.getId();
        return parentPath + "/" + currentId;
    }

    /**
     * Lấy content từ template nếu có templateId, ngược lại trả về content rỗng
     */
    private Map<String, Object> resolveInitialContent(CreatePageRequest request) {
        if (request.getTemplateId() == null) {
            return Collections.emptyMap();
        }
        return templateRepository.findById(request.getTemplateId())
                .map(PageTemplate::getDefaultContent)
                .orElse(Collections.emptyMap());
    }

    private PageDetailResponse mapToDetail(Page page) {
        return PageDetailResponse.builder()
                .id(page.getId())
                .parentId(page.getParent() != null ? page.getParent().getId() : null)
                .title(page.getTitle())
                .content(page.getContent())
                .icon(page.getIcon())
                .coverUrl(page.getCoverUrl())
                .pageType(page.getPageType())
                .pageKind(page.getPageKind())
                .sortOrder(page.getSortOrder())
                .depth(page.getDepth())
                .path(page.getPath())
                .isFavorite(page.getIsFavorite())
                .isArchived(page.getIsArchived())
                .createdAt(page.getCreatedAt())
                .updatedAt(page.getUpdatedAt())
                .build();
    }

    private PageTreeResponse mapToTree(Page page) {
        return PageTreeResponse.builder()
                .id(page.getId())
                .title(page.getTitle())
                .icon(page.getIcon())
                .pageType(page.getPageType())
                .pageKind(page.getPageKind())
                .sortOrder(page.getSortOrder())
                .depth(page.getDepth())
                .build();
    }
}
