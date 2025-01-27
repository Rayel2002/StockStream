import { Inventory } from "../models/Inventory.js";
import { info, debug, error } from "../utils/logger.js";
import {
  createInventoryItem,
  validateInventoryData,
  assignBarcode,
  generateUniqueSku,
  editInventoryItemService,
  updateInventoryItemService,
  getInventoryDetailService,
  getInventoryItemsService,
} from "../services/inventoryServices/inventoryService.js";

export const getAllInventory = async (req, res) => {
  try {
    info("[Controller] GET /inventory aangeroepen");
    const { items, totalItems, limit, page } = await getInventoryItemsService(
      req.query
    );
    return res.json({ items, totalItems, limit, page }); 
  } catch (err) {
    error("[Controller] Fout bij ophalen van inventaris", {
      error: err.message,
    });
    return res
      .status(500)
      .json({ message: "Fout bij ophalen van inventaris", error: err.message });
  }
};

export const getInventoryDetail = async (req, res) => {
  try {
    info("[Controller] GET /inventory/:id aangeroepen", { params: req.params });
    const response = await getInventoryDetailService(req.params.id);
    return res.status(200).json(response);
  } catch (err) {
    error("[Controller] Fout bij ophalen van inventarisitem", {
      error: err.message,
    });
    return res.status(500).json({
      message: "Fout bij ophalen van inventarisitem",
      error: err.message,
    });
  }
};

export const createNewInventoryItem = async (req, res) => {
  try {
    const validationResult = await validateInventoryData(req.body);
    if (!validationResult.isValid) {
      return res.status(400).json({
        message: "Validatiefouten gedetecteerd",
        errors: validationResult.errors,
      });
    }
    if (!req.body.sku) {
      req.body.sku = await generateUniqueSku(req.body.category || "GENE");
      info("SKU automatisch gegenereerd", { sku: req.body.sku });
    }

    if (!req.body.barcode) {
      req.body.barcode = await assignBarcode(req.body.warehouseNumber || 0);
      info("Barcode automatisch gegenereerd", { barcode: req.body.barcode });
    }

    const newItem = await createInventoryItem(req.body);
    info("Inventarisitem succesvol aangemaakt", { newItem });

    return res.status(201).json("Inventarisitem succesvol aangemaakt");
  } catch (err) {
    error("Fout bij aanmaken van inventarisitem", { error: err.message });
    return res.status(500).json({
      message: "Kan inventaris niet toevoegen",
      error: err.message,
    });
  }
};
export const editInventoryItem = async (req, res) => {
  try {
    info("[Controller] PUT /inventory/:id aangeroepen", {
      params: req.params,
      requestBody: req.body,
    });

    const updatedItem = await editInventoryItemService(req.params.id, req.body);

    info("[Controller] Inventarisitem succesvol bijgewerkt", {
      id: updatedItem._id,
      name: updatedItem.name,
    });
    return res.status(200).json(updatedItem);
  } catch (err) {
    error("[Controller] Fout bij bijwerken van inventarisitem", {
      error: err.message,
    });
    return res.status(500).json({
      message: "Kan inventarisitem niet bijwerken",
      error: err.message,
    });
  }
};

/**
 * Update an inventory item partially (PATCH).
 */
export const updateInventoryItem = async (req, res) => {
  try {
    info("[Controller] PATCH /inventory/:id aangeroepen", {
      params: req.params,
      requestBody: req.body,
    });

    const updatedItem = await updateInventoryItemService(
      req.params.id,
      req.body
    );

    info("[Controller] Inventarisitem succesvol bijgewerkt", {
      id: updatedItem._id,
      name: updatedItem.name,
    });
    return res.status(200).json(updatedItem);
  } catch (err) {
    error("[Controller] Fout bij updaten van inventarisitem", {
      error: err.message,
    });
    return res.status(500).json({
      message: "Kan inventarisitem niet updaten",
      error: err.message,
    });
  }
};
