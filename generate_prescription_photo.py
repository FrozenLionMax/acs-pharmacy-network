import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math
import random

def create_rx_photo(output_path="trial_handwritten_rx_5_medicines.jpg"):
    # High resolution 1400 x 1950 canvas
    canvas_w = 1400
    canvas_h = 1950

    # Create wood desk background
    bg = Image.new("RGB", (canvas_w, canvas_h), (45, 34, 25))
    draw_bg = ImageDraw.Draw(bg)

    # Add wood grain effect
    for y in range(0, canvas_h, 3):
        shade = 38 + int(12 * math.sin(y / 40.0)) + random.randint(-4, 4)
        draw_bg.line([(0, y), (canvas_w, y)], fill=(shade, shade - 8, shade - 15), width=3)

    # Paper pad dimensions
    pad_w = 1180
    pad_h = 1750
    pad_x = 110
    pad_y = 100

    # Draw soft paper shadow
    shadow = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    draw_shadow = ImageDraw.Draw(shadow)
    draw_shadow.rounded_rectangle(
        [pad_x + 12, pad_y + 16, pad_x + pad_w + 12, pad_y + pad_h + 16],
        radius=14,
        fill=(15, 12, 10, 140)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(16))
    bg.paste(shadow, (0, 0), shadow)

    # Create Rx paper sheet
    paper = Image.new("RGBA", (pad_w, pad_h), (252, 251, 248, 255))
    draw_paper = ImageDraw.Draw(paper)

    # Subtle paper grain / micro texture
    for _ in range(12000):
        px = random.randint(0, pad_w - 1)
        py = random.randint(0, pad_h - 1)
        draw_paper.point((px, py), fill=(random.randint(235, 248), random.randint(234, 246), random.randint(230, 242), 255))

    # Font definitions
    font_path_arial = "C:\\Windows\\Fonts\\arial.ttf"
    font_path_arial_bold = "C:\\Windows\\Fonts\\arialbd.ttf"
    font_path_hand = "C:\\Windows\\Fonts\\Inkfree.ttf"
    font_path_script = "C:\\Windows\\Fonts\\segoesc.ttf"
    font_path_print = "C:\\Windows\\Fonts\\segoeprb.ttf"

    font_clinic_title = ImageFont.truetype(font_path_arial_bold, 36)
    font_clinic_sub = ImageFont.truetype(font_path_arial, 20)
    font_doc_name = ImageFont.truetype(font_path_arial_bold, 28)
    font_doc_qual = ImageFont.truetype(font_path_arial, 19)
    font_rx_symbol = ImageFont.truetype(font_path_arial_bold, 64)
    font_printed_labels = ImageFont.truetype(font_path_arial_bold, 20)
    font_handwriting = ImageFont.truetype(font_path_hand, 38)
    font_handwriting_lg = ImageFont.truetype(font_path_hand, 42)
    font_hand_inst = ImageFont.truetype(font_path_hand, 28)
    font_signature = ImageFont.truetype(font_path_script, 36)
    font_stamp = ImageFont.truetype(font_path_arial_bold, 18)

    # Colors
    c_teal = (19, 92, 126)
    c_dark_slate = (30, 41, 59)
    c_light_slate = (100, 116, 139)
    c_blue_ink = (24, 52, 128)      # Ballpoint blue pen ink
    c_blue_ink_soft = (34, 70, 150)
    c_purple_stamp = (109, 40, 217, 185) # Medical council stamp

    # --- 1. Printed Clinic Header ---
    draw_paper.rectangle([(40, 35), (pad_w - 40, 40)], fill=c_teal)
    draw_paper.text((60, 55), "DEORIA CLINICAL CARE & CHEST HOSPITAL", fill=c_teal, font=font_clinic_title)
    draw_paper.text((60, 100), "Subhash Chowk, Station Road, Deoria, Uttar Pradesh - 274001 | Tel: +91 94520 18273", fill=c_light_slate, font=font_clinic_sub)

    # Doctor credentials on top right
    draw_paper.text((pad_w - 530, 55), "Dr. R. K. Mishra, MBBS, MD (Med)", fill=c_dark_slate, font=font_doc_name)
    draw_paper.text((pad_w - 530, 92), "Consultant Physician & Chest Specialist", fill=c_teal, font=font_doc_qual)
    draw_paper.text((pad_w - 530, 118), "Reg No: MCI-UP-48192 (MCI & UP Medical Council)", fill=c_light_slate, font=font_clinic_sub)

    draw_paper.line([(40, 155), (pad_w - 40, 155)], fill=(203, 213, 225), width=2)

    # --- 2. Patient Demographics Row ---
    y_patient = 175
    # Patient Name
    draw_paper.text((60, y_patient), "Patient Name:", fill=c_dark_slate, font=font_printed_labels)
    draw_paper.line([(200, y_patient + 26), (620, y_patient + 26)], fill=(148, 163, 184), width=1)
    draw_paper.text((215, y_patient - 8), "Satish Chandra Verma", fill=c_blue_ink, font=font_handwriting)

    # Age / Gender
    draw_paper.text((650, y_patient), "Age / Gender:", fill=c_dark_slate, font=font_printed_labels)
    draw_paper.line([(790, y_patient + 26), (920, y_patient + 26)], fill=(148, 163, 184), width=1)
    draw_paper.text((800, y_patient - 8), "48 Y / M", fill=c_blue_ink, font=font_handwriting)

    # Date
    draw_paper.text((945, y_patient), "Date:", fill=c_dark_slate, font=font_printed_labels)
    draw_paper.line([(1005, y_patient + 26), (pad_w - 60, y_patient + 26)], fill=(148, 163, 184), width=1)
    draw_paper.text((1015, y_patient - 8), "10/11/2026", fill=c_blue_ink, font=font_handwriting)

    # Row 2: OPD No & Vitals
    y_vitals = 225
    draw_paper.text((60, y_vitals), "OPD Slip No:", fill=c_dark_slate, font=font_printed_labels)
    draw_paper.line([(190, y_vitals + 26), (360, y_vitals + 26)], fill=(148, 163, 184), width=1)
    draw_paper.text((205, y_vitals - 8), "OPD-4819", fill=c_blue_ink, font=font_handwriting)

    draw_paper.text((380, y_vitals), "Vitals / BP:", fill=c_dark_slate, font=font_printed_labels)
    draw_paper.line([(500, y_vitals + 26), (720, y_vitals + 26)], fill=(148, 163, 184), width=1)
    draw_paper.text((515, y_vitals - 8), "BP: 130/84, SpO2: 98%", fill=c_blue_ink, font=font_handwriting)

    draw_paper.text((745, y_vitals), "Diagnosis:", fill=c_dark_slate, font=font_printed_labels)
    draw_paper.line([(855, y_vitals + 26), (pad_w - 60, y_vitals + 26)], fill=(148, 163, 184), width=1)
    draw_paper.text((865, y_vitals - 8), "Acute Bronchitis & Pyrexia", fill=c_blue_ink, font=font_handwriting)

    draw_paper.line([(40, 275), (pad_w - 40, 275)], fill=(203, 213, 225), width=2)

    # --- 3. Big Traditional Rx Symbol ---
    draw_paper.text((60, 300), "℞", fill=c_teal, font=font_rx_symbol)

    # Medical notepad light ruling lines for realistic Rx writing
    for line_y in range(410, 1380, 185):
        draw_paper.line([(140, line_y), (pad_w - 60, line_y)], fill=(226, 232, 240), width=1)

    # --- 4. 5 Handwritten Medicines ---
    # Realistic layout with medicine name, strength, dosage and frequency
    medicines = [
        {
            "num": "1.",
            "name": "Tab. Augmentin 625 Duo",
            "salt": "(Amoxicillin + Clavulanic Acid 625 mg)",
            "dosage": "1 tab  BD  x  5 days  (After food)",
            "y": 380
        },
        {
            "num": "2.",
            "name": "Tab. Dolo 650",
            "salt": "(Paracetamol 650 mg)",
            "dosage": "1 tab  SOS  for fever / body pain",
            "y": 565
        },
        {
            "num": "3.",
            "name": "Tab. Pan 40",
            "salt": "(Pantoprazole 40 mg)",
            "dosage": "1 tab  OD  x  5 days  (Empty stomach morning)",
            "y": 750
        },
        {
            "num": "4.",
            "name": "Tab. Azithral 500",
            "salt": "(Azithromycin 500 mg)",
            "dosage": "1 tab  OD  x  3 days  (1 hr before lunch)",
            "y": 935
        },
        {
            "num": "5.",
            "name": "Tab. Montek LC",
            "salt": "(Montelukast 10 mg + Levocetirizine 5 mg)",
            "dosage": "1 tab  HS  x  5 days  (At bedtime)",
            "y": 1120
        }
    ]

    for med in medicines:
        my = med["y"]
        # Medicine number and brand name in bold blue ink
        draw_paper.text((150, my), f"{med['num']} {med['name']}", fill=c_blue_ink, font=font_handwriting_lg)
        # Salt chemical formula in smaller cursive
        draw_paper.text((195, my + 50), med["salt"], fill=c_blue_ink_soft, font=font_hand_inst)
        # Dosage, frequency and instructions
        draw_paper.text((195, my + 90), f"Sig:  {med['dosage']}", fill=c_blue_ink, font=font_handwriting)

    # Clinical Advice note
    draw_paper.text((150, 1330), "Advise: Plenty of warm fluids, steam inhalation twice daily.", fill=c_blue_ink_soft, font=font_hand_inst)
    draw_paper.text((150, 1370), "Review after 5 days if cough persists.", fill=c_blue_ink_soft, font=font_hand_inst)

    # --- 5. Bottom Section: Signatures & Medical Council Stamp ---
    draw_paper.line([(40, 1440), (pad_w - 40, 1440)], fill=(203, 213, 225), width=2)

    # Left: Pharmacist dispensing notice
    draw_paper.text((60, 1465), "STATUTORY DISPENSING INSTRUCTIONS:", fill=c_dark_slate, font=font_printed_labels)
    draw_paper.text((60, 1495), "• Schedule H / H1 drugs to be dispensed by Registered Pharmacist only.", fill=c_light_slate, font=font_clinic_sub)
    draw_paper.text((60, 1522), "• Verify batch number, expiry date and intact blister packaging.", fill=c_light_slate, font=font_clinic_sub)
    draw_paper.text((60, 1550), "• Not valid for dispensing after 30 days from date of prescription.", fill=c_light_slate, font=font_clinic_sub)

    # Right: Doctor's Cursive Signature
    draw_paper.text((pad_w - 450, 1475), "R.K. Mishra", fill=c_blue_ink, font=font_signature)
    draw_paper.line([(pad_w - 460, 1540), (pad_w - 80, 1540)], fill=c_dark_slate, width=1)
    draw_paper.text((pad_w - 450, 1550), "Dr. R. K. Mishra, MBBS, MD", fill=c_dark_slate, font=font_printed_labels)
    draw_paper.text((pad_w - 450, 1575), "Reg No: MCI-UP-48192", fill=c_light_slate, font=font_clinic_sub)

    # Add realistic circular purple clinic stamp overlay
    stamp_img = Image.new("RGBA", (260, 260), (0, 0, 0, 0))
    draw_stamp = ImageDraw.Draw(stamp_img)
    # Double ring stamp
    draw_stamp.ellipse([(10, 10), (250, 250)], outline=c_purple_stamp, width=4)
    draw_stamp.ellipse([(20, 20), (240, 240)], outline=c_purple_stamp, width=2)
    draw_stamp.text((50, 60), "DR. R.K. MISHRA", fill=c_purple_stamp, font=font_stamp)
    draw_stamp.text((65, 95), "MBBS, MD", fill=c_purple_stamp, font=font_stamp)
    draw_stamp.text((35, 130), "MCI-UP-48192", fill=c_purple_stamp, font=font_stamp)
    draw_stamp.text((55, 165), "DEORIA (U.P.)", fill=c_purple_stamp, font=font_stamp)

    # Rotate stamp slightly (-12 degrees) like real hand stamps
    stamp_rotated = stamp_img.rotate(-14, resample=Image.BICUBIC, expand=True)
    paper.paste(stamp_rotated, (pad_w - 490, 1420), stamp_rotated)

    # Bottom footer line
    draw_paper.rectangle([(40, pad_h - 45), (pad_w - 40, pad_h - 40)], fill=c_teal)
    draw_paper.text((pad_w // 2 - 270, pad_h - 32), "Timings: 10:00 AM - 2:00 PM & 5:00 PM - 8:30 PM (Sunday Closed)", fill=c_light_slate, font=ImageFont.truetype(font_path_arial, 16))

    # Paste paper onto wood desk
    bg.paste(paper.convert("RGB"), (pad_x, pad_y))

    # Save to disk
    bg.save(output_path, "JPEG", quality=95)
    print(f"Prescription photo generated successfully at: {os.path.abspath(output_path)}")
    return os.path.abspath(output_path)

if __name__ == "__main__":
    create_rx_photo()
