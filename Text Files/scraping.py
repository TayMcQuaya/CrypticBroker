from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import os
import time

# Get the script directory
script_dir = os.path.dirname(os.path.abspath(__file__))

# URL of the Formstack form
url = "https://outlierventuresapp.formstack.com/forms/applications"

# Output file path in the same directory as the script
output_file = os.path.join(script_dir, "formstack_form_content.txt")

# Use Playwright to render the form
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)  # Headless Chromium
    page = browser.new_page()
    page.goto(url)
    page.wait_for_timeout(5000)  # Wait 5 seconds for initial load

    # Get the HTML content
    html = page.content()
    soup = BeautifulSoup(html, 'html.parser')
    form = soup.find('form')

    # Find all sections (try 'fsSection' class first, then fall back to fieldsets or the form itself)
    sections = form.find_all('div', class_='fsSection') if form else []
    if not sections:
        sections = form.find_all('fieldset') if form else []
    if not sections:
        sections = [form] if form else []

    # Debug: Print how many sections were found
    print(f"Found {len(sections)} sections.")

    # Write the scraped content to the output file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(f"Form URL: {url}\n")
        f.write(f"Scraped on: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Total Sections Detected: {len(sections)}\n")
        f.write("=" * 50 + "\n\n")

        if form and soup.title:
            f.write(f"Form Title: {soup.title.text.strip()}\n\n")

        # Process each section
        for section_num, section in enumerate(sections, 1):
            f.write(f"Section {section_num}:\n")
            f.write("-" * 20 + "\n")

            # Find all spans containing question text instead of labels
            spans = section.find_all('span')
            for span in spans:
                question_text = span.text.strip()
                if question_text:  # Only process if there's text
                    # Check if the question is required
                    is_required = "*" in question_text or span.find(class_='fsRequired') or span.find('span', class_='required')
                    if is_required:
                        question_text = question_text.replace("*", "").strip() + " (Required)"

                    f.write(f"Question: {question_text}\n")

                    # Find the associated input element (next input, select, or textarea)
                    input_element = span.find_next(['input', 'select', 'textarea'])

                    if input_element:
                        input_type = input_element.name
                        if input_type == 'input':
                            field_type = input_element.get('type', 'text')
                            f.write(f"Type: {field_type.capitalize()}\n")
                            if field_type in ['checkbox', 'radio']:
                                group_name = input_element.get('name')
                                options = form.find_all('input', {'name': group_name})
                                f.write("Options:\n")
                                for opt in options:
                                    # Look for a nearby label or use fallback text
                                    opt_label = opt.find_next('label').text.strip() if opt.find_next('label') else "Unknown"
                                    f.write(f"  - {opt_label}\n")
                        elif input_type == 'select':
                            f.write("Type: Dropdown\n")
                            options = input_element.find_all('option')
                            f.write("Options:\n")
                            for opt in options:
                                if opt.get('value'):
                                    f.write(f"  - {opt.text.strip()}\n")
                        elif input_type == 'textarea':
                            f.write("Type: Paragraph Text\n")
                        else:
                            f.write("Type: Unknown\n")
                    else:
                        f.write("Type: Not Found\n")
                    f.write("\n")

        f.write("=" * 50 + "\n")

    browser.close()

print(f"Form content saved to {output_file}")