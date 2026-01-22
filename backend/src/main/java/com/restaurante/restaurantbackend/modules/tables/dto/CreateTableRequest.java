package com.restaurante.restaurantbackend.modules.tables.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTableRequest {
    private Integer tableNumber;
    private Integer capacity;
    private String location;
}
