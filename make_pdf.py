import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

pdf_path = r"c:\Users\Iris\OneDrive\Work\snarky-ai-threads\Admin_Featured_Design_Scheduler_Walkthrough.pdf"

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        
        # Header banner
        self.setFillColor(colors.HexColor("#020617"))
        self.rect(0, 10.4 * inch, 8.5 * inch, 0.6 * inch, fill=1, stroke=0)
        self.setFillColor(colors.HexColor("#ea580c"))
        self.rect(0, 10.38 * inch, 8.5 * inch, 0.02 * inch, fill=1, stroke=0)
        
        self.setFont("Helvetica-Bold", 10)
        self.setFillColor(colors.white)
        self.drawCentredString(4.25 * inch, 10.62 * inch, "SNARKY A$$ HUMANS — ADMIN FEATURED DESIGN SCHEDULER REPORT")

        # Footer
        self.setFillColor(colors.HexColor("#020617"))
        self.rect(0, 0, 8.5 * inch, 0.45 * inch, fill=1, stroke=0)
        self.setFillColor(colors.HexColor("#334155"))
        self.rect(0, 0.45 * inch, 8.5 * inch, 0.01 * inch, fill=1, stroke=0)
        
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#94a3b8"))
        self.drawString(0.5 * inch, 0.18 * inch, "Confidential — Snarky A$$ Humans Internal Documentation")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.0 * inch, 0.18 * inch, page_str)
        
        self.restoreState()

doc = SimpleDocTemplate(
    pdf_path,
    pagesize=letter,
    leftMargin=0.5 * inch,
    rightMargin=0.5 * inch,
    topMargin=0.8 * inch,
    bottomMargin=0.6 * inch
)

styles = getSampleStyleSheet()

# Custom Styles
title_style = ParagraphStyle(
    'DocTitle',
    parent=styles['Heading1'],
    fontName='Helvetica-Bold',
    fontSize=22,
    leading=26,
    textColor=colors.HexColor("#0f172a"),
    spaceAfter=4
)

meta_style = ParagraphStyle(
    'MetaText',
    fontName='Helvetica',
    fontSize=10,
    leading=14,
    textColor=colors.HexColor("#475569"),
    spaceAfter=12
)

callout_style = ParagraphStyle(
    'Callout',
    fontName='Helvetica',
    fontSize=10,
    leading=14,
    textColor=colors.HexColor("#1e293b"),
    backColor=colors.HexColor("#ffedd5"),
    borderColor=colors.HexColor("#ea580c"),
    borderWidth=1,
    borderPadding=10,
    spaceAfter=14,
    borderRadius=4
)

h2_style = ParagraphStyle(
    'SectionH2',
    fontName='Helvetica-Bold',
    fontSize=14,
    leading=18,
    textColor=colors.HexColor("#c2410c"),
    spaceBefore=14,
    spaceAfter=8,
    keepWithNext=True
)

body_style = ParagraphStyle(
    'BodyTextCustom',
    fontName='Helvetica',
    fontSize=10,
    leading=14,
    textColor=colors.HexColor("#1e293b"),
    spaceAfter=8
)

tip_style = ParagraphStyle(
    'TipBox',
    fontName='Helvetica',
    fontSize=9.5,
    leading=13.5,
    textColor=colors.HexColor("#1e3a8a"),
    backColor=colors.HexColor("#dbeafe"),
    borderColor=colors.HexColor("#2563eb"),
    borderWidth=1,
    borderPadding=8,
    spaceAfter=12,
    borderRadius=4
)

note_style = ParagraphStyle(
    'NoteBox',
    fontName='Helvetica',
    fontSize=9.5,
    leading=13.5,
    textColor=colors.HexColor("#581c87"),
    backColor=colors.HexColor("#f3e8ff"),
    borderColor=colors.HexColor("#9333ea"),
    borderWidth=1,
    borderPadding=8,
    spaceBefore=10,
    spaceAfter=12,
    borderRadius=4
)

caption_style = ParagraphStyle(
    'Caption',
    fontName='Helvetica-Oblique',
    fontSize=8.5,
    leading=11,
    textColor=colors.HexColor("#64748b"),
    alignment=1,
    spaceAfter=14
)

story = []

# Title & Meta
story.append(Paragraph("Featured Design Scheduler — Admin Walkthrough", title_style))
story.append(Paragraph("<b>Date:</b> July 23, 2026 &nbsp;&nbsp;|&nbsp;&nbsp; <b>Status:</b> VERIFIED & RESOLVED &nbsp;&nbsp;|&nbsp;&nbsp; <b>Author:</b> Team Sienvi", meta_style))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceAfter=12))

# Callout
story.append(Paragraph("<b>What's new:</b> You can now schedule monthly featured design collections directly from the Admin Dashboard — no code changes needed. Upload images, auto-name them, pick which designs to spotlight, and preview exactly how the homepage will look.", callout_style))

# How to Access
story.append(Paragraph("How to Access", h2_style))
access_text = "1. Log in at <b>/admin</b><br/>2. Click the <b>Featured</b> tab in the dashboard"
story.append(Paragraph(access_text, body_style))

img1_path = r"C:/Users/Iris/.gemini/antigravity-ide/brain/e735e0ae-bb1a-4018-8500-51d9b611b733/admin_featured_top_1784760805586.png"
if os.path.exists(img1_path):
    img1 = RLImage(img1_path, width=7.2*inch, height=2.25*inch)
    story.append(img1)
    story.append(Spacer(1, 4))
    story.append(Paragraph("Figure 1: Featured tab with month selector, headline fields, and upload zone", caption_style))

