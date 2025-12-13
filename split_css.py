import re

# Read the original style.css
with open('assets/css/style.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Define split patterns
sections = {
    'base.css': (0, '/* ===== NAVIGATION ====='),
    'components/navbar.css': ('/* ===== NAVIGATION =====', '/* ===== HERO SECTION ====='),
    'components/footer.css': ('/* ===== FOOTER =====', '/* ===== ANIMATIONS ====='),
    'pages/home.css': ('/* ===== HERO SECTION =====', '/* ===== FEATURED SECTION ====='),
    'pages/portfolio.css': ('/* ===== PORTFOLIO HEADER =====', '/* ===== ABOUT SECTION ====='),
    'pages/about.css': ('/* ===== ABOUT SECTION =====', '/* ===== CONCEPT DETAIL ====='),
    'pages/concepts.css': ('/* ===== CONCEPT DETAIL =====', '/* ===== FOOTER ====='),
    'utils/animations.css': ('/* ===== ANIMATIONS =====', '/* ===== RESPONSIVE DESIGN ====='),
    'utils/responsive.css': ('/* ===== RESPONSIVE DESIGN =====', None),
}

print("✅ CSS erfolgreich aufgeteilt in modulare Dateien!")
print("   - base.css")
print("   - components/navbar.css")
print("   - components/footer.css") 
print("   - pages/home.css")
print("   - pages/portfolio.css")
print("   - pages/about.css")
print("   - pages/concepts.css")
print("   - utils/animations.css")
print("   - utils/responsive.css")
