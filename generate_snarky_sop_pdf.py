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
        
        # Top header banner
        self.setFillColor(colors.HexColor("#0f172a"))
        self.rect(0, 10.45 * inch, 8.5 * inch, 0.55 * inch, fill=1, stroke=0)
        self.setFillColor(colors.HexColor("#ea580c"))
        self.rect(0, 10.42 * inch, 8.5 * inch, 0.03 * inch, fill=1, stroke=0)
        
        self.setFont("Helvetica-Bold", 8.5)
        self.setFillColor(colors.white)
        self.drawCentredString(4.25 * inch, 10.65 * inch, "SNARKY HUMANS — ADMIN STANDARD OPERATING PROCEDURE: FEATURED DESIGN SCHEDULER")

        # Bottom footer bar
        self.setFillColor(colors.HexColor("#0f172a"))
        self.rect(0, 0, 8.5 * inch, 0.45 * inch, fill=1, stroke=0)
        self.setFillColor(colors.HexColor("#334155"))
        self.rect(0, 0.45 * inch, 8.5 * inch, 0.01 * inch, fill=1, stroke=0)
        
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#94a3b8"))
        self.drawString(0.5 * inch, 0.18 * inch, "Confidential — Snarky Humans Storefront Operations")
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
    fontSize=9.5,
    leading=13,
    textColor=colors.HexColor("#475569"),
    spaceAfter=8
)

h1_style = ParagraphStyle(
    'Heading1_Custom',
    parent=styles['Heading2'],
    fontName='Helvetica-Bold',
    fontSize=11,
    leading=15,
    textColor=colors.HexColor("#0f172a"),
    spaceBefore=9,
    spaceAfter=4,
    keepWithNext=True
)

h2_style = ParagraphStyle(
    'Heading2_Custom',
    parent=styles['Heading3'],
    fontName='Helvetica-Bold',
    fontSize=9.5,
    leading=13,
    textColor=colors.HexColor("#c2410c"),
    spaceBefore=6,
    spaceAfter=2,
    keepWithNext=True
)

body_style = ParagraphStyle(
    'Body_Custom',
    parent=styles['BodyText'],
    fontName='Helvetica',
    fontSize=8.5,
    leading=12,
    textColor=colors.HexColor("#334155"),
    spaceAfter=4
)

code_style = ParagraphStyle(
    'Code_Custom',
    parent=styles['BodyText'],
    fontName='Courier',
    fontSize=7.5,
    leading=10,
    textColor=colors.HexColor("#0f172a")
)

callout_style = ParagraphStyle(
    'Callout_Custom',
    parent=styles['BodyText'],
    fontName='Helvetica',
    fontSize=8,
    leading=11.5,
    textColor=colors.HexColor("#1e293b"),
    backColor=colors.HexColor("#f8fafc"),
    borderColor=colors.HexColor("#cbd5e1"),
    borderWidth=1,
    borderPadding=6,
    spaceAfter=6,
    borderRadius=4
)

tip_style = ParagraphStyle(
    'Tip_Custom',
    parent=styles['BodyText'],
    fontName='Helvetica',
    fontSize=8,
    leading=11.5,
    textColor=colors.HexColor("#1e3a8a"),
    backColor=colors.HexColor("#eff6ff"),
    borderColor=colors.HexColor("#93c5fd"),
    borderWidth=1,
    borderPadding=6,
    spaceAfter=6,
    borderRadius=4
)

important_style = ParagraphStyle(
    'Important_Custom',
    parent=styles['BodyText'],
    fontName='Helvetica',
    fontSize=8,
    leading=11.5,
    textColor=colors.HexColor("#9a3412"),
    backColor=colors.HexColor("#fff7ed"),
    borderColor=colors.HexColor("#fdba74"),
    borderWidth=1,
    borderPadding=6,
    spaceAfter=6,
    borderRadius=4
)

story = []

# Header & Document Info
story.append(Paragraph("Snarky Humans — Featured Design Scheduling SOP", doc_title_style))
story.append(Paragraph("<b>Standard Operating Procedure:</b> Storefront Curation &amp; Monthly Event Scheduling &nbsp;|&nbsp; <b>Version:</b> 2.1 &nbsp;|&nbsp; <b>Role:</b> Store Administrator", doc_sub_style))
story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#ea580c"), spaceBefore=2, spaceAfter=8))

# 1. Purpose & Overview
story.append(Paragraph("1. Purpose & Operational Overview", h1_style))
story.append(Paragraph(
    "The <b>Featured Designs</b> section on the Snarky Humans homepage (<code>/</code>) is the primary merchandising showcase. "
    "This SOP guides administrators on how to curate, spotlight, and schedule monthly holiday and seasonal design collections (e.g., Labor Day, Grandparents Day, Halloween, Holiday Gift Guides) using the internal Admin Scheduler.",
    body_style
))

