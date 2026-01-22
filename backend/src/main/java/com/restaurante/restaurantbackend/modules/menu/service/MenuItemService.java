package com.restaurante.restaurantbackend.modules.menu.service;

import com.restaurante.restaurantbackend.modules.categories.model.Category;
import com.restaurante.restaurantbackend.modules.categories.repository.CategoryRepository;
import com.restaurante.restaurantbackend.modules.menu.dto.CreateMenuItemRequest;
import com.restaurante.restaurantbackend.modules.menu.dto.MenuItemResponse;
import com.restaurante.restaurantbackend.modules.menu.dto.UpdateMenuItemRequest;
import com.restaurante.restaurantbackend.modules.menu.model.MenuItem;
import com.restaurante.restaurantbackend.modules.menu.repository.MenuItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoryRepository;

    public MenuItemService(MenuItemRepository menuItemRepository, CategoryRepository categoryRepository) {
        this.menuItemRepository = menuItemRepository;
        this.categoryRepository = categoryRepository;
    }

    public MenuItemResponse createMenuItem(CreateMenuItemRequest request) {
        // Validar que la categoría existe
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));

        MenuItem menuItem = new MenuItem();
        menuItem.setName(request.getName());
        menuItem.setDescription(request.getDescription());
        menuItem.setPrice(request.getPrice());
        menuItem.setCategory(category);
        menuItem.setImageUrl(request.getImageUrl());
        menuItem.setPreparationTime(request.getPreparationTime());
        menuItem.setIsVegetarian(request.getIsVegetarian() != null ? request.getIsVegetarian() : false);
        menuItem.setIsVegan(request.getIsVegan() != null ? request.getIsVegan() : false);
        menuItem.setIsGlutenFree(request.getIsGlutenFree() != null ? request.getIsGlutenFree() : false);
        menuItem.setIsSpicy(request.getIsSpicy() != null ? request.getIsSpicy() : false);
        menuItem.setCalories(request.getCalories());
        menuItem.setAvailable(true);

        MenuItem savedMenuItem = menuItemRepository.save(menuItem);
        return mapToResponse(savedMenuItem);
    }

    @Transactional(readOnly = true)
    public List<MenuItemResponse> getAllMenuItems() {
        return menuItemRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MenuItemResponse> getAvailableMenuItems() {
        return menuItemRepository.findByAvailableTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MenuItemResponse getMenuItemById(Long id) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found with id: " + id));
        return mapToResponse(menuItem);
    }

    @Transactional(readOnly = true)
    public List<MenuItemResponse> getMenuItemsByCategory(Long categoryId) {
        return menuItemRepository.findByCategoryId(categoryId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MenuItemResponse> getAvailableMenuItemsByCategory(Long categoryId) {
        return menuItemRepository.findByCategoryIdAndAvailableTrue(categoryId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MenuItemResponse> getVegetarianMenuItems() {
        return menuItemRepository.findByIsVegetarianTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MenuItemResponse> getVeganMenuItems() {
        return menuItemRepository.findByIsVeganTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MenuItemResponse> getGlutenFreeMenuItems() {
        return menuItemRepository.findByIsGlutenFreeTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public MenuItemResponse updateMenuItem(Long id, UpdateMenuItemRequest request) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found with id: " + id));

        if (request.getName() != null) {
            menuItem.setName(request.getName());
        }

        if (request.getDescription() != null) {
            menuItem.setDescription(request.getDescription());
        }

        if (request.getPrice() != null) {
            menuItem.setPrice(request.getPrice());
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));
            menuItem.setCategory(category);
        }

        if (request.getImageUrl() != null) {
            menuItem.setImageUrl(request.getImageUrl());
        }

        if (request.getAvailable() != null) {
            menuItem.setAvailable(request.getAvailable());
        }

        if (request.getPreparationTime() != null) {
            menuItem.setPreparationTime(request.getPreparationTime());
        }

        if (request.getIsVegetarian() != null) {
            menuItem.setIsVegetarian(request.getIsVegetarian());
        }

        if (request.getIsVegan() != null) {
            menuItem.setIsVegan(request.getIsVegan());
        }

        if (request.getIsGlutenFree() != null) {
            menuItem.setIsGlutenFree(request.getIsGlutenFree());
        }

        if (request.getIsSpicy() != null) {
            menuItem.setIsSpicy(request.getIsSpicy());
        }

        if (request.getCalories() != null) {
            menuItem.setCalories(request.getCalories());
        }

        MenuItem updatedMenuItem = menuItemRepository.save(menuItem);
        return mapToResponse(updatedMenuItem);
    }

    public void deleteMenuItem(Long id) {
        if (!menuItemRepository.existsById(id)) {
            throw new RuntimeException("Menu item not found with id: " + id);
        }
        menuItemRepository.deleteById(id);
    }

    public void toggleAvailability(Long id) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found with id: " + id));
        menuItem.setAvailable(!menuItem.getAvailable());
        menuItemRepository.save(menuItem);
    }

    private MenuItemResponse mapToResponse(MenuItem menuItem) {
        return MenuItemResponse.builder()
                .id(menuItem.getId())
                .name(menuItem.getName())
                .description(menuItem.getDescription())
                .price(menuItem.getPrice())
                .categoryId(menuItem.getCategory().getId())
                .categoryName(menuItem.getCategory().getName())
                .imageUrl(menuItem.getImageUrl())
                .available(menuItem.getAvailable())
                .preparationTime(menuItem.getPreparationTime())
                .isVegetarian(menuItem.getIsVegetarian())
                .isVegan(menuItem.getIsVegan())
                .isGlutenFree(menuItem.getIsGlutenFree())
                .isSpicy(menuItem.getIsSpicy())
                .calories(menuItem.getCalories())
                .createdAt(menuItem.getCreatedAt())
                .updatedAt(menuItem.getUpdatedAt())
                .build();
    }
}
