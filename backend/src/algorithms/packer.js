/**
 * SafePack Packing Algorithm
 * 
 * Greedy layered packing approach that minimizes crush/bruise risk
 * by intelligently ordering items in the delivery bag.
 */

const ROAD_BUMP_FACTORS = {
  smooth: 1.0,
  normal: 1.3,
  bumpy: 2.0,
};

const FOOD_CATEGORIES = ['Dairy', 'Produce', 'Bakery', 'Snacks', 'Grains', 'Beverages', 'Canned', 'Condiments'];
const CHEMICAL_CATEGORIES = ['Household'];

const MAX_BAG_WEIGHT = 10; // kg

/**
 * Check if two items are incompatible (e.g., chemicals + food)
 */
function checkIncompatibilities(items) {
  const hasFood = items.some(item => FOOD_CATEGORIES.includes(item.category));
  const hasChemical = items.some(item => CHEMICAL_CATEGORIES.includes(item.category));

  if (hasFood && hasChemical) {
    return {
      incompatible: true,
      message: 'Packer Instruction: Pack household chemicals separately from food items to prevent contamination.',
      chemicalItems: items.filter(i => CHEMICAL_CATEGORIES.includes(i.category)).map(i => i.name),
      foodItems: items.filter(i => FOOD_CATEGORIES.includes(i.category)).map(i => i.name),
    };
  }

  return { incompatible: false };
}

/**
 * Suggest bag splits if total weight exceeds limit
 */
function suggestBagSplit(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight * (item.quantity || 1), 0);

  if (totalWeight <= MAX_BAG_WEIGHT) {
    return { needsSplit: false, bags: 1, totalWeight: totalWeight.toFixed(2) };
  }

  const numBags = Math.ceil(totalWeight / MAX_BAG_WEIGHT);
  return {
    needsSplit: true,
    bags: numBags,
    totalWeight: totalWeight.toFixed(2),
    message: `Packer Instruction: Bag is too heavy (${totalWeight.toFixed(2)}kg). Split into ${numBags} bags.`,
  };
}

/**
 * Main packing optimization function
 * 
 * @param {Array} items - Array of items with weight, fragility, maxLoad, quantity
 * @param {string} roadCondition - 'smooth' | 'normal' | 'bumpy'
 * @returns {Object} Packing plan with ordered items, alerts, and statistics
 */
export function optimizePacking(items, roadCondition = 'normal') {
  const roadFactor = ROAD_BUMP_FACTORS[roadCondition] || 1.3;

  // Expand items by quantity (each unit is packed individually)
  const expandedItems = [];
  for (const item of items) {
    const qty = item.quantity || 1;
    for (let i = 0; i < qty; i++) {
      expandedItems.push({ ...item, quantity: 1, instanceId: `${item.id}-${i}` });
    }
  }

  // Sort: Primary by fragility ASC (sturdy at bottom), Secondary by weight DESC (heavier first)
  const sorted = [...expandedItems].sort((a, b) => {
    if (a.fragility !== b.fragility) return a.fragility - b.fragility;
    return b.weight - a.weight;
  });

  // Calculate pressure and bruise probability for each item
  const packedPlan = sorted.map((item, index) => {
    // Weight of everything placed ABOVE this item (items after it in the sorted order)
    const weightAbove = sorted
      .slice(index + 1)
      .reduce((sum, i) => sum + i.weight, 0);

    const bruiseProbability = Math.min(
      ((weightAbove / item.maxLoad) * roadFactor * 100),
      100
    );

    let status;
    if (weightAbove > item.maxLoad) {
      status = 'CRITICAL';
    } else if (weightAbove > item.maxLoad * 0.7) {
      status = 'WARNING';
    } else {
      status = 'SAFE';
    }

    return {
      ...item,
      stackPosition: index,
      layer: index === 0 ? 'BOTTOM' : (index === sorted.length - 1 ? 'TOP' : 'MIDDLE'),
      weightAbove: parseFloat(weightAbove.toFixed(2)),
      bruiseProbability: parseFloat(bruiseProbability.toFixed(1)),
      status,
    };
  });

  // Check incompatibilities
  const incompatibility = checkIncompatibilities(expandedItems);

  // Check bag split
  const bagSplit = suggestBagSplit(items);

  // Summary stats
  const criticalCount = packedPlan.filter(i => i.status === 'CRITICAL').length;
  const warningCount = packedPlan.filter(i => i.status === 'WARNING').length;
  const safeCount = packedPlan.filter(i => i.status === 'SAFE').length;

  return {
    packedStack: packedPlan,
    summary: {
      totalItems: packedPlan.length,
      totalWeight: parseFloat(expandedItems.reduce((s, i) => s + i.weight, 0).toFixed(2)),
      safe: safeCount,
      warnings: warningCount,
      critical: criticalCount,
      roadCondition,
      roadFactor,
    },
    incompatibility,
    bagSplit,
    alerts: [
      ...(criticalCount > 0 ? [{
        type: 'error',
        message: `Packer Instruction: ${criticalCount} item(s) will be crushed! Split heavy items into a new bag.`,
      }] : []),
      ...(warningCount > 0 ? [{
        type: 'warning',
        message: `Packer Instruction: ${warningCount} item(s) under HIGH PRESSURE. Handle with care or redistribute weight.`,
      }] : []),
      ...(incompatibility.incompatible ? [{
        type: 'error',
        message: incompatibility.message,
      }] : []),
      ...(bagSplit.needsSplit ? [{
        type: 'warning',
        message: bagSplit.message,
      }] : []),
    ],
  };
}
