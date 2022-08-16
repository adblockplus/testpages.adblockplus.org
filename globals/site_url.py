import os

# Overrides `siteurl` from `settings.ini`, allowing multiple domain builds
site_url = os.getenv('SITE_URL', 'http://localhost:5001')
