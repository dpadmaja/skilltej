import requests
import json

try:
    response = requests.get('http://localhost:8000/api/certifications')
    certs = response.json()
    print(f'Total certifications: {len(certs)}')
    for i, cert in enumerate(certs[:5]):
        print(f"{i+1}. {cert['name']} - {cert['cert_type']} - {cert.get('difficulty_level', 'N/A')}")
except Exception as e:
    import traceback
    traceback.print_exc()
