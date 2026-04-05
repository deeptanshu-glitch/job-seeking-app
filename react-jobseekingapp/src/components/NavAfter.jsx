import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

import {Link} from 'react-router-dom'


function CollapsibleExample() {
  return (
    <Navbar collapseOnSelect expand="lg" className="bg-transparent " variant='light'style={{'borderBottom': '1px solid rgba(0, 0, 0, 0.4)'}}>
      <Container>
        <Navbar.Brand >🔍Job Finder</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="justify-content-center gap-lg-5 ms-auto">
            <Nav.Link as={Link} to="/dashboard">Home</Nav.Link>
            <input type="text" placeholder="Search for jobs" style={{'borderRadius':'4px','marginRight':'5px','textAlign':'center'}}/>
          </Nav>
          <Nav>
            <Nav.Link as={Link} to="/post" style={
              {
                backgroundColor: 'red',
                borderRadius: '15px',
                color: 'white',
                margin: '4px',
               animation: 'pulse 2s infinite'
              }
              }>
              Post a Job
            </Nav.Link>
            <Nav.Link as={Link} to="/profile" style={
              {
                backgroundColor: 'blue',
                borderRadius: '15px',
                color: 'white',
                margin: '1px',
               animation: 'pulse 2s infinite'
              }
            }
              >profile</Nav.Link>
            
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar >
  );
}

export default CollapsibleExample;