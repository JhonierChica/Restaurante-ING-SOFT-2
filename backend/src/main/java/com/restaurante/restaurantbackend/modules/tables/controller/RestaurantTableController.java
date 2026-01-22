package com.restaurante.restaurantbackend.modules.tables.controller;

import com.restaurante.restaurantbackend.modules.tables.dto.CreateTableRequest;
import com.restaurante.restaurantbackend.modules.tables.dto.TableResponse;
import com.restaurante.restaurantbackend.modules.tables.dto.UpdateTableRequest;
import com.restaurante.restaurantbackend.modules.tables.model.RestaurantTable;
import com.restaurante.restaurantbackend.modules.tables.service.RestaurantTableService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
public class RestaurantTableController {

    private final RestaurantTableService tableService;

    public RestaurantTableController(RestaurantTableService tableService) {
        this.tableService = tableService;
    }

    @PostMapping
    public ResponseEntity<TableResponse> createTable(@RequestBody CreateTableRequest request) {
        try {
            TableResponse response = tableService.createTable(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            throw new RuntimeException("Error creating table: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<TableResponse>> getAllTables(
            @RequestParam(required = false) Boolean activeOnly,
            @RequestParam(required = false) String status) {
        
        if (status != null) {
            RestaurantTable.TableStatus tableStatus = RestaurantTable.TableStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(tableService.getTablesByStatus(tableStatus));
        }
        
        List<TableResponse> tables = activeOnly != null && activeOnly
                ? tableService.getActiveTables()
                : tableService.getAllTables();
        return ResponseEntity.ok(tables);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TableResponse> getTableById(@PathVariable Long id) {
        try {
            TableResponse table = tableService.getTableById(id);
            return ResponseEntity.ok(table);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/number/{tableNumber}")
    public ResponseEntity<TableResponse> getTableByNumber(@PathVariable Integer tableNumber) {
        try {
            TableResponse table = tableService.getTableByNumber(tableNumber);
            return ResponseEntity.ok(table);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<TableResponse> updateTable(
            @PathVariable Long id,
            @RequestBody UpdateTableRequest request) {
        try {
            TableResponse response = tableService.updateTable(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            throw new RuntimeException("Error updating table: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTable(@PathVariable Long id) {
        try {
            tableService.deleteTable(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