areas_text = "You'll see four main areas:<br/>" \
             "• <b>Month Selector</b> (top-right) — pick any month to configure<br/>" \
             "• <b>Monthly Headline</b> card — set the title and description<br/>" \
             "• <b>Upload New Designs</b> — drag & drop images, they auto-name from filenames<br/>" \
             "• <b>Select Featured Designs</b> — pick which designs to spotlight"
story.append(Paragraph(areas_text, body_style))

story.append(PageBreak())

# Step 1
story.append(Paragraph("Step 1: Pick Your Designs", h2_style))
step1_text = "Scroll down to the <b>Select Featured Designs</b> grid. Click any design thumbnail to select it — selected ones get an orange border and checkmark. The counter badge updates automatically."
story.append(Paragraph(step1_text, body_style))

img2_path = r"C:/Users/Iris/.gemini/antigravity-ide/brain/e735e0ae-bb1a-4018-8500-51d9b611b733/admin_design_picker_1784760813778.png"
if os.path.exists(img2_path):
    img2 = RLImage(img2_path, width=7.2*inch, height=2.8*inch)
    story.append(img2)
    story.append(Spacer(1, 4))
    story.append(Paragraph("Figure 2: Design picker grid with selectable thumbnails", caption_style))

story.append(Paragraph("<b>TIP:</b> To upload <b>new</b> designs, use the Upload zone above the picker. Filenames auto-convert to titles — for example, <code>snarky_coffee_cat.png</code> becomes <b>Snarky Coffee Cat</b>.", tip_style))

# Step 2
story.append(Paragraph("Step 2: Set Headline & Subheadline", h2_style))
step2_text = "Fill in the <b>Headline</b> (shows as the big title on the homepage) and <b>Subheadline</b> (the description below it). Keep the <b>Active</b> checkbox checked so it goes live when the month arrives."
story.append(Paragraph(step2_text, body_style))

img3_path = r"C:/Users/Iris/.gemini/antigravity-ide/brain/e735e0ae-bb1a-4018-8500-51d9b611b733/admin_filled_form_1784760861789.png"
if os.path.exists(img3_path):
    img3 = RLImage(img3_path, width=7.2*inch, height=2.8*inch)
    story.append(img3)
    story.append(Spacer(1, 4))
    story.append(Paragraph("Figure 3: Filled form with headline, subheadline, and selected designs", caption_style))

story.append(PageBreak())

# Step 3
story.append(Paragraph("Step 3: Preview", h2_style))
step3_text = "Click the <b>Preview</b> button (top-right, next to Save) to see exactly how the featured section will look on the homepage."
story.append(Paragraph(step3_text, body_style))

img4_path = r"C:/Users/Iris/.gemini/antigravity-ide/brain/e735e0ae-bb1a-4018-8500-51d9b611b733/admin_preview_1784760888376.png"
if os.path.exists(img4_path):
    img4 = RLImage(img4_path, width=7.2*inch, height=2.8*inch)
    story.append(img4)
    story.append(Spacer(1, 4))
    story.append(Paragraph("Figure 4: Live preview of the homepage featured section", caption_style))

prev_text = "The preview shows:<br/>" \
            "• Your headline and subheadline<br/>" \
            "• Theme badges (if you added any)<br/>" \
            "• The selected designs in a grid with 'FEATURED' badges"
story.append(Paragraph(prev_text, body_style))

# Step 4
story.append(Paragraph("Step 4: Save", h2_style))
step4_text = "Click <b>Save</b> — you'll see a success confirmation. The schedule is now stored and will automatically display on the homepage when that month arrives."
story.append(Paragraph(step4_text, body_style))

img5_path = r"C:/Users/Iris/.gemini/antigravity-ide/brain/e735e0ae-bb1a-4018-8500-51d9b611b733/admin_saved_1784760900134.png"
if os.path.exists(img5_path):
    img5 = RLImage(img5_path, width=7.2*inch, height=1.6*inch)
    story.append(img5)
    story.append(Spacer(1, 4))
    story.append(Paragraph("Figure 5: Save confirmation toast notification", caption_style))

# Quick Reference
story.append(Paragraph("Quick Reference", h2_style))

table_data = [
    [Paragraph("<b>Action</b>", body_style), Paragraph("<b>How</b>", body_style)],
    [Paragraph("Switch month", body_style), Paragraph("Use the month dropdown (top-right)", body_style)],
    [Paragraph("Upload new designs", body_style), Paragraph("Drag images into the Upload zone", body_style)],
    [Paragraph("Select/deselect a design", body_style), Paragraph("Click its thumbnail", body_style)],
    [Paragraph("Add SEO theme badges", body_style), Paragraph("Use the Theme Badges section (label + keywords)", body_style)],
    [Paragraph("Preview homepage look", body_style), Paragraph("Click the Preview button", body_style)],
    [Paragraph("Save changes", body_style), Paragraph("Click Save", body_style)],
    [Paragraph("Deactivate a month", body_style), Paragraph("Uncheck the 'Active' checkbox", body_style)],
]

ref_table = Table(table_data, colWidths=[2.5*inch, 4.7*inch])
ref_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (1,0), colors.HexColor("#f1f5f9")),
    ('TEXTCOLOR', (0,0), (1,0), colors.HexColor("#0f172a")),
    ('ALIGN', (0,0), (-1,-1), 'LEFT'),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
]))

story.append(ref_table)

story.append(Paragraph("<b>NOTE:</b> If no schedule is saved for a month, the homepage automatically falls back to the default built-in themes — nothing breaks.", note_style))

doc.build(story, canvasmaker=NumberedCanvas)
print("PDF generated successfully at:", pdf_path)
