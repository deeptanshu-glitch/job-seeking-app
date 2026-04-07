import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';


import { Link, useNavigate } from 'react-router-dom'
import Cookies from "js-cookie";

function CollapsibleExample() {
  const navigate = useNavigate();
  const userCookie = Cookies.get("user");
  const user = userCookie ? JSON.parse(userCookie) : null;
  const role = user?.role || 'job seeker';

  const handleSignout = () => {
    Cookies.remove("token");
    Cookies.remove("user");
    navigate("/");
  };

  return (
    <Navbar collapseOnSelect expand="lg" className="bg-transparent " variant='light' style={{ 'borderBottom': '1px solid rgba(0, 0, 0, 0.4)' }}>
      <Container>
        <Navbar.Brand >🔍Job Finder</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="justify-content-center gap-lg-5 ms-auto">
            <Nav.Link as={Link} to="/dashboard">Home</Nav.Link>
            {role !== 'recruiter' && (
              <input type="text" placeholder="Search for jobs" style={{ 'borderRadius': '4px', 'marginRight': '5px', 'textAlign': 'center' }} />
            )}
          </Nav>
          <Nav>
            {role === 'recruiter' ? (
              <Nav.Link as={Link} to="/post" style={
                {
                  backgroundColor: 'red',
                  borderRadius: '15px',
                  color: 'white',
                  margin: '4px',
                  animation: 'pulse 2s infinite'
                }
              }>
                Recruiter Dashboard
              </Nav.Link>
            ) : (
              <Nav.Link as={Link} to="/profile" style={
                {
                  backgroundColor: 'blue',
                  borderRadius: '15px',
                  color: 'white',
                  margin: '1px',
                  animation: 'pulse 2s infinite'
                }
              }
              >Profile</Nav.Link>
            )}

            <button
              onClick={handleSignout}
              style={{
                backgroundColor: '#dc2626',
                border: '1px solid #dc2626',
                borderRadius: '15px',
                color: 'white',
                marginLeft: '15px',
                padding: '0 15px',
                fontWeight: '600'
              }}
            >
              Sign Out
            </button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar >
  );
}

export default CollapsibleExample;