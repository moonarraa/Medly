-- CreateTable
CREATE TABLE "inventory" (
    "item_id" TEXT NOT NULL,
    "medication_name" TEXT NOT NULL,
    "strength" TEXT NOT NULL,
    "quantity_in_stock" INTEGER NOT NULL DEFAULT 0,
    "reorder_threshold" INTEGER NOT NULL DEFAULT 20,
    "unit" TEXT NOT NULL DEFAULT 'packs',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("item_id")
);
