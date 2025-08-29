import os
import json
import re

def generate_html_from_file(content, file_name):
    """Generate HTML content based on file name conventions."""
    
    image_path = None
    caption_lines = []
    content_lines = content.split('\n')
    
    # Check for image directive
    if content_lines and content_lines[0].lower().startswith('image:'):
        image_path = content_lines[0].split(':', 1)[1].strip()
        caption_lines = content_lines[1:]
        caption = '\n'.join(caption_lines).strip()

        # Generate alt text from caption or filename
        alt_text = caption if caption else file_name.replace(".txt", "").replace("_", " ").title()
        
        # Basic styling for responsive images
        html = f'<img src="{image_path}" alt="{alt_text}" style="width:100%; height:auto; border-radius: 4px;">'
        if caption:
            # Add a caption below the image
            html += f'<p style="text-align: center; font-style: italic; margin-top: 0.5rem; font-size: 0.9em;">{caption}</p>'
        return f'<div class="content">{html}</div>'

    if file_name == 'address.txt':
        return f'<div class="content"><a href="https://maps.google.com/?q={content}">{content}</a></div>'
    elif file_name == 'email.txt':
        return f'<div class="content"><a href="mailto:{content}">{content}</a></div>'
    elif file_name == 'phone.txt':
        # Simple regex to remove non-numeric characters for the tel: link
        tel_link = re.sub(r'[\D]', '', content)
        return f'<div class="content"><a href="tel:{tel_link}">{content}</a></div>'
    elif file_name == 'hours.txt':
        table_rows = ''
        special_notes = ''
        for line in content.split('\n'):
            if ':' in line:
                day, hours = line.split(':', 1)
                # Check for special notes like Christmas Eve
                if day.lower().strip() not in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']:
                    special_notes += f'<div class="hours-note">{day}: {hours.strip()}</div>'
                else:
                    table_rows += f'<tr><td>{day.strip()}</td><td>{hours.strip()}</td></tr>'
        return f'''
            <div class="content">
                <table class="hours-table">
                    <thead><tr><th>Day</th><th>Hours</th></tr></thead>
                    <tbody>{table_rows}</tbody>
                </table>
                {special_notes}
            </div>
        '''
    else:
        # Default case for generic text files
        return f'<p>{content}</p>'


def main():
    """Scan the components directory and generate components.json."""
    components_dir = 'components'
    output_data = {
        "components": {},
        "aliases": {},
        "defaultPinned": ["Hours of Operation", "Address", "Email", "Phone"]
    }

    for file_name in os.listdir(components_dir):
        if file_name.endswith('.txt'):
            file_path = os.path.join(components_dir, file_name)
            
            with open(file_path, 'r') as f:
                lines = f.readlines()
            
            content_lines = []
            keywords = ''
            for line in lines:
                if line.strip().lower().startswith('keywords:'):
                    keywords = line.strip().split(':', 1)[1].strip()
                else:
                    content_lines.append(line)
            
            content = ''.join(content_lines).strip()

            # Create component name from file name (e.g., hours.txt -> Hours)
            base_name = file_name.replace('.txt', '')
            component_name = base_name.replace('_', ' ').replace('-', ' ').title()
            
            # Special case for Contact Us
            if component_name == 'Contact':
                component_name = 'Contact Us'
            elif component_name == 'Joke':
                component_name = 'Random Joke'
            elif component_name == 'Hours':
                component_name = 'Hours of Operation'

            html_content = generate_html_from_file(content, file_name)
            
            output_data["components"][component_name] = {
                "content": html_content,
                "keywords": keywords
            }
            output_data["aliases"][component_name] = base_name

    with open('components.json', 'w') as f:
        json.dump(output_data, f, indent=4)
    
    print("Successfully generated components.json")

if __name__ == '__main__':
    main()