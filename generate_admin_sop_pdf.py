import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

pdf_path = r"c:\Users\Iris\OneDrive\Work\snarky-ai-threads\Admin_Standard_Operating_Procedures_SOP.pdf"

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
        self.setFillColor(colors.HexColor("#f97316"))
        self.rect(0, 10.42 * inch, 8.5 * inch, 0.03 * inch, fill=1, stroke=0)
        
        self.setFont("Helvetica-Bold", 8.5)
        self.setFillColor(colors.white)
        self.drawCentredString(4.25 * inch, 10.65 * inch, "ADMIN STANDARD OPERATING PROCEDURE (SOP) — STOREFRONT & LMS PLATFORMS")

        # Footer
        self.setFillColor(colors.HexColor("#0f172a"))
        self.rect(0, 0, 8.5 * inch, 0.45 * inch, fill=1, stroke=0)
        self.setFillColor(colors.HexColor("#334155"))
        self.rect(0, 0.45 * inch, 8.5 * inch, 0.01 * inch, fill=1, stroke=0)
        
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#94a3b8"))
        self.drawString(0.5 * inch, 0.18 * inch, "Confidential — Internal Admin Operating Procedures")
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
    fontSize=11.5,
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

# Title & Metadata
story.append(Paragraph("Admin Standard Operating Procedure (SOP)", doc_title_style))
story.append(Paragraph("<b>Version:</b> 2.0 &nbsp;|&nbsp; <b>Effective Date:</b> August 2026 &nbsp;|&nbsp; <b>Authorized Audience:</b> Platform &amp; Community Administrators", doc_sub_style))
story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#ea580c"), spaceBefore=2, spaceAfter=8))

# Document Purpose
story.append(Paragraph("1. Purpose & Scope", h1_style))
story.append(Paragraph(
    "This Standard Operating Procedure (SOP) outlines the mandatory workflows for system administrators managing the <b>Snarky Humans Storefront</b> (featured designs &amp; holiday schedules) and the <b>PlayIQ LMS Platform</b> (dispatching onboarding invitations, waiver promo codes, and attached setup guides to beta testers).",
    body_style
))

# Section 1: Snarky Humans Storefront
story.append(Paragraph("2. SOP-01: Updating Featured Designs & Monthly Schedules (Snarky Humans)", h1_style))
story.append(Paragraph("Follow these instructions to schedule or replace the featured designs displayed on the storefront homepage.", body_style))

sop1_steps = [
    [Paragraph("<b>Step</b>", body_style), Paragraph("<b>Action / Procedure</b>", body_style), Paragraph("<b>Admin Controls &amp; Notes</b>", body_style)],
    [
        Paragraph("<b>1.1</b>", body_style),
        Paragraph("<b>Access Admin Dashboard</b><br/>Navigate to <code>/admin/dashboard</code> or <code>/admin</code>. Sign in using authorized admin credentials (<code>teamsienvi@gmail.com</code>).", body_style),
        Paragraph("Requires role authorization in Supabase auth schema.", body_style)
    ],
    [
        Paragraph("<b>1.2</b>", body_style),
        Paragraph("<b>Select Target Month</b><br/>Open the <b>Featured Design Scheduler</b> tab. Choose the target month from the dropdown (e.g. Month 7: August / Q3 Showcase).", body_style),
        Paragraph("System loads existing headline, theme keywords, and currently featured design IDs.", body_style)
    ],
    [
        Paragraph("<b>1.3</b>", body_style),
        Paragraph("<b>Select / Reorder Featured Designs</b><br/>Toggle the checkboxes on the design catalog cards you want to spotlight (recommended 4 to 8 designs).", body_style),
        Paragraph("Designs with event keyword matches (e.g. Labor Day, Grandparents Day) automatically show event badges.", body_style)
    ],
    [
        Paragraph("<b>1.4</b>", body_style),
        Paragraph("<b>Save Schedule to Database</b><br/>Click the green <b>Save Schedule</b> button. Confirm the success toast notification appears.", body_style),
        Paragraph("Updates <code>public.featured_schedules</code> in Supabase in real-time.", body_style)
    ],
    [
        Paragraph("<b>1.5</b>", body_style),
        Paragraph("<b>Verify Storefront Live View</b><br/>Visit the public homepage (<code>/</code>). Verify the Featured Designs section immediately renders the newly scheduled designs.", body_style),
        Paragraph("<b>Fallback Hierarchy:</b> Admin Scheduled &gt; Q3 Event Match &gt; First 8 Active.", body_style)
    ],
]

t_sop1 = Table(sop1_steps, colWidths=[0.6 * inch, 4.4 * inch, 2.5 * inch])
t_sop1.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('TOPPADDING', (0, 0), (-1, -1), 3.5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
]))
story.append(t_sop1)

story.append(Paragraph(
    "<b>Important Guardrail:</b> Temporarily hidden designs (e.g., <i>'Adulting Is Hard'</i>, <i>'World Takes All the Credit'</i>, <i>'CEOs of Chaos'</i>, <i>'Snacks Are Currency'</i>) are globally filtered via <code>src/lib/designConstants.ts</code> and will not be displayed in shop grids.",
    important_style
))

# Page Break for Clean Split
story.append(PageBreak())

