package com.example.devmyself.dto.request.page;

import lombok.Getter;

import java.util.UUID;

@Getter
public class MoveParentRequest {

    /**
     * UUID của page cha mới.
     * Nếu null → di chuyển lên root (trở thành page gốc).
     */
    private UUID newParentId;
}
