package com.example.devmyself.reponsitory;

import com.example.devmyself.model.Page;
import com.example.devmyself.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PageRepository extends JpaRepository<Page, UUID> {

    /**
     * Lấy toàn bộ pages chưa xóa của user (flat list để build tree trong memory).
     * ORDER BY depth ASC, sortOrder ASC đảm bảo cha luôn được xử lý trước con.
     */
    @Query("SELECT p FROM Page p WHERE p.user = :user AND p.isDeleted = false " +
            "ORDER BY p.depth ASC, p.sortOrder ASC")
    List<Page> findAllActiveByUser(@Param("user") User user);

    /**
     * Lấy page theo id nếu chưa bị xóa
     */
    @Query("SELECT p FROM Page p WHERE p.id = :id AND p.isDeleted = false")
    Optional<Page> findActiveById(@Param("id") UUID id);

    /**
     * Tìm sort_order lớn nhất trong cùng cha (để auto-set sortOrder = max + 1)
     */
    @Query("SELECT COALESCE(MAX(p.sortOrder), -1) FROM Page p " +
            "WHERE p.user = :user AND p.isDeleted = false " +
            "AND (:parentId IS NULL AND p.parent IS NULL OR p.parent.id = :parentId)")
    int findMaxSortOrder(@Param("user") User user, @Param("parentId") UUID parentId);

    /**
     * Lấy tất cả children trực tiếp chưa xóa của 1 page (dùng khi cascade soft delete)
     */
    @Query("SELECT p FROM Page p WHERE p.parent.id = :parentId AND p.isDeleted = false")
    List<Page> findActiveChildrenByParentId(@Param("parentId") UUID parentId);

    /**
     * Soft delete toàn bộ descendants của 1 page (theo path prefix)
     */
    @Modifying
    @Query("UPDATE Page p SET p.isDeleted = true, p.deletedAt = :deletedAt " +
            "WHERE p.path LIKE :pathPrefix AND p.isDeleted = false")
    void softDeleteByPathPrefix(@Param("pathPrefix") String pathPrefix,
                                @Param("deletedAt") LocalDateTime deletedAt);

    @Query("SELECT COUNT(p) > 0 FROM Page p WHERE p.id = :targetId AND p.path LIKE :ancestorPath")
    boolean isDescendantOf(@Param("targetId") UUID targetId,
                           @Param("ancestorPath") String ancestorPath);

    /**
     * Cập nhật path và depth cho tất cả descendants khi di chuyển cha
     */
    @Modifying
    @Query("UPDATE Page p SET p.depth = p.depth + :depthDelta, " +
           "p.path = CONCAT(:newPath, SUBSTRING(p.path, LENGTH(:oldPath) + 1)) " +
           "WHERE p.path LIKE :pathPrefix AND p.isDeleted = false")
    void updateDescendantsPathAndDepth(@Param("oldPath") String oldPath,
                                       @Param("newPath") String newPath,
                                       @Param("depthDelta") int depthDelta,
                                       @Param("pathPrefix") String pathPrefix);

    /**
     * Tìm kiếm trang theo từ khóa (tiêu đề & nội dung) và bộ lọc loại trang.
     */
    @Query(value = "SELECT * FROM pages p WHERE p.user_id = :userId AND p.is_deleted = false " +
            "AND (:pageType IS NULL OR p.page_type = :pageType) " +
            "AND (:keyword IS NULL OR :keyword = '' OR LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(CAST(p.content AS text)) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "ORDER BY p.updated_at DESC LIMIT 50", nativeQuery = true)
    List<Page> searchPages(@Param("userId") UUID userId, 
                           @Param("keyword") String keyword, 
                           @Param("pageType") String pageType);
}