# Section 2: PlayIQ Beta Tester Onboarding
story.append(Paragraph("3. SOP-02: Dispatching Beta Tester Welcome & Setup Guide (PlayIQ)", h1_style))
story.append(Paragraph(
    "Administrators can dispatch complete onboarding packages—including the branded welcome letter, beta fee waiver promo code, and the 6-page <code>Parent_Setup_Guide.pdf</code> attachment—directly from the PlayIQ Admin Dashboard using Amazon SES.",
    body_style
))

story.append(Paragraph("Method A: 1-Click Send for Registered Applicants in Cohort Table", h2_style))
story.append(Paragraph(
    "1. Navigate to <b>Admin Home</b> at <code>/admin/home</code>.<br/>"
    "2. Scroll down to the <b>Cohort Manifest Table</b> (<code>COHORT_TABLE_MANIFEST</code>).<br/>"
    "3. Locate the applicant row (filter by <i>Paid</i>, <i>Started</i>, <i>Promo</i>, or <i>All</i>).<br/>"
    "4. Click the blue <b><code>Send Guide</code></b> button in the <b>Action</b> column.<br/>"
    "5. The system automatically pulls the parent's email, parent name, and linked student name, and attaches <code>Parent_Setup_Guide.pdf</code>. A green <b><code>Sent!</code></b> badge confirms delivery.",
    callout_style
))

story.append(Paragraph("Method B: Quick Dispatch Modal for New / External Beta Testers", h2_style))
story.append(Paragraph(
    "1. In <code>/admin/home</code>, click the purple <b><code>+ Dispatch Beta Email</code></b> button above the table.<br/>"
    "2. Enter the <b>Recipient Email</b> (e.g., <code>mystiquen21@gmail.com</code>).<br/>"
    "3. Enter the <b>Parent Name</b> (e.g., <i>Mystique</i>) and optional <b>Student Name</b> (e.g., <i>Lyric</i>).<br/>"
    "4. Verify the <b>Promo / Waiver Code</b> (defaults to <code>PLAYIQ2025</code>).<br/>"
    "5. Click <b><code>Send Beta Package</code></b>. Live status updates will confirm delivery and display the Amazon SES Message ID.",
    tip_style
))

# Section 3: Beta Tester Communication Standards
story.append(Paragraph("4. Beta Tester Package Reference & Defaults", h1_style))

specs_data = [
    [Paragraph("<b>Item</b>", body_style), Paragraph("<b>Specification / Content</b>", body_style)],
    [Paragraph("Email Sender", body_style), Paragraph("<code>\"WePlayIQ\" &lt;sender@weplayiq.com&gt;</code> (via Amazon SES us-east-1)", code_style)],
    [Paragraph("Reply-To Address", body_style), Paragraph("<code>support@weplayiq.com</code>", code_style)],
    [Paragraph("Default Promo Code", body_style), Paragraph("<b>PLAYIQ2025</b> (Waives all enrollment &amp; platform onboarding fees)", body_style)],
    [Paragraph("Attached Guide", body_style), Paragraph("<code>public/Parent_Setup_Guide.pdf</code> (Visual walkthrough of pilot application, provisioning, and teen login)", body_style)],
    [Paragraph("Parent Access URL", body_style), Paragraph("<code>https://weplayiq.com</code> &rarr; Click <i>\"Apply for Pilot Access\"</i>", code_style)],
    [Paragraph("Student Login URL", body_style), Paragraph("<code>https://weplayiq.com/login</code> &rarr; Select <i>Student</i> tab (no student email needed)", code_style)],
]

t_specs = Table(specs_data, colWidths=[1.8 * inch, 5.7 * inch])
t_specs.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('TOPPADDING', (0, 0), (-1, -1), 3),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
]))
story.append(t_specs)
story.append(Spacer(1, 6))

# Section 4: Troubleshooting & Incident Escalation
story.append(Paragraph("5. Troubleshooting & Admin Escalation", h1_style))

trouble_data = [
    [Paragraph("<b>Issue Observed</b>", body_style), Paragraph("<b>Root Cause</b>", body_style), Paragraph("<b>Remediation Step</b>", body_style)],
    [
        Paragraph("Email shows <i>Retry</i> error", body_style),
        Paragraph("Invalid email syntax or AWS SES sandbox unverified address.", body_style),
        Paragraph("Check recipient email spelling. Verify sending domain in AWS SES console.", body_style)
    ],
    [
        Paragraph("Parent cannot provision teen", body_style),
        Paragraph("Parent has not registered / completed application form.", body_style),
        Paragraph("Instruct parent to visit <code>weplayiq.com</code> and apply with code <code>PLAYIQ2025</code>.", body_style)
    ],
    [
        Paragraph("Featured schedule not updating", body_style),
        Paragraph("Admin session expired or network timeout.", body_style),
        Paragraph("Refresh <code>/admin/dashboard</code>, re-authenticate, and click <i>Save Schedule</i> again.", body_style)
    ],
]

t_trouble = Table(trouble_data, colWidths=[2.1 * inch, 2.5 * inch, 2.9 * inch])
t_trouble.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f8fafc")),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('TOPPADDING', (0, 0), (-1, -1), 3),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
]))
story.append(t_trouble)

doc.build(story, canvasmaker=NumberedCanvas)
print("Admin SOP PDF generated successfully at:", pdf_path)
