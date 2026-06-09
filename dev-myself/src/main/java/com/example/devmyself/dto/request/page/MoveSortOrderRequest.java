package com.example.devmyself.dto.request.page;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class MoveSortOrderRequest {

    @NotNull(message = "Thứ tự sắp xếp không được null")
    @Min(value = 0, message = "Thứ tự sắp xếp phải >= 0")
    private Integer sortOrder;
}
