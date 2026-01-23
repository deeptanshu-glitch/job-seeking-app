import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

function CollapsibleExample() {
  return (
    <Navbar collapseOnSelect expand="lg" className="bg-transparent" variant='light'>
      <Container>
        <Navbar.Brand >🔍Job Finder</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="justify-content-center gap-lg-5 mx-auto">
            <Nav.Link href="/dashboard">Home</Nav.Link>
            <Nav.Link href="/location">Location</Nav.Link>
            <Nav.Link href="/Industry">Industry</Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link href="/profile">profile</Nav.Link>
            <Nav.Link eventKey={2} href="/signout">
              Signout
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default CollapsibleExample;