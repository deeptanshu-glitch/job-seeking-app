import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './login.css'

function BasicExample() {
  return (
    <div className="plain-bg">
      <div className="form-wrapper">
    <Form className='login-form'>
      <Form.Group className="mb-3" controlId="formBasicUsername">
        <Form.Label>Username</Form.Label>
        <Form.Control type="text" placeholder="Enter Username" />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" placeholder="Password" />
      </Form.Group>
      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
    </div>
  </div>
  );
}

export default BasicExample;