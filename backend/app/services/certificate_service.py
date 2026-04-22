"""
Certificate Generation Service
Generates professional PDF certificates for exam completions
"""

from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.units import inch, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageTemplate, Frame, PageBreak
from reportlab.pdfgen import canvas
from datetime import datetime
from io import BytesIO
from PIL import Image as PILImage, ImageDraw, ImageFont
import os
from pathlib import Path


class CertificateService:
    """Service for generating certification certificates in PDF format"""
    
    # Certificate dimensions
    CERT_WIDTH = 11 * inch  # 11 inches (landscape)
    CERT_HEIGHT = 8.5 * inch  # 8.5 inches (landscape)
    
    # Colors
    PRIMARY_COLOR = HexColor('#0369a1')  # Cyan-600
    ACCENT_COLOR = HexColor('#00d9ff')  # Cyan-300
    TEXT_COLOR = HexColor('#0f172a')  # Slate-900
    
    @staticmethod
    def generate_certificate(
        recipient_name: str,
        skill_title: str,
        proficiency_level: str = "Professional",
        issue_date: datetime = None,
        organization_name: str = "Skilltej",
        exam_score: float = None
    ) -> BytesIO:
        """
        Generate a professional certificate PDF
        
        Args:
            recipient_name: Full name of the recipient
            skill_title: Title of the certification/skill
            proficiency_level: Proficiency level (Beginner, Intermediate, Expert, Professional)
            issue_date: Date the certificate was issued
            organization_name: Name of the issuing organization
            exam_score: Score achieved on the exam
            
        Returns:
            BytesIO: PDF file content as bytes
        """
        
        if issue_date is None:
            issue_date = datetime.now()
        
        # Create a BytesIO buffer
        pdf_buffer = BytesIO()
        
        # Create PDF with custom canvas
        pdf = SimpleDocTemplate(
            pdf_buffer,
            pagesize=(CertificateService.CERT_WIDTH, CertificateService.CERT_HEIGHT),
            topMargin=0,
            bottomMargin=0,
            leftMargin=0,
            rightMargin=0
        )
        
        # Use custom canvas to draw certificate
        pdf.build(
            [],
            canvasmaker=lambda filename: CertificateService._CertificateCanvas(
                filename,
                pagesize=(CertificateService.CERT_WIDTH, CertificateService.CERT_HEIGHT),
                recipient_name=recipient_name,
                skill_title=skill_title,
                proficiency_level=proficiency_level,
                issue_date=issue_date,
                organization_name=organization_name,
                exam_score=exam_score
            )
        )
        
        pdf_buffer.seek(0)
        return pdf_buffer
    
    class _CertificateCanvas(canvas.Canvas):
        """Custom canvas for drawing the certificate"""
        
        def __init__(self, filename, pagesize, recipient_name, skill_title, 
                     proficiency_level, issue_date, organization_name, exam_score, **kwargs):
            super().__init__(filename, pagesize=pagesize, **kwargs)
            self.pageWidth, self.pageHeight = pagesize
            self.recipient_name = recipient_name
            self.skill_title = skill_title
            self.proficiency_level = proficiency_level
            self.issue_date = issue_date
            self.organization_name = organization_name
            self.exam_score = exam_score
            
            # Draw certificate
            self._draw_certificate()
        
        def _draw_certificate(self):
            """Draw the complete certificate"""
            w = self.pageWidth
            h = self.pageHeight
            
            # Draw decorative border
            self._draw_border(w, h)
            
            # Draw header section
            self._draw_header(w, h)
            
            # Draw title
            self._draw_title(w, h)
            
            # Draw recipient name
            self._draw_recipient_name(w, h)
            
            # Draw recognition text
            self._draw_recognition_text(w, h)
            
            # Draw skill/technology details
            self._draw_skill_details(w, h)
            
            # Draw footer section with signatures and date
            self._draw_footer(w, h)
            
            # Draw decorative elements
            self._draw_decorations(w, h)
            
            self.save()
        
        def _draw_border(self, w, h):
            """Draw decorative border"""
            # Outer border
            self.setLineWidth(3)
            self.setStrokeColor(HexColor('#0369a1'))  # Cyan-600
            self.rect(0.3 * inch, 0.3 * inch, w - 0.6 * inch, h - 0.6 * inch)
            
            # Inner border
            self.setLineWidth(1)
            self.setStrokeColor(HexColor('#00d9ff'))  # Cyan-300
            self.rect(0.4 * inch, 0.4 * inch, w - 0.8 * inch, h - 0.8 * inch)
        
        def _draw_header(self, w, h):
            """Draw header with logo and organization name"""
            # Organization name
            self.setFont("Helvetica-Bold", 24)
            self.setFillColor(HexColor('#0369a1'))
            self.drawCentredString(w/2, h - 0.8 * inch, self.organization_name)
            
            # Subtitle
            self.setFont("Helvetica", 12)
            self.setFillColor(HexColor('#64748b'))  # Gray-500
            self.drawCentredString(w/2, h - 1.1 * inch, "Professional Certification")
        
        def _draw_title(self, w, h):
            """Draw certificate title"""
            self.setFont("Helvetica-Bold", 32)
            self.setFillColor(HexColor('#0f172a'))  # Slate-900
            self.drawCentredString(w/2, h - 1.8 * inch, "Certificate of Appreciation")
        
        def _draw_recipient_name(self, w, h):
            """Draw recipient name prominently"""
            self.setFont("Helvetica-Bold", 28)
            self.setFillColor(HexColor('#0369a1'))
            self.drawCentredString(w/2, h - 2.8 * inch, self.recipient_name)
            
            # Underline for name
            name_y = h - 2.95 * inch
            name_width = len(self.recipient_name) * 8
            self.setLineWidth(2)
            self.setStrokeColor(HexColor('#00d9ff'))
            self.line(w/2 - name_width/2 - 0.3*inch, name_y, w/2 + name_width/2 + 0.3*inch, name_y)
        
        def _draw_recognition_text(self, w, h):
            """Draw recognition text"""
            text = "FOR SUCCESSFUL COMPLETION OF ASSESSMENT ON"
            self.setFont("Helvetica", 11)
            self.setFillColor(HexColor('#0f172a'))
            self.drawCentredString(w/2, h - 3.4 * inch, text)
        
        def _draw_skill_details(self, w, h):
            """Draw skill and technology details"""
            # Skill/Technology title
            self.setFont("Helvetica-Bold", 16)
            self.setFillColor(HexColor('#0369a1'))
            self.drawCentredString(w/2, h - 4.0 * inch, self.skill_title)
            
            # Proficiency level
            self.setFont("Helvetica", 11)
            self.setFillColor(HexColor('#64748b'))
            proficiency_text = f"Proficiency Level: {self.proficiency_level}"
            self.drawCentredString(w/2, h - 4.5 * inch, proficiency_text)
            
            # Exam score if available
            if self.exam_score is not None:
                self.setFont("Helvetica", 11)
                score_text = f"Score: {self.exam_score:.1f}%"
                self.drawCentredString(w/2, h - 4.95 * inch, score_text)
        
        def _draw_footer(self, w, h):
            """Draw footer with date and issuing authority"""
            # Date of issue
            date_str = self.issue_date.strftime("%B %d, %Y")
            self.setFont("Helvetica", 10)
            self.setFillColor(HexColor('#64748b'))
            self.drawString(0.8 * inch, 0.8 * inch, f"Date of Issue: {date_str}")
            
            # Issuing Authority
            self.drawRightString(w - 0.8 * inch, 0.8 * inch, f"Issued by: {self.organization_name}")
            
            # Signature lines
            sig_y = 1.2 * inch
            line_length = 1.2 * inch
            line_width = 1
            
            self.setLineWidth(line_width)
            self.setStrokeColor(HexColor('#0f172a'))
            
            # Left signature
            left_x = 1.0 * inch
            self.line(left_x, sig_y, left_x + line_length, sig_y)
            self.setFont("Helvetica", 9)
            self.setFillColor(HexColor('#64748b'))
            self.drawCentredString(left_x + line_length/2, sig_y - 0.3 * inch, "Authorized Signatory")
            
            # Right signature
            right_x = w - 1.0 * inch - line_length
            self.line(right_x, sig_y, right_x + line_length, sig_y)
            self.drawCentredString(right_x + line_length/2, sig_y - 0.3 * inch, "Director, Skilltej")
        
        def _draw_decorations(self, w, h):
            """Draw decorative elements"""
            # Top left decoration
            self.setFillColor(HexColor('#00d9ff'))
            self.circle(0.6 * inch, h - 0.6 * inch, 0.1 * inch, fill=1)
            
            # Top right decoration
            self.circle(w - 0.6 * inch, h - 0.6 * inch, 0.1 * inch, fill=1)
            
            # Bottom left decoration
            self.circle(0.6 * inch, 0.6 * inch, 0.1 * inch, fill=1)
            
            # Bottom right decoration
            self.circle(w - 0.6 * inch, 0.6 * inch, 0.1 * inch, fill=1)
            
            # Side accent lines
            accent_color = HexColor('#0369a1')
            self.setStrokeColor(accent_color)
            self.setLineWidth(2)
            # Left accent
            self.line(0.5 * inch, h - 2 * inch, 0.5 * inch, h - 4 * inch)
            # Right accent
            self.line(w - 0.5 * inch, h - 2 * inch, w - 0.5 * inch, h - 4 * inch)


# Utility functions for different proficiency levels
def get_proficiency_from_score(score: float) -> str:
    """Determine proficiency level from exam score"""
    if score >= 90:
        return "Expert"
    elif score >= 75:
        return "Intermediate"
    else:
        return "Beginner"