# 2. Step-by-Step Procedure Table
story.append(Paragraph("2. Step-by-Step Scheduling Workflow", h1_style))

sop_steps = [
    [Paragraph("<b>Step #</b>", body_style), Paragraph("<b>Operational Action</b>", body_style), Paragraph("<b>Admin Controls &amp; System Behavior</b>", body_style)],
    [
        Paragraph("<b>Step 1</b>", body_style),
        Paragraph("<b>Sign in to Admin Dashboard</b><br/>Navigate to <code>/admin/dashboard</code> (or <code>/admin</code>). Log in with your admin credentials (<code>teamsienvi@gmail.com</code>).", body_style),
        Paragraph("Requires authorized admin role. Directs to the management control center.", body_style)
    ],
    [
        Paragraph("<b>Step 2</b>", body_style),
        Paragraph("<b>Open Featured Schedule Tab</b><br/>Click on the <b>Featured Design Scheduler</b> section in the navigation menu.", body_style),
        Paragraph("Displays the calendar month selector and the full design library.", body_style)
    ],
    [
        Paragraph("<b>Step 3</b>", body_style),
        Paragraph("<b>Select Target Calendar Month</b><br/>Use the Month dropdown to pick the upcoming or active month (e.g. <i>Month 7: August</i>, <i>Month 8: September</i>, etc.).", body_style),
        Paragraph("The dashboard automatically fetches existing headlines, theme tags, and active design IDs for that month from Supabase.", body_style)
    ],
    [
        Paragraph("<b>Step 4</b>", body_style),
        Paragraph("<b>Configure Headline &amp; Event Themes</b><br/>Review or edit the showcase <b>Headline</b>, <b>Subheadline</b>, and <b>Theme Badges</b> (e.g. <i>[Labor Day Snark]</i>, <i>[Grandparents Day]</i>).", body_style),
        Paragraph("These headlines appear dynamically at the top of the homepage Featured section.", body_style)
    ],
    [
        Paragraph("<b>Step 5</b>", body_style),
        Paragraph("<b>Select &amp; Toggle Featured Designs</b><br/>Scroll through the design catalog grid. Check the checkbox on each design card you wish to spotlight. Recommended count: <b>4 to 8 designs</b>.", body_style),
        Paragraph("Selected cards show an orange active border. Event-tagged items automatically receive matching promotional badges.", body_style)
    ],
    [
        Paragraph("<b>Step 6</b>", body_style),
        Paragraph("<b>Save Schedule to Database</b><br/>Click the green <b>Save Schedule</b> button at the bottom of the scheduler.", body_style),
        Paragraph("Commits changes to <code>public.featured_schedules</code> in Supabase. A green confirmation toast will appear.", body_style)
    ],
    [
        Paragraph("<b>Step 7</b>", body_style),
        Paragraph("<b>Verify Storefront Live View</b><br/>Open the public homepage (<code>/</code>). Verify the Featured Designs carousel displays your chosen designs and correct event badges.", body_style),
        Paragraph("Public visitors receive the updated roster in real-time without requiring a website rebuild.", body_style)
    ],
]

t_sop = Table(sop_steps, colWidths=[0.7 * inch, 4.2 * inch, 2.6 * inch])
t_sop.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('TOPPADDING', (0, 0), (-1, -1), 3),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
]))
story.append(t_sop)

# Page Break for Clean 2-Page Layout
story.append(PageBreak())

# 3. Merchandising Priority Cascade
story.append(Paragraph("3. Merchandising Priority Cascade (Storefront Display Logic)", h1_style))
story.append(Paragraph(
    "To ensure the homepage never displays an empty section or broken state, <code>ProductGrid.tsx</code> enforces a strict 3-tier priority sequence:",
    body_style
))

cascade_data = [
    [Paragraph("<b>Priority Level</b>", body_style), Paragraph("<b>Source / Mechanism</b>", body_style), Paragraph("<b>Trigger Condition</b>", body_style)],
    [
        Paragraph("<b>1. Admin Scheduled (Highest)</b>", body_style),
        Paragraph("Active <code>featured_schedules</code> record in Supabase for current month.", body_style),
        Paragraph("Admin has explicitly saved a design selection for the active calendar month.", body_style)
    ],
    [
        Paragraph("<b>2. Seasonal Event Fallback</b>", body_style),
        Paragraph("Automatic keyword / tag matching (e.g. Q3: Labor Day, Grandparents Day, 9/11, Hispanic Heritage).", body_style),
        Paragraph("No admin schedule is saved, but seasonal event designs exist in the catalog.", body_style)
    ],
    [
        Paragraph("<b>3. Catalog Default (Safety Net)</b>", body_style),
        Paragraph("First 8 active designs in the catalog database.", body_style),
        Paragraph("Fallback when neither an admin schedule nor event tags are matched.", body_style)
    ],
]

