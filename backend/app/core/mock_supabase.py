class MockSupabaseResponse:
    def __init__(self, data=None, user=None, session=None):
        self.data = data or []
        self.user = user
        self.session = session


class MockSupabaseBuilder:
    def __init__(self):
        self._data = []
    
    def select(self, *args, **kwargs):
        return self
    
    def eq(self, *args, **kwargs):
        return self
    
    def or_(self, *args, **kwargs):
        return self
    
    def order(self, *args, **kwargs):
        return self
    
    def range(self, start, end):
        return self
    
    def insert(self, data):
        return self
    
    def update(self, data):
        return self
    
    def execute(self):
        return MockSupabaseResponse(self._data)


class MockUser:
    def __init__(self, email):
        self.id = "mock-user-id-12345"
        self.email = email
        self.user_metadata = {}

class MockSession:
    def __init__(self):
        self.access_token = "mock-access-token-jwt"
        self.refresh_token = "mock-refresh-token"
        self.token_type = "bearer"

class MockSupabaseAuth:
    def sign_up(self, credentials):
        email = credentials.get("email")
        return MockSupabaseResponse(
            user=MockUser(email),
            session=MockSession()
        )
        
    def sign_in_with_password(self, credentials):
        email = credentials.get("email")
        return MockSupabaseResponse(
            user=MockUser(email),
            session=MockSession()
        )

class MockSupabaseClient:
    def __init__(self):
        self.auth = MockSupabaseAuth()

    def table(self, table_name: str):
        return MockSupabaseBuilder()
    
    def from_(self, table_name: str):
        return MockSupabaseBuilder()
