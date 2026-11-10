import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import csv
import os

# 10 Different Trial Medicines for Pharmacy Database Stock Import
medicines = [
    {
        "name": "Dolo 650 Tablet",
        "saltName": "Paracetamol 650 mg",
        "manufacturer": "Micro Labs Ltd",
        "batchNo": "DL-8942",
        "expiryDate": "2027-11-30",
        "quantity": 150,
        "unit": "15 Tablets / Strip",
        "purchaseRate": 24.50,
        "mrp": 33.60,
        "schedule": "Non-Schedule / OTC",
        "rackLocation": "Rack A-01",
        "freeScheme": "10+1"
    },
    {
        "name": "Pan 40 Tablet",
        "saltName": "Pantoprazole Gastro-Resistant 40 mg",
        "manufacturer": "Alkem Laboratories Ltd",
        "batchNo": "PN-5120",
        "expiryDate": "2028-03-31",
        "quantity": 100,
        "unit": "15 Tablets / Strip",
        "purchaseRate": 98.00,
        "mrp": 155.00,
        "schedule": "Schedule H",
        "rackLocation": "Rack B-03",
        "freeScheme": "10+1"
    },
    {
        "name": "Azithral 500 Tablet",
        "saltName": "Azithromycin 500 mg",
        "manufacturer": "Alembic Pharmaceuticals Ltd",
        "batchNo": "AZ-7731",
        "expiryDate": "2027-08-31",
        "quantity": 80,
        "unit": "5 Tablets / Strip",
        "purchaseRate": 84.00,
        "mrp": 132.50,
        "schedule": "Schedule H1",
        "rackLocation": "Rack H1-02",
        "freeScheme": "20+2"
    },
    {
        "name": "Montek LC Tablet",
        "saltName": "Montelukast 10 mg + Levocetirizine 5 mg",
        "manufacturer": "Sun Pharmaceutical Industries Ltd",
        "batchNo": "ML-4190",
        "expiryDate": "2027-12-31",
        "quantity": 120,
        "unit": "10 Tablets / Strip",
        "purchaseRate": 135.00,
        "mrp": 215.00,
        "schedule": "Schedule H",
        "rackLocation": "Rack C-02",
        "freeScheme": "10+1"
    },
    {
        "name": "Glycomet GP 1 Tablet",
        "saltName": "Glimepiride 1 mg + Metformin Hydrochloride 500 mg (SR)",
        "manufacturer": "USV Private Limited",
        "batchNo": "GM-6204",
        "expiryDate": "2028-01-31",
        "quantity": 90,
        "unit": "15 Tablets / Strip",
        "purchaseRate": 76.00,
        "mrp": 118.00,
        "schedule": "Schedule H",
        "rackLocation": "Rack D-01",
        "freeScheme": "15+1"
    },
    {
        "name": "Telma 40 Tablet",
        "saltName": "Telmisartan 40 mg",
        "manufacturer": "Glenmark Pharmaceuticals Ltd",
        "batchNo": "TL-9301",
        "expiryDate": "2027-09-30",
        "quantity": 110,
        "unit": "15 Tablets / Strip",
        "purchaseRate": 148.00,
        "mrp": 228.00,
        "schedule": "Schedule H",
        "rackLocation": "Rack D-04",
        "freeScheme": "10+1"
    },
    {
        "name": "Shelcal 500 Tablet",
        "saltName": "Calcium 500 mg + Vitamin D3 250 IU",
        "manufacturer": "Torrent Pharmaceuticals Ltd",
        "batchNo": "SH-3188",
        "expiryDate": "2028-05-31",
        "quantity": 140,
        "unit": "15 Tablets / Strip",
        "purchaseRate": 88.50,
        "mrp": 131.00,
        "schedule": "Non-Schedule / Nutritional",
        "rackLocation": "Rack E-02",
        "freeScheme": "10+1"
    },
    {
        "name": "Cefix 200 Tablet",
        "saltName": "Cefixime Trihydrate 200 mg",
        "manufacturer": "Cipla Ltd",
        "batchNo": "CF-1092",
        "expiryDate": "2027-06-30",
        "quantity": 75,
        "unit": "10 Tablets / Strip",
        "purchaseRate": 72.00,
        "mrp": 114.50,
        "schedule": "Schedule H1",
        "rackLocation": "Rack H1-01",
        "freeScheme": "10+1"
    },
    {
        "name": "Ascoril D Plus Syrup",
        "saltName": "Dextromethorphan HBr 10 mg + Chlorpheniramine 2 mg + Phenylephrine 5 mg / 5ml",
        "manufacturer": "Glenmark Pharmaceuticals Ltd",
        "batchNo": "AS-8819",
        "expiryDate": "2027-10-31",
        "quantity": 60,
        "unit": "100 ml Bottle",
        "purchaseRate": 82.00,
        "mrp": 129.00,
        "schedule": "Schedule H",
        "rackLocation": "Syrup Section B",
        "freeScheme": "12+1"
    },
    {
        "name": "Becosules Z Capsule",
        "saltName": "B-Complex Forte with Vitamin C & Zinc",
        "manufacturer": "Pfizer Limited",
        "batchNo": "BC-7241",
        "expiryDate": "2028-06-30",
        "quantity": 180,
        "unit": "20 Capsules / Strip",
        "purchaseRate": 34.00,
        "mrp": 51.50,
        "schedule": "Non-Schedule / OTC",
        "rackLocation": "Rack A-03",
        "freeScheme": "20+2"
    }
]

