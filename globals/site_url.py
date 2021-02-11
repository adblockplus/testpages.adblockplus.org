import os

# Overrides `siteurl` from `settings.ini`, allowing multiple domain builds
site_url = os.getenv('SITE_URL', 'localhost:5000')
