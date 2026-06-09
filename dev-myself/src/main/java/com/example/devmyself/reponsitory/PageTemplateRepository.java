package com.example.devmyself.reponsitory;

import com.example.devmyself.model.PageTemplate;
import com.example.devmyself.model.User;
import com.example.devmyself.model.enums.PageType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PageTemplateRepository extends JpaRepository<PageTemplate, UUID> {

    /**
     * Lấy tất cả system templates + custom templates của user hiện tại
     */
    @Query("SELECT t FROM PageTemplate t WHERE t.isSystem = true OR t.user = :user " +
            "ORDER BY t.isSystem DESC, t.name ASC")
    List<PageTemplate> findAvailableTemplates(@Param("user") User user);

    /**
     * Lấy templates theo pageType
     */
    @Query("SELECT t FROM PageTemplate t WHERE (t.isSystem = true OR t.user = :user) " +
            "AND t.pageType = :pageType ORDER BY t.isSystem DESC, t.name ASC")
    List<PageTemplate> findByPageType(@Param("user") User user, @Param("pageType") PageType pageType);

    /**
     * Kiểm tra system templates đã được seed chưa
     */
    boolean existsByIsSystemTrue();
}
