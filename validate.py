#!/usr/bin/env python3
"""
Portfolio Website Validator
Checks that all referenced assets exist and HTML is well-formed
"""

import os
import re
from pathlib import Path

def check_file_exists(filepath, referenced_from):
    """Check if a file exists and report if missing"""
    if os.path.exists(filepath):
        print(f"✓ {filepath}")
        return True
    else:
        print(f"✗ MISSING: {filepath} (referenced in {referenced_from})")
        return False

def validate_html(html_file):
    """Validate HTML file and check referenced assets"""
    print(f"\n{'='*60}")
    print(f"Validating {html_file}")
    print(f"{'='*60}\n")

    if not os.path.exists(html_file):
        print(f"✗ ERROR: {html_file} not found")
        return False

    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    base_dir = os.path.dirname(html_file) or '.'
    all_valid = True

    # Check CSS files
    print("\nChecking CSS files:")
    css_pattern = r'<link[^>]+href=["\']([^"\']+\.css)["\']'
    css_files = re.findall(css_pattern, content)
    for css_file in css_files:
        filepath = os.path.join(base_dir, css_file)
        if not check_file_exists(filepath, html_file):
            all_valid = False

    # Check JavaScript files
    print("\nChecking JavaScript files:")
    js_pattern = r'<script[^>]+src=["\']([^"\']+\.js)["\']'
    js_files = re.findall(js_pattern, content)
    for js_file in js_files:
        filepath = os.path.join(base_dir, js_file)
        if not check_file_exists(filepath, html_file):
            all_valid = False

    # Check image files
    print("\nChecking image files:")
    img_pattern = r'<img[^>]+src=["\']([^"\']+)["\']'
    img_files = re.findall(img_pattern, content)
    for img_file in img_files:
        filepath = os.path.join(base_dir, img_file)
        # Skip external URLs
        if img_file.startswith('http'):
            continue
        if not check_file_exists(filepath, html_file):
            all_valid = False

    # Check basic HTML structure
    print("\nChecking HTML structure:")
    checks = [
        ('<!DOCTYPE', 'DOCTYPE declaration'),
        ('<html', 'HTML tag'),
        ('<head>', 'Head section'),
        ('<title>', 'Title tag'),
        ('<body', 'Body tag'),
        ('</html>', 'Closing HTML tag'),
    ]

    for pattern, name in checks:
        if pattern in content:
            print(f"✓ {name} found")
        else:
            print(f"✗ MISSING: {name}")
            all_valid = False

    # Check meta tags
    print("\nChecking meta tags:")
    meta_checks = [
        ('charset', 'Character encoding'),
        ('viewport', 'Viewport meta tag'),
        ('description', 'Description meta tag'),
    ]

    for tag, name in meta_checks:
        if tag in content:
            print(f"✓ {name} found")
        else:
            print(f"⚠ WARNING: {name} not found")

    return all_valid

def main():
    """Main validation function"""
    print("\n" + "="*60)
    print("Portfolio Website Validation")
    print("="*60)

    # Check main HTML file
    html_valid = validate_html('index.html')

    # Check Netlify configuration
    print("\n" + "="*60)
    print("Checking Netlify Configuration")
    print("="*60 + "\n")

    netlify_files = ['netlify.toml', '_redirects']
    netlify_valid = True

    for file in netlify_files:
        if check_file_exists(file, 'deployment'):
            pass
        else:
            netlify_valid = False

    # Check custom assets
    print("\n" + "="*60)
    print("Checking Custom Assets")
    print("="*60 + "\n")

    custom_files = [
        'assets/js/particles.js',
        'assets/js/sound-effects.js',
        'assets/js/enhanced-animations.js',
        'assets/css/custom-enhancements.css',
    ]

    custom_valid = True
    for file in custom_files:
        if not check_file_exists(file, 'custom features'):
            custom_valid = False

    # Final report
    print("\n" + "="*60)
    print("Validation Summary")
    print("="*60 + "\n")

    if html_valid and netlify_valid and custom_valid:
        print("✓ All validations passed!")
        print("\nYour portfolio is ready for deployment to Netlify!")
        return 0
    else:
        print("✗ Some validations failed. Please fix the issues above.")
        return 1

if __name__ == '__main__':
    exit(main())