headers = [
    "Medicine Name",
    "Composition",
    "Manufacturer",
    "Batch No",
    "Expiry Date",
    "Quantity",
    "Unit",
    "Purchase Rate",
    "MRP",
    "Drug Schedule",
    "Rack Location",
    "Bulk Free Scheme"
]

# Generate Excel Workbook (.xlsx)
wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Medicine Stock Inventory"

# Styling definitions
header_fill = PatternFill(start_color="135C7E", end_color="135C7E", fill_type="solid")
header_font = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
border_thin = Side(border_style="thin", color="CBD5E1")
cell_border = Border(left=border_thin, right=border_thin, top=border_thin, bottom=border_thin)

zebra_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")

# Write headers
ws.append(headers)
for col_idx in range(1, len(headers) + 1):
    cell = ws.cell(row=1, column=col_idx)
    cell.fill = header_fill
    cell.font = header_font
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    cell.border = cell_border

# Write data rows
for row_idx, med in enumerate(medicines, start=2):
    row_data = [
        med["name"],
        med["saltName"],
        med["manufacturer"],
        med["batchNo"],
        med["expiryDate"],
        med["quantity"],
        med["unit"],
        med["purchaseRate"],
        med["mrp"],
        med["schedule"],
        med["rackLocation"],
        med["freeScheme"]
    ]
    ws.append(row_data)
    
    is_even = (row_idx % 2 == 0)
    for col_idx in range(1, len(headers) + 1):
        cell = ws.cell(row=row_idx, column=col_idx)
        cell.font = Font(name="Segoe UI", size=10)
        cell.border = cell_border
        if is_even:
            cell.fill = zebra_fill
        
        # Format numbers and alignments
        if col_idx in [1, 2, 3]: # Name, Salt, Mfg
            cell.alignment = Alignment(horizontal="left", vertical="center")
        elif col_idx in [4, 5, 10, 11, 12]: # Batch, Exp, Schedule, Rack, Scheme
            cell.alignment = Alignment(horizontal="center", vertical="center")
        elif col_idx == 6: # Quantity
            cell.alignment = Alignment(horizontal="right", vertical="center")
            cell.number_format = "#,##0"
        elif col_idx in [8, 9]: # Purchase Rate, MRP
            cell.alignment = Alignment(horizontal="right", vertical="center")
            cell.number_format = "₹#,##0.00"

# Auto-adjust column widths
ws.row_dimensions[1].height = 28
for row_idx in range(2, len(medicines) + 2):
    ws.row_dimensions[row_idx].height = 22

for col_idx in range(1, len(headers) + 1):
    col_letter = get_column_letter(col_idx)
    max_len = max(len(str(ws.cell(row=r, column=col_idx).value or "")) for r in range(1, len(medicines) + 2))
    ws.column_dimensions[col_letter].width = max(max_len + 5, 14)

ws.freeze_panes = "A2"

xlsx_path = os.path.join(os.getcwd(), "trial_stock_10_medicines.xlsx")
wb.save(xlsx_path)
print(f"Created Excel file: {xlsx_path} ({os.path.getsize(xlsx_path)} bytes)")

# Generate CSV File (.csv)
csv_path = os.path.join(os.getcwd(), "trial_stock_10_medicines.csv")
with open(csv_path, mode="w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(headers)
    for med in medicines:
        writer.writerow([
            med["name"],
            med["saltName"],
            med["manufacturer"],
            med["batchNo"],
            med["expiryDate"],
            med["quantity"],
            med["unit"],
            med["purchaseRate"],
            med["mrp"],
            med["schedule"],
            med["rackLocation"],
            med["freeScheme"]
        ])
print(f"Created CSV file: {csv_path} ({os.path.getsize(csv_path)} bytes)")
