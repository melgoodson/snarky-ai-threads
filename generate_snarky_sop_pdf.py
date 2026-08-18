import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

pdf_path = r"c:\Users\Iris\OneDrive\Work\snarky-ai-threads\Snarky_Humans_Featured_Designs_Admin_SOP.pdf"

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
        self.setFillColor(colors.HexColor("#0f172a"))
        self.rect(0, 10.45 * inch, 8.5 * inch, 0.55 * inch, fill=1, stroke=0)
        self.setFillColor(colors.HexColor("#ea580c"))
        self.rect(0, 10.42 * inch, 8.5 * inch, 0.03 * inch, fill=1, stroke=0)
        
        self.setFont("Helvetica-Bold", 9)
        self.setFillColor(colors.white)
        self.drawCentredString(4.25 * inch, 10.65 * inch, "SNARKY HUMANS — ADMIN GUIDE: HOW TO UPDATE FEATURED DESIGNS")

        # Footer
        self.setFillColor(colors.HexColor("#0f172a"))
        self.rect(0, 0, 8.5 * inch, 0.45 * inch, fill=1, stroke=0)
        self.setFillColor(colors.HexColor("#334155"))
        self.rect(0, 0.45 * inch, 8.5 * inch, 0.01 * inch, fill=1, stroke=0)
        
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#94a3b8"))
        self.drawString(0.5 * inch, 0.18 * inch, "Snarky Humans Store Operations — Easy Admin Guide")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.0 * inch, 0.18 * inch, page_str)
        
        self.restoreState()

doc = SimpleDocTemplate(
    pdf_path,
    pagesize=letter,
    leftMargin=0.55 * inch,
    rightMargin=0.55 * inch,
    topMargin=0.8 * inch,
    bottomMargin=0.6 * inch
)

styles = getSampleStyleSheet()

doc_title_style = ParagraphStyle(
    'DocTitle',
    parent=styles['Heading1'],
    fontName='Helvetica-Bold',
    fontSize=18,
    leading=22,
    textColor=colors.HexColor("#0f172a"),
    spaceAfter=3
)

doc_sub_style = ParagraphStyle(
    'DocSubTitle',
    parent=styles['Heading2'],
    fontName='Helvetica',
    fontSize=10,
    leading=14,
    textColor=colors.HexColor("#475569"),
    spaceAfter=8
)

h1_style = ParagraphStyle(
    'Heading1_Custom',
    parent=styles['Heading2'],
    fontName='Helvetica-Bold',
    fontSize=12,
    leading=16,
    textColor=colors.HexColor("#0f172a"),
    spaceBefore=10,
    spaceAfter=4,
    keepWithNext=True
)

body_style = ParagraphStyle(
    'Body_Custom',
    parent=styles['BodyText'],
    fontName='Helvetica',
    fontSize=9,
    leading=13.5,
    textColor=colors.HexColor("#334155"),
    spaceAfter=5
)

step_num_style = ParagraphStyle(
    'StepNum',
    parent=styles['BodyText'],
    fontName='Helvetica-Bold',
    fontSize=10,
    leading=14,
    textColor=colors.HexColor("#ea580c")
)

step_title_style = ParagraphStyle(
    'StepTitle',
    parent=styles['BodyText'],
    fontName='Helvetica-Bold',
    fontSize=9.5,
    leading=13.5,
    textColor=colors.HexColor("#0f172a")
)

step_desc_style = ParagraphStyle(
    'StepDesc',
    parent=styles['BodyText'],
    fontName='Helvetica',
    fontSize=8.5,
    leading=12.5,
    textColor=colors.HexColor("#334155")
)

tip_style = ParagraphStyle(
    'Tip_Custom',
    parent=styles['BodyText'],
    fontName='Helvetica',
    fontSize=8.5,
    leading=12.5,
    textColor=colors.HexColor("#1e3a8a"),
    backColor=colors.HexColor("#eff6ff"),
    borderColor=colors.HexColor("#93c5fd"),
    borderWidth=1,
    borderPadding=7,
    spaceAfter=8,
    borderRadius=4
)

highlight_box = ParagraphStyle(
    'HighlightBox',
    parent=styles['BodyText'],
    fontName='Helvetica',
    fontSize=8.5,
    leading=12.5,
    textColor=colors.HexColor("#9a3412"),
    backColor=colors.HexColor("#fff7ed"),
    borderColor=colors.HexColor("#fdba74"),
    borderWidth=1,
    borderPadding=7,
    spaceAfter=8,
    borderRadius=4
)

story = []

# Title & Subtitle
story.append(Paragraph("How to Update Featured Designs on the Homepage", doc_title_style))
story.append(Paragraph("A quick and easy guide for store managers to spotlight monthly themes, holiday shirts, and popular products.", doc_sub_style))
story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#ea580c"), spaceBefore=2, spaceAfter=8))

# Section 1: Overview
story.append(Paragraph("1. What Is the Featured Designs Section?", h1_style))
story.append(Paragraph(
    "The <b>Featured Designs</b> area is the main showcase at the top of the Snarky Humans homepage. "
    "It gives shoppers an immediate look at what is trending, new, or perfect for upcoming holidays (such as Labor Day, Grandparents Day, Halloween, or Christmas). "
    "Using the <b>Featured Design Scheduler</b>, you can choose which shirts appear on the homepage for any month with just a few clicks.",
    body_style
))

# Section 2: Step-by-Step Instructions
story.append(Paragraph("2. 5 Easy Steps to Update Your Featured Designs", h1_style))

