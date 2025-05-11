from main import app

# Vercel için serverless handler
def handler(request, context):
    return app 