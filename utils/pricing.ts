// utils/pricing.ts
import type { ServiceRecipe, Material } from '../types';

export interface ServiceCostBreakdown {
    costOfMaterialsPerService: number;
    costWithAdditionals: number;
    laborCost: number;
    totalCost: number; // Includes safety margin
}

export const calculateServiceCostBreakdown = (
    recipe: ServiceRecipe, 
    materialsMap: Map<string, Material>, 
    costPerMinute: number
): ServiceCostBreakdown => {
    const costOfMaterials = recipe.materialsUsed.reduce((sum, item) => {
        const material = materialsMap.get(item.materialId);
        if (!material) return sum;
        const costPerUnit = material.packagePrice / material.packageSize;
        return sum + (item.quantity * costPerUnit);
    }, 0);

    const yields = recipe.yields > 0 ? recipe.yields : 1;
    
    const costOfMaterialsPerService = costOfMaterials / yields;
    const costWithAdditionals = costOfMaterialsPerService * (recipe.additionalCostsPercent / 100);
    const laborCost = (recipe.executionTime * costPerMinute) / yields;

    const subtotal = costOfMaterialsPerService + costWithAdditionals + laborCost;
    const totalCost = subtotal * (1 + recipe.safetyMarginPercent / 100);
    
    return { costOfMaterialsPerService, costWithAdditionals, laborCost, totalCost };
};