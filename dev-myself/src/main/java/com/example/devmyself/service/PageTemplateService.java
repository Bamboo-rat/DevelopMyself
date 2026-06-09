package com.example.devmyself.service;

import com.example.devmyself.dto.response.page.PageTemplateResponse;
import com.example.devmyself.model.PageTemplate;
import com.example.devmyself.model.User;
import com.example.devmyself.model.enums.PageType;
import com.example.devmyself.reponsitory.PageTemplateRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

@Slf4j
@Service
@RequiredArgsConstructor
public class PageTemplateService {
    private final PageTemplateRepository templateRepository;
    private final ObjectMapper objectMapper;

    @Value("classpath:templates/page-templates.json")
    private Resource templateResource;

    /**
     * 3.6  Lấy danh sách templates (system + của user hiện tại)
     */
    public List<PageTemplateResponse> getAvailableTemplates(User user) {
        return templateRepository.findAvailableTemplates(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * 3.6  Lấy templates theo loại page
     */
    public List<PageTemplateResponse> getTemplatesByPageType(User user, PageType pageType) {
        return templateRepository.findByPageType(user, pageType)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Seed system templates mặc định từ file JSON khi app khởi động lần đầu
     */
    @PostConstruct
    public void seedSystemTemplates() {
        if (templateRepository.existsByIsSystemTrue()) {
            return; // Đã seed rồi, bỏ qua
        }

        log.info("Seeding system page templates from JSON...");

        try {
            List<PageTemplate> systemTemplates = objectMapper.readValue(
                    templateResource.getInputStream(),
                    new TypeReference<List<PageTemplate>>() {}
            );

            // Đảm bảo tất cả template này là hệ thống
            systemTemplates.forEach(t -> t.setIsSystem(true));

            templateRepository.saveAll(systemTemplates);
            log.info("Seeded {} system templates.", systemTemplates.size());
        } catch (Exception e) {
            log.error("Failed to seed system templates from JSON", e);
        }
    }



    private PageTemplateResponse mapToResponse(PageTemplate template) {
        return PageTemplateResponse.builder()
                .id(template.getId())
                .name(template.getName())
                .description(template.getDescription())
                .pageType(template.getPageType())
                .defaultContent(template.getDefaultContent())
                .isSystem(template.getIsSystem())
                .build();
    }
}