steps_data = [
    [
        Paragraph("<b>Step</b>", step_num_style),
        Paragraph("<b>What to Do</b>", step_title_style),
        Paragraph("<b>Details &amp; Tips</b>", step_title_style)
    ],
    [
        Paragraph("<b>Step 1</b>", step_num_style),
        Paragraph("<b>Log into the Admin Dashboard</b>", step_title_style),
        Paragraph("Go to your admin link (e.g. <code>/admin/dashboard</code>) and enter your admin email and password.", step_desc_style)
    ],
    [
        Paragraph("<b>Step 2</b>", step_num_style),
        Paragraph("<b>Open the Featured Scheduler</b>", step_title_style),
        Paragraph("Click on the <b>Featured Design Scheduler</b> tab in the menu.", step_desc_style)
    ],
    [
        Paragraph("<b>Step 3</b>", step_num_style),
        Paragraph("<b>Select the Month</b>", step_title_style),
        Paragraph("Use the dropdown to pick the month you want to set up (for example: <i>August</i> for Labor Day, <i>October</i> for Halloween). You can plan upcoming months in advance!", step_desc_style)
    ],
    [
        Paragraph("<b>Step 4</b>", step_num_style),
        Paragraph("<b>Check or Edit Your Headline</b>", step_title_style),
        Paragraph("Review the headline and subheadline (e.g. <i>'HOLIDAYS & ATTITUDE'</i>). This is the catchy title customers see right above the shirts.", step_desc_style)
    ],
    [
        Paragraph("<b>Step 5</b>", step_num_style),
        Paragraph("<b>Select Your Designs &amp; Save</b>", step_title_style),
        Paragraph("Simply click the checkbox on the designs you want to feature (we recommend <b>4 to 8 designs</b>). When you're ready, click the green <b>Save Schedule</b> button at the bottom.", step_desc_style)
    ],
]

t_steps = Table(steps_data, colWidths=[0.8 * inch, 2.5 * inch, 4.0 * inch])
t_steps.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(t_steps)
story.append(Spacer(1, 4))

story.append(Paragraph(
    "<b>Pro Tip:</b> You can verify your changes immediately! Just open the homepage (<code>snarkyhumans.com</code>) in a new browser tab to see your new featured shirts live.",
    tip_style
))

# Page Break for Clean 2-Page Layout
story.append(PageBreak())

# Section 3: Best Practices
story.append(Paragraph("3. Best Merchandising Practices", h1_style))

best_practices = [
    [Paragraph("<b>Topic</b>", step_title_style), Paragraph("<b>Recommendation</b>", step_title_style)],
    [
        Paragraph("<b>How many designs should I pick?</b>", body_style),
        Paragraph("Between <b>4 and 8 designs</b> is the sweet spot. This looks great on both mobile phones and desktop computers without overwhelming the customer.", body_style)
    ],
    [
        Paragraph("<b>Match the season or holiday</b>", body_style),
        Paragraph("Update your schedule at the start of each month to feature upcoming holidays (e.g., patriotic themes in July, back-to-work humor in August/September, spooky snark in October, gift shirts in December).", body_style)
    ],
    [
        Paragraph("<b>Mix humor styles</b>", body_style),
        Paragraph("Include a blend of your top-selling snarky quotes, relatable daily humor, and holiday-specific gifts to appeal to different shoppers.", body_style)
    ],
]

t_best = Table(best_practices, colWidths=[2.6 * inch, 4.7 * inch])
t_best.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f8fafc")),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(t_best)
story.append(Spacer(1, 6))

# Section 4: What Happens Automatically (Safety Nets)
story.append(Paragraph("4. Built-in Safety Nets (No Tech Hassle)", h1_style))
story.append(Paragraph(
    "You never have to worry about the homepage looking empty or broken:",
    body_style
))

safety_data = [
    [
        Paragraph("<b>Automatic Fallback:</b> If a new month starts and you haven't selected designs yet, the website will automatically display active seasonal designs or popular bestsellers.", body_style)
    ],
    [
        Paragraph("<b>Filtered Catalog:</b> Out-of-season drafts or unreleased designs are automatically filtered out, so you will only ever see clean, ready-to-sell products.", body_style)
    ],
    [
        Paragraph("<b>Instant Publishing:</b> No website rebuilding or developer assistance is required—clicking <b>Save Schedule</b> publishes your updates instantly.", body_style)
    ],
]

t_safety = Table(safety_data, colWidths=[7.3 * inch])
t_safety.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(t_safety)
story.append(Spacer(1, 6))

# Section 5: Frequently Asked Questions (FAQ)
story.append(Paragraph("5. Frequently Asked Questions (FAQ)", h1_style))

faq_data = [
    [Paragraph("<b>Question</b>", step_title_style), Paragraph("<b>Answer</b>", step_title_style)],
    [
        Paragraph("<b>I saved my changes, but I don't see them on the homepage?</b>", body_style),
        Paragraph("Your browser may be holding onto a saved page. Simply do a quick hard refresh (press <b>Ctrl + F5</b> on Windows or <b>Cmd + Shift + R</b> on Mac).", body_style)
    ],
    [
        Paragraph("<b>Can I schedule future months in advance?</b>", body_style),
        Paragraph("Yes! You can select any upcoming month in the dropdown, pick the designs, and save. When that calendar month begins, the website will switch automatically.", body_style)
    ],
    [
        Paragraph("<b>Can I change the featured designs anytime?</b>", body_style),
        Paragraph("Yes, you can edit or swap out designs as often as you want—daily, weekly, or monthly.", body_style)
    ],
]

t_faq = Table(faq_data, colWidths=[2.8 * inch, 4.5 * inch])
t_faq.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('TOPPADDING', (0, 0), (-1, -1), 3.5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
]))
story.append(t_faq)

doc.build(story, canvasmaker=NumberedCanvas)
print("Simplified Non-Technical SOP PDF generated successfully at:", pdf_path)
