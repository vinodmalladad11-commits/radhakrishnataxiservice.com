from pathlib import Path

root = Path(r"c:\Users\sanja\OneDrive\Documents\radhakrishnataxiservice.com")
replacements = {
    'â˜°': '☰',
    'â€¢': '•',
    'â€”': '—',
    'â†’': '→',
    'ðŸ“±': '📞',
    'ðŸ“§': '📧',
    'âœ“': '✓',
    'âœˆ': '✈',
    'âŒ–': '⌖',
    'â™§': '♧',
    'â€˜': '‘',
    'â€™': '’',
    'â€“': '–',
    'â—”': '◔',
    'Â©': '©',
    'Â·': '·',
    'â€': '“',
    'â€': '”',
    'â‚¹': '₹',
    'ã€™': '’',
    'ã¢': '…',
    'â€™': '’',
    'â€\u200b': '“',
    'â€\u00a0': '“',
    'ï¸': '',
    'Ã': 'A',
    'ã': 'a',
}

for p in root.rglob('*'):
    if p.is_file() and p.suffix.lower() in {'.html', '.css', '.js', '.md'}:
        raw = p.read_bytes()
        try:
            text = raw.decode('utf-8')
        except UnicodeDecodeError:
            text = raw.decode('cp1252')
        for bad, good in replacements.items():
            text = text.replace(bad, good)
        p.write_text(text, encoding='utf-8')

print('encoding fixed')
