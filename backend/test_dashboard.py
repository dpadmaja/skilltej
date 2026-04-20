import requests
import json

try:
    # First, create a test user and get a token
    signup_data = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "test123",
        "full_name": "Test User"
    }
    
    signup_response = requests.post('http://localhost:8000/api/auth/signup', json=signup_data)
    print(f'Signup Status: {signup_response.status_code}')
    
    if signup_response.status_code in [200, 201]:
        token = signup_response.json().get('access_token')
        print(f'Got token: {token[:20]}...' if token else 'No token in response')
        
        # Now test dashboard with auth
        headers = {'Authorization': f'Bearer {token}'}
        dashboard_response = requests.get('http://localhost:8000/api/dashboard', headers=headers)
        print(f'Dashboard Status: {dashboard_response.status_code}')
        
        if dashboard_response.status_code == 200:
            dashboard = dashboard_response.json()
            print(f'Dashboard loaded successfully!')
            print(f'Total certifications available: {dashboard.get("total_certifications", 0)}')
        else:
            print(f'Dashboard error: {dashboard_response.text[:200]}')
    else:
        print(f'Signup failed: {signup_response.text[:200]}')
        
except Exception as e:
    import traceback
    traceback.print_exc()
