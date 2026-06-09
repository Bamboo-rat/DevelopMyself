package com.example.devmyself.dto.request.page;

import lombok.Getter;

@Getter
public class UpdateIconRequest {

    /**
     * Emoji (vd: "📝") hoặc URL ảnh icon.
     * Nếu null hoặc rỗng → xóa icon hiện tại.
     */
    private String icon;
}
