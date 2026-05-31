import prisma from '../db.js'

function deriveStatus(qty, threshold) {
  if (qty <= threshold) return 'LOW'
  if (qty <= Math.floor(threshold * 1.5)) return 'WATCH'
  return 'OK'
}

function fmt(item) {
  return {
    id: item.item_id,
    medication_name: item.medication_name,
    strength: item.strength,
    quantity_in_stock: item.quantity_in_stock,
    reorder_threshold: item.reorder_threshold,
    unit: item.unit,
    status: deriveStatus(item.quantity_in_stock, item.reorder_threshold),
    updated_at: item.updated_at,
  }
}

export async function listInventory(req, res, next) {
  try {
    const items = await prisma.inventoryItem.findMany({ orderBy: { medication_name: 'asc' } })
    res.json(items.map(fmt))
  } catch (err) {
    next(err)
  }
}

export async function updateStock(req, res, next) {
  try {
    const { id } = req.params
    const { quantity_in_stock } = req.body

    if (quantity_in_stock === undefined || quantity_in_stock < 0) {
      return res.status(400).json({ error: 'quantity_in_stock must be a non-negative number' })
    }

    const item = await prisma.inventoryItem.findUnique({ where: { item_id: id } })
    if (!item) return res.status(404).json({ error: 'Inventory item not found' })

    const updated = await prisma.inventoryItem.update({
      where: { item_id: id },
      data: { quantity_in_stock: Number(quantity_in_stock) },
    })

    await prisma.auditLog.create({
      data: {
        user_id: req.user.userId,
        action: 'UPDATE_STOCK',
        entity_type: 'InventoryItem',
        entity_id: id,
        details: `${item.medication_name} ${item.strength}: ${item.quantity_in_stock} → ${quantity_in_stock}`,
        ip_address: req.ip || '0.0.0.0',
      },
    })

    res.json(fmt(updated))
  } catch (err) {
    next(err)
  }
}
