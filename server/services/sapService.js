/**
 * SAP Service for STO Synchronization
 * Handles connection to SAP S/4HANA OData services and material mapping.
 */

// materialMapping: SAP Material Number -> Internal Specs
// Example: "MAT-250-K7-6M" -> { diameter: 250, material_class: 'K7', length: '6.0M' }
// This can be moved to a database table later if it grows large.
const materialMapping = {
    "100001": { diameter: 250, material_class: "K7", length: "6.0M" },
    "100002": { diameter: 250, material_class: "K9", length: "6.0M" },
    "100003": { diameter: 350, material_class: "K7", length: "6.0M" },
    // Add more mappings here as needed
};

/**
 * Fetch STO details from SAP S/4HANA
 * @param {string} stoNumber 
 * @param {string} user 
 * @param {string} password 
 */
async function fetchStoFromSap(stoNumber, user, password) {
    const sapUrl = process.env.SAP_ODATA_URL || 'https://sap-gateway.example.com/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV';

    // In a real S/4HANA environment, you might use:
    // GET /A_PurchaseOrder(PurchaseOrder='{stoNumber}')/to_PurchaseOrderItem

    const url = `${sapUrl}/A_PurchaseOrderItems?$filter=PurchaseOrder eq '${stoNumber}'`;

    const auth = Buffer.from(`${user}:${password}`).toString('base64');

    // Using native fetch (Node 18+)
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json',
            'x-csrf-token': 'fetch' // Some SAP services require CSRF token
        }
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Invalid SAP credentials or access denied.');
        }
        if (response.status === 404) {
            throw new Error('STO not found in SAP.');
        }
        throw new Error(`SAP Sync failed with status: ${response.status}`);
    }

    const data = await response.json();

    // Map SAP items to tracker items
    // Assuming OData structure: data.d.results or data.value
    const sapItems = data.value || (data.d && data.d.results) || [];

    return sapItems.map(item => {
        const mapped = materialMapping[item.Material] || null;
        return {
            sap_item_id: item.PurchaseOrderItem,
            material: item.Material,
            quantity: parseFloat(item.OrderQuantity),
            unit: item.PurchaseOrderQuantityUnit,
            batch: item.Batch || '', // SAP Batch field
            diameter: mapped ? mapped.diameter : null,
            material_class: mapped ? mapped.material_class : null,
            length: mapped ? mapped.length : null,
            plant: item.Plant
        };
    });
}

/**
 * Fallback mapping helper for dynamic mapping if specific table entry is missing
 */
function tryDynamicMapping(sapMaterialCode) {
    // Implement logic to parse material code if it follows a pattern
    // e.g. DI250K7L6 -> diameter 250, class K7, length 6
    return null;
}

module.exports = {
    fetchStoFromSap,
    materialMapping
};