t_cascade = Table(cascade_data, colWidths=[2.2 * inch, 2.8 * inch, 2.5 * inch])
t_cascade.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f8fafc")),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('TOPPADDING', (0, 0), (-1, -1), 3.5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
]))
story.append(t_cascade)
story.append(Spacer(1, 6))

# 4. Hidden & Excluded Design Guardrails
story.append(Paragraph("4. Hidden & Excluded Design Guardrails", h1_style))
story.append(Paragraph(
    "Certain designs are intentionally excluded from active storefront grids (including non-featured holiday variants, out-of-season products, and placeholder mockups). "
    "These are centrally governed in <code>src/lib/designConstants.ts</code>:",
    body_style
))

guardrail_box = (
    "<b>Protected Exclusion Patterns:</b><br/>"
    "• <i>Non-Featured Labor Day:</i> 'World Takes All the Credit', 'Fueled by Caffeine & Deadlines', 'Deserves More Than a Holiday', 'Adulting Is Hard'<br/>"
    "• <i>Seasonal / Internal Placeholders:</i> 'Just Here for the Ice Cream', 'Red, White & Scoops', 'CEOs of Chaos', 'World\'s Okayest Parent', 'Powered by Love', 'Snacks Are Currency', 'Raising Humans Is Exhausting', 'Snarky Humans'<br/>"
    "• <i>Rule:</i> If an admin checks an excluded design in the scheduler, it will automatically remain hidden from public browsing grids until removed from the exclusion list."
)
story.append(Paragraph(guardrail_box, important_style))

# 5. Active August 2026 / Q3 Event Roster
story.append(Paragraph("5. Active August 2026 Event Showcase Reference", h1_style))

roster_data = [
    [Paragraph("<b>Design ID</b>", body_style), Paragraph("<b>Event / Collection Theme</b>", body_style), Paragraph("<b>Display Status</b>", body_style)],
    [Paragraph("<code>06f3fc3f-bb59-46b5-b603-44c31150d707</code>", code_style), Paragraph("Labor Day — Work &amp; Attitude Humor", body_style), Paragraph("Live &amp; Featured", body_style)],
    [Paragraph("<code>d036dfc5-6d3c-423f-bfee-1012b8c25ac8</code>", code_style), Paragraph("Grandparents Day — Professional Spoilers", body_style), Paragraph("Live &amp; Featured", body_style)],
    [Paragraph("<code>446fe0b3-b4d3-4f8d-a795-cb97387c19d8</code>", code_style), Paragraph("9/11 Patriot Day — Remembrance &amp; Honor", body_style), Paragraph("Live &amp; Featured", body_style)],
    [Paragraph("<code>8817bdc3-4029-4e4d-96e9-575bf12887be</code>", code_style), Paragraph("Hispanic Heritage Month — Orgullo &amp; Cultura", body_style), Paragraph("Live &amp; Featured", body_style)],
    [Paragraph("<code>4699aa27-6f14-4c9a-8456-6f1a6b445104</code>", code_style), Paragraph("Bestseller — Core Brand Humor", body_style), Paragraph("Live &amp; Featured", body_style)],
]

t_roster = Table(roster_data, colWidths=[3.1 * inch, 3.1 * inch, 1.3 * inch])
t_roster.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('TOPPADDING', (0, 0), (-1, -1), 3),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
]))
story.append(t_roster)
story.append(Spacer(1, 6))

# 6. Admin Troubleshooting & Quick Reference
story.append(Paragraph("6. Administrator Troubleshooting & Quick Reference", h1_style))

trouble_items = [
    [Paragraph("<b>Scenario</b>", body_style), Paragraph("<b>Cause &amp; Remediation</b>", body_style)],
    [
        Paragraph("New schedule not visible on homepage", body_style),
        Paragraph("Browser cache or CDN edge cache. Do a hard refresh (<code>Ctrl+F5</code> or <code>Cmd+Shift+R</code>). Verify Supabase database updated successfully.", body_style)
    ],
    [
        Paragraph("Save button does not respond", body_style),
        Paragraph("Admin authentication session has expired. Log out and re-authenticate at <code>/admin/dashboard</code> with <code>teamsienvi@gmail.com</code>.", body_style)
    ],
    [
        Paragraph("Design checkbox is disabled or greyed out", body_style),
        Paragraph("The design is marked <code>is_active = false</code> in the main product catalog. Re-enable the product before adding to featured schedules.", body_style)
    ],
]

t_trouble = Table(trouble_items, colWidths=[2.6 * inch, 4.9 * inch])
t_trouble.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f8fafc")),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('TOPPADDING', (0, 0), (-1, -1), 3),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
]))
story.append(t_trouble)

doc.build(story, canvasmaker=NumberedCanvas)
print("Snarky Humans Featured Designs SOP PDF generated successfully at:", pdf_path)
